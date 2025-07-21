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
    // Update particle system
    this.particleSystem.update(deltaTime);

    // Process hand tracking data
    if (this.handTracker.isReady()) {
      this.processHandData();
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

  private processHandData(): void {
    const hands = this.handTracker.getHandData();
    
    // Clear previous forces
    this.particleSystem.clearAttractors();
    this.particleSystem.clearRepulsors();

    if (hands.length === 0) return;

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
    // Use palm center as main attractor
    this.particleSystem.addAttractor(hand.palmCenter.x, hand.palmCenter.y);
    
    // Add weaker attractors at finger tips
    for (const tip of hand.fingerTips) {
      this.particleSystem.addAttractor(tip.x, tip.y);
    }
  }

  private handleRepelMode(hand: HandData): void {
    // Use palm center as main repulsor
    this.particleSystem.addRepulsor(hand.palmCenter.x, hand.palmCenter.y);
    
    // Add weaker repulsors at finger tips
    for (const tip of hand.fingerTips) {
      this.particleSystem.addRepulsor(tip.x, tip.y);
    }
  }

  private handleSpawnMode(hand: HandData): void {
    // Spawn particles at pinch point (between thumb and index finger)
    if (hand.fingerTips.length >= 2) {
      const thumb = hand.fingerTips[0]; // Thumb tip
      const index = hand.fingerTips[1]; // Index finger tip
      
      const spawnPoint = {
        x: (thumb.x + index.x) / 2,
        y: (thumb.y + index.y) / 2
      };
      
      // Create a small attractor at spawn point to gather particles
      this.particleSystem.addAttractor(spawnPoint.x, spawnPoint.y);
    }
  }

  private handleExplodeMode(hand: HandData): void {
    // Create explosion at palm center
    this.particleSystem.explode(hand.palmCenter.x, hand.palmCenter.y, 1500);
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
