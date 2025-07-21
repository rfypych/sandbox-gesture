import { ParticleSystem } from '../particles/ParticleSystem';
import { HandTracker, HandData } from '../tracking/HandTracker';
import { InputManager } from '../input/InputManager';

export class Game {
  private particleSystem: ParticleSystem;
  private handTracker: HandTracker;
  private inputManager: InputManager;
  private gameMode: 'attract' | 'repel' | 'spawn' | 'explode' = 'attract';
  private lastGestureTime: number = 0;
  private gestureDelay: number = 500; // ms between gesture changes
  private score: number = 0;
  private combo: number = 0;
  private lastInteractionTime: number = 0;
  private comboTimeout: number = 2000; // ms to maintain combo

  constructor(
    particleSystem: ParticleSystem,
    handTracker: HandTracker,
    inputManager: InputManager
  ) {
    this.particleSystem = particleSystem;
    this.handTracker = handTracker;
    this.inputManager = inputManager;
    
    this.setupInputHandlers();
  }

  private setupInputHandlers(): void {
    // Mouse/touch fallback controls
    this.inputManager.onPointerDown((x, y) => {
      if (!this.handTracker.isReady() || this.handTracker.getHandCount() === 0) {
        this.particleSystem.addAttractor(x, y);
      }
    });

    this.inputManager.onPointerMove((x, y) => {
      if (this.inputManager.isPointerDown() && 
          (!this.handTracker.isReady() || this.handTracker.getHandCount() === 0)) {
        this.particleSystem.clearAttractors();
        this.particleSystem.addAttractor(x, y);
      }
    });

    this.inputManager.onPointerUp(() => {
      if (!this.handTracker.isReady() || this.handTracker.getHandCount() === 0) {
        this.particleSystem.clearAttractors();
      }
    });
  }

  public update(deltaTime: number): void {
    // Get hand tracking data
    const hands = this.handTracker.getHandData();

    // Update particle system with hand data
    this.particleSystem.updateHandData(hands);
    this.particleSystem.update(deltaTime);

    // Process hand gestures for special effects
    if (this.handTracker.isReady() && hands.length > 0) {
      this.processHandGestures(hands);
    }

    // Update scoring system
    this.updateScoring();
  }

  private updateScoring(): void {
    const currentTime = performance.now();

    // Reset combo if no interaction for too long
    if (currentTime - this.lastInteractionTime > this.comboTimeout) {
      this.combo = 0;
    }

    // Award points based on particle count and interactions
    const particleCount = this.particleSystem.getParticleCount();
    if (particleCount > 100) {
      this.score += Math.floor(particleCount / 100) * (this.combo + 1);
    }
  }

  private addScore(points: number): void {
    this.score += points * (this.combo + 1);
    this.combo++;
    this.lastInteractionTime = performance.now();
  }

  private processHandGestures(hands: HandData[]): void {
    const currentTime = performance.now();

    for (const hand of hands) {
      // Determine interaction mode based on hand gesture
      const mode = this.determineInteractionMode(hand);

      // Apply different effects based on gesture
      switch (mode) {
        case 'attract':
          this.handleAttractMode(hand);
          break;
        case 'repel':
          this.handleRepelMode(hand);
          break;
        case 'spawn':
          this.handleSpawnMode(hand);
          break;
        case 'explode':
          if (currentTime - this.lastGestureTime > this.gestureDelay) {
            this.handleExplodeMode(hand);
            this.lastGestureTime = currentTime;
          }
          break;
      }
    }
  }

  private determineInteractionMode(hand: HandData): 'attract' | 'repel' | 'spawn' | 'explode' {
    if (hand.isPinching) {
      return 'spawn';
    } else if (hand.isOpen) {
      return 'attract';
    } else {
      // Closed fist - check for quick gesture
      const fingerTipsClose = this.areFingerTipsClose(hand);
      if (fingerTipsClose) {
        return 'explode';
      } else {
        return 'repel';
      }
    }
  }

  private areFingerTipsClose(hand: HandData): boolean {
    const tips = hand.fingerTips;
    if (tips.length < 5) return false;

    // Check if all finger tips are close to each other
    const center = {
      x: tips.reduce((sum, tip) => sum + tip.x, 0) / tips.length,
      y: tips.reduce((sum, tip) => sum + tip.y, 0) / tips.length
    };

    const maxDistance = 30;
    return tips.every(tip => {
      const distance = Math.sqrt(
        Math.pow(tip.x - center.x, 2) + Math.pow(tip.y - center.y, 2)
      );
      return distance < maxDistance;
    });
  }

  private handleAttractMode(hand: HandData): void {
    // Increase energy level for attraction effect
    const settings = this.particleSystem.getSettings();
    this.particleSystem.updateSettings({
      energyLevel: Math.min(2.0, settings.energyLevel + 0.1),
      animationSpeed: Math.min(2.0, settings.animationSpeed + 0.05)
    });

    this.addScore(1); // Small continuous score for interaction
  }

  private handleRepelMode(hand: HandData): void {
    // Apply repulsion force to nearby particles
    const handParticles = this.particleSystem.getHandParticles(0); // First hand
    const auraParticles = this.particleSystem.getAuraParticles();

    const allParticles = [...handParticles, ...auraParticles];

    for (const particle of allParticles) {
      if (!particle.isAlive()) continue;

      const distance = particle.distanceTo(hand.palmCenter.x, hand.palmCenter.y);
      if (distance < 150) {
        const force = 500 / (distance + 1);
        const dx = particle.x - hand.palmCenter.x;
        const dy = particle.y - hand.palmCenter.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0) {
          particle.applyForce(
            (dx / magnitude) * force,
            (dy / magnitude) * force
          );
        }
      }
    }
  }

  private handleSpawnMode(hand: HandData): void {
    // Increase particle density and energy for spawn effect
    const settings = this.particleSystem.getSettings();
    this.particleSystem.updateSettings({
      energyLevel: Math.min(3.0, settings.energyLevel + 0.2),
      colorIntensity: Math.min(2.0, settings.colorIntensity + 0.1)
    });

    this.addScore(5); // Points for spawn gesture
  }

  private handleExplodeMode(hand: HandData): void {
    // Create explosion effect
    this.particleSystem.explode(hand.palmCenter.x, hand.palmCenter.y, 2000);

    // Temporary visual enhancement
    const settings = this.particleSystem.getSettings();
    this.particleSystem.updateSettings({
      energyLevel: 3.0,
      colorIntensity: 2.0,
      animationSpeed: 2.0
    });

    // Reset settings after a short time
    setTimeout(() => {
      this.particleSystem.updateSettings({
        energyLevel: 1.0,
        colorIntensity: 1.0,
        animationSpeed: 1.0
      });
    }, 1000);

    this.addScore(50); // Bonus points for explosion
  }

  public setGameMode(mode: 'attract' | 'repel' | 'spawn' | 'explode'): void {
    this.gameMode = mode;
  }

  public getGameMode(): string {
    return this.gameMode;
  }

  public getParticleCount(): number {
    return this.particleSystem.getParticleCount();
  }

  public resize(width: number, height: number): void {
    this.particleSystem.resize(width, height);
  }

  public getScore(): number {
    return this.score;
  }

  public getCombo(): number {
    return this.combo;
  }

  public resetScore(): void {
    this.score = 0;
    this.combo = 0;
  }
}
