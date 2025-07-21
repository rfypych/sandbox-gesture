import { Particle, Vector2, ParticleRole } from './Particle';
import { HandData } from '../tracking/HandTracker';

export interface ParticleSettings {
  particleCount: number;
  showTrails: boolean;
  showConnections: boolean;
  energyLevel: number;
  colorIntensity: number;
  animationSpeed: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private handParticles: Map<string, Particle[]> = new Map();
  private connectionParticles: Particle[] = [];
  private auraParticles: Particle[] = [];
  private width: number;
  private height: number;
  private settings: ParticleSettings;
  private lastUpdateTime: number = 0;
  private frameSkip: number = 0;

  // Hand tracking integration
  private currentHands: HandData[] = [];
  private handLandmarkMap: Map<number, ParticleRole> = new Map();

  // Performance tracking
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  constructor(width: number, height: number, settings?: Partial<ParticleSettings>) {
    this.width = width;
    this.height = height;

    // Default settings
    this.settings = {
      particleCount: this.getOptimalParticleCount(),
      showTrails: true,
      showConnections: true,
      energyLevel: 1.0,
      colorIntensity: 1.0,
      animationSpeed: 1.0,
      ...settings
    };

    this.initializeHandLandmarkMap();
    this.initializeParticles();
    this.detectPerformanceMode();
  }

  private getOptimalParticleCount(): number {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenArea = window.innerWidth * window.innerHeight;

    if (isMobile) {
      return Math.min(150, Math.floor(screenArea / 8000));
    } else {
      return Math.min(500, Math.floor(screenArea / 3000));
    }
  }

  private detectPerformanceMode(): void {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      this.performanceMode = 'low';
      return;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer.includes('Intel') || renderer.includes('Mali')) {
        this.performanceMode = 'medium';
      }
    }
  }

  private initializeHandLandmarkMap(): void {
    // MediaPipe hand landmark indices mapping to particle roles
    this.handLandmarkMap.set(0, ParticleRole.WRIST);

    // Thumb
    this.handLandmarkMap.set(1, ParticleRole.THUMB);
    this.handLandmarkMap.set(2, ParticleRole.THUMB);
    this.handLandmarkMap.set(3, ParticleRole.THUMB);
    this.handLandmarkMap.set(4, ParticleRole.FINGER_TIP); // Thumb tip

    // Index finger
    this.handLandmarkMap.set(5, ParticleRole.INDEX);
    this.handLandmarkMap.set(6, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(7, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(8, ParticleRole.FINGER_TIP); // Index tip

    // Middle finger
    this.handLandmarkMap.set(9, ParticleRole.MIDDLE);
    this.handLandmarkMap.set(10, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(11, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(12, ParticleRole.FINGER_TIP); // Middle tip

    // Ring finger
    this.handLandmarkMap.set(13, ParticleRole.RING);
    this.handLandmarkMap.set(14, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(15, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(16, ParticleRole.FINGER_TIP); // Ring tip

    // Pinky
    this.handLandmarkMap.set(17, ParticleRole.PINKY);
    this.handLandmarkMap.set(18, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(19, ParticleRole.FINGER_JOINT);
    this.handLandmarkMap.set(20, ParticleRole.FINGER_TIP); // Pinky tip
  }

  private initializeParticles(): void {
    // Initialize particles for each hand (up to 2 hands)
    for (let handIndex = 0; handIndex < 2; handIndex++) {
      const handKey = `hand_${handIndex}`;
      const handParticles: Particle[] = [];

      // Create particles for each landmark
      for (let landmarkIndex = 0; landmarkIndex < 21; landmarkIndex++) {
        const role = this.handLandmarkMap.get(landmarkIndex) || ParticleRole.FINGER_BONE;
        const fingerIndex = this.getFingerIndex(landmarkIndex);
        const jointIndex = this.getJointIndex(landmarkIndex);

        const particle = new Particle(
          this.width / 2,
          this.height / 2,
          role,
          fingerIndex,
          jointIndex
        );

        particle.setActive(false); // Initially inactive
        handParticles.push(particle);
      }

      // Add palm center particle
      const palmParticle = new Particle(
        this.width / 2,
        this.height / 2,
        ParticleRole.PALM_CENTER
      );
      palmParticle.setActive(false);
      handParticles.push(palmParticle);

      this.handParticles.set(handKey, handParticles);
    }

    // Initialize connection particles
    this.initializeConnectionParticles();

    // Initialize aura particles
    this.initializeAuraParticles();
  }

  private getFingerIndex(landmarkIndex: number): number {
    if (landmarkIndex >= 1 && landmarkIndex <= 4) return 0; // Thumb
    if (landmarkIndex >= 5 && landmarkIndex <= 8) return 1; // Index
    if (landmarkIndex >= 9 && landmarkIndex <= 12) return 2; // Middle
    if (landmarkIndex >= 13 && landmarkIndex <= 16) return 3; // Ring
    if (landmarkIndex >= 17 && landmarkIndex <= 20) return 4; // Pinky
    return -1;
  }

  private getJointIndex(landmarkIndex: number): number {
    const fingerStart = [1, 5, 9, 13, 17];
    for (let i = 0; i < fingerStart.length; i++) {
      if (landmarkIndex >= fingerStart[i] && landmarkIndex <= fingerStart[i] + 3) {
        return landmarkIndex - fingerStart[i];
      }
    }
    return 0;
  }

  private initializeConnectionParticles(): void {
    // Create particles for hand connections (bones)
    const connectionsPerHand = 20; // Connections between landmarks

    for (let i = 0; i < connectionsPerHand * 2; i++) { // 2 hands
      const particle = new Particle(
        this.width / 2,
        this.height / 2,
        ParticleRole.CONNECTION
      );
      particle.setActive(false);
      this.connectionParticles.push(particle);
    }
  }

  private initializeAuraParticles(): void {
    // Create floating aura particles around hands
    const auraCount = Math.floor(this.settings.particleCount * 0.3);

    for (let i = 0; i < auraCount; i++) {
      const particle = new Particle(
        Math.random() * this.width,
        Math.random() * this.height,
        ParticleRole.AURA
      );
      particle.setActive(false);
      this.auraParticles.push(particle);
    }
  }

  public update(deltaTime: number): void {
    const currentTime = performance.now();

    // Performance-based frame limiting
    if (this.performanceMode !== 'high' && currentTime - this.lastUpdateTime < 16.67) {
      this.frameSkip++;
      if (this.frameSkip < (this.performanceMode === 'low' ? 3 : 2)) return;
    }
    this.frameSkip = 0;
    this.lastUpdateTime = currentTime;

    // Update hand particles based on current hand data
    this.updateHandParticles(deltaTime);

    // Update connection particles
    if (this.settings.showConnections) {
      this.updateConnectionParticles(deltaTime);
    }

    // Update aura particles
    this.updateAuraParticles(deltaTime);
  }

  private updateHandParticles(deltaTime: number): void {
    for (let handIndex = 0; handIndex < this.currentHands.length; handIndex++) {
      const hand = this.currentHands[handIndex];
      const handKey = `hand_${handIndex}`;
      const handParticles = this.handParticles.get(handKey);

      if (!handParticles) continue;

      // Update landmark particles
      for (let i = 0; i < Math.min(21, hand.landmarks.length); i++) {
        const landmark = hand.landmarks[i];
        const particle = handParticles[i];

        if (particle) {
          particle.setActive(true);
          particle.setTarget(landmark.x, landmark.y);
          particle.setEnergy(this.settings.energyLevel);
          particle.update(deltaTime * this.settings.animationSpeed);
        }
      }

      // Update palm center particle
      const palmParticle = handParticles[21];
      if (palmParticle) {
        palmParticle.setActive(true);
        palmParticle.setTarget(hand.palmCenter.x, hand.palmCenter.y);
        palmParticle.setEnergy(this.settings.energyLevel * 1.5); // Palm has more energy
        palmParticle.update(deltaTime * this.settings.animationSpeed);
      }
    }

    // Deactivate particles for hands that are not detected
    for (let handIndex = this.currentHands.length; handIndex < 2; handIndex++) {
      const handKey = `hand_${handIndex}`;
      const handParticles = this.handParticles.get(handKey);

      if (handParticles) {
        handParticles.forEach(particle => particle.setActive(false));
      }
    }
  }

  private updateConnectionParticles(deltaTime: number): void {
    let connectionIndex = 0;

    for (let handIndex = 0; handIndex < this.currentHands.length; handIndex++) {
      const hand = this.currentHands[handIndex];
      const handKey = `hand_${handIndex}`;
      const handParticles = this.handParticles.get(handKey);

      if (!handParticles) continue;

      // Define hand bone connections (MediaPipe hand model)
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm connections
      ];

      for (const [start, end] of connections) {
        if (connectionIndex >= this.connectionParticles.length) break;

        const startParticle = handParticles[start];
        const endParticle = handParticles[end];
        const connectionParticle = this.connectionParticles[connectionIndex];

        if (startParticle && endParticle && connectionParticle) {
          const midX = (startParticle.x + endParticle.x) / 2;
          const midY = (startParticle.y + endParticle.y) / 2;

          connectionParticle.setActive(true);
          connectionParticle.setTarget(midX, midY);
          connectionParticle.setEnergy(this.settings.energyLevel * 0.7);
          connectionParticle.update(deltaTime * this.settings.animationSpeed);
        }

        connectionIndex++;
      }
    }

    // Deactivate unused connection particles
    for (let i = connectionIndex; i < this.connectionParticles.length; i++) {
      this.connectionParticles[i].setActive(false);
    }
  }

  private updateAuraParticles(deltaTime: number): void {
    let activeAuraCount = 0;

    for (let handIndex = 0; handIndex < this.currentHands.length; handIndex++) {
      const hand = this.currentHands[handIndex];
      const auraPerHand = Math.floor(this.auraParticles.length / 2);

      for (let i = 0; i < auraPerHand && activeAuraCount < this.auraParticles.length; i++) {
        const auraParticle = this.auraParticles[activeAuraCount];

        // Position aura particles around the hand
        const angle = (i / auraPerHand) * Math.PI * 2;
        const distance = 100 + Math.sin(performance.now() * 0.001 + i) * 50;
        const targetX = hand.palmCenter.x + Math.cos(angle) * distance;
        const targetY = hand.palmCenter.y + Math.sin(angle) * distance;

        auraParticle.setActive(true);
        auraParticle.setTarget(targetX, targetY);
        auraParticle.setEnergy(this.settings.energyLevel * 0.8);
        auraParticle.update(deltaTime * this.settings.animationSpeed);

        activeAuraCount++;
      }
    }

    // Deactivate unused aura particles
    for (let i = activeAuraCount; i < this.auraParticles.length; i++) {
      this.auraParticles[i].setActive(false);
    }
  }

  private spawnParticle(): void {
    // Spawn from attractors if available, otherwise from center
    let x, y;

    if (this.attractors.length > 0) {
      // Spawn from attractors (hand positions)
      const attractor = this.attractors[Math.floor(Math.random() * this.attractors.length)];
      x = attractor.x;
      y = attractor.y;
    } else {
      // Spawn from center if no attractors
      x = this.width / 2;
      y = this.height / 2;
    }

    const particle = this.getParticleFromPool();
    if (particle) {
      particle.reset(x, y);
      this.particles.push(particle);
    }
  }

  public spawnParticlesAt(x: number, y: number, count: number = 5): void {
    // Spawn multiple particles at specific location (for hand tracking)
    for (let i = 0; i < count; i++) {
      const particle = this.getParticleFromPool();
      if (particle && this.particles.length < this.maxParticles) {
        particle.reset(x, y);
        this.particles.push(particle);
      }
    }
  }

  private applyForces(particle: Particle): void {
    // Attractor forces
    for (const attractor of this.attractors) {
      const distance = particle.distanceTo(attractor.x, attractor.y);
      if (distance > 0 && distance < 300) {
        const strength = Math.min(5000 / (distance * distance), 2);
        const dx = attractor.x - particle.x;
        const dy = attractor.y - particle.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0) {
          particle.applyForce(
            (dx / magnitude) * strength,
            (dy / magnitude) * strength
          );
        }
      }
    }

    // Repulsor forces
    for (const repulsor of this.repulsors) {
      const distance = particle.distanceTo(repulsor.x, repulsor.y);
      if (distance > 0 && distance < 200) {
        const strength = Math.min(3000 / (distance * distance), 3);
        const dx = particle.x - repulsor.x;
        const dy = particle.y - repulsor.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0) {
          particle.applyForce(
            (dx / magnitude) * strength,
            (dy / magnitude) * strength
          );
        }
      }
    }

    // Gravity (subtle downward force)
    particle.applyForce(0, 20);
  }

  private applyBoundaryForces(particle: Particle): void {
    const margin = 50;
    const bounceStrength = 100;

    // Left boundary
    if (particle.x < margin) {
      const force = (margin - particle.x) / margin;
      particle.applyForce(force * bounceStrength, 0);
    }

    // Right boundary
    if (particle.x > this.width - margin) {
      const force = (particle.x - (this.width - margin)) / margin;
      particle.applyForce(-force * bounceStrength, 0);
    }

    // Top boundary
    if (particle.y < margin) {
      const force = (margin - particle.y) / margin;
      particle.applyForce(0, force * bounceStrength);
    }

    // Bottom boundary
    if (particle.y > this.height - margin) {
      const force = (particle.y - (this.height - margin)) / margin;
      particle.applyForce(0, -force * bounceStrength);
    }
  }

  private updateParticleInteractions(): void {
    // Simple particle-to-particle interactions for clustering effect
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const distance = p1.distanceTo(p2.x, p2.y);

        if (distance < 30 && distance > 0) {
          // Slight attraction between nearby particles
          const strength = 0.5;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const magnitude = Math.sqrt(dx * dx + dy * dy);

          if (magnitude > 0) {
            const forceX = (dx / magnitude) * strength;
            const forceY = (dy / magnitude) * strength;

            p1.applyForce(forceX, forceY);
            p2.applyForce(-forceX, -forceY);
          }
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Render connection particles first (behind everything)
    if (this.settings.showConnections) {
      this.renderConnections(ctx);
    }

    // Render aura particles
    ctx.globalCompositeOperation = 'screen';
    for (const auraParticle of this.auraParticles) {
      if (auraParticle.isAlive()) {
        auraParticle.render(ctx);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // Render hand particles with enhanced blending
    ctx.globalCompositeOperation = 'screen';
    for (const handParticles of this.handParticles.values()) {
      for (const particle of handParticles) {
        if (particle.isAlive()) {
          particle.render(ctx);
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  }

  private renderConnections(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    for (let handIndex = 0; handIndex < this.currentHands.length; handIndex++) {
      const handKey = `hand_${handIndex}`;
      const handParticles = this.handParticles.get(handKey);

      if (!handParticles) continue;

      // Draw connections between hand landmarks
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm connections
      ];

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * this.settings.colorIntensity})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      for (const [start, end] of connections) {
        const startParticle = handParticles[start];
        const endParticle = handParticles[end];

        if (startParticle && endParticle && startParticle.isAlive() && endParticle.isAlive()) {
          ctx.beginPath();
          ctx.moveTo(startParticle.x, startParticle.y);
          ctx.lineTo(endParticle.x, endParticle.y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  private renderForceFields(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Render attractors
    for (const attractor of this.attractors) {
      const gradient = ctx.createRadialGradient(
        attractor.x, attractor.y, 0,
        attractor.x, attractor.y, 100
      );
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(attractor.x, attractor.y, 100, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Render repulsors
    for (const repulsor of this.repulsors) {
      const gradient = ctx.createRadialGradient(
        repulsor.x, repulsor.y, 0,
        repulsor.x, repulsor.y, 80
      );
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(repulsor.x, repulsor.y, 80, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }

  public addAttractor(x: number, y: number): void {
    this.attractors.push({ x, y });
  }

  public addRepulsor(x: number, y: number): void {
    this.repulsors.push({ x, y });
  }

  public clearAttractors(): void {
    this.attractors = [];
  }

  public clearRepulsors(): void {
    this.repulsors = [];
  }

  public setAttractors(attractors: Vector2[]): void {
    this.attractors = [...attractors];
  }

  public setRepulsors(repulsors: Vector2[]): void {
    this.repulsors = [...repulsors];
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public updateHandData(hands: HandData[]): void {
    this.currentHands = hands;
  }

  public updateSettings(newSettings: Partial<ParticleSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    // Apply settings to existing particles
    this.applySettingsToParticles();
  }

  private applySettingsToParticles(): void {
    // Update all particles with new settings
    for (const handParticles of this.handParticles.values()) {
      for (const particle of handParticles) {
        particle.setEnergy(this.settings.energyLevel);
      }
    }

    for (const particle of this.auraParticles) {
      particle.setEnergy(this.settings.energyLevel * 0.8);
    }

    for (const particle of this.connectionParticles) {
      particle.setEnergy(this.settings.energyLevel * 0.7);
    }
  }

  public getSettings(): ParticleSettings {
    return { ...this.settings };
  }

  public getParticleCount(): number {
    let count = 0;

    // Count active hand particles
    for (const handParticles of this.handParticles.values()) {
      count += handParticles.filter(p => p.isAlive()).length;
    }

    // Count active aura particles
    count += this.auraParticles.filter(p => p.isAlive()).length;

    // Count active connection particles
    if (this.settings.showConnections) {
      count += this.connectionParticles.filter(p => p.isAlive()).length;
    }

    return count;
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public explode(x: number, y: number, strength: number = 1000): void {
    // Apply explosion force to nearby particles
    const allParticles = [
      ...Array.from(this.handParticles.values()).flat(),
      ...this.auraParticles,
      ...this.connectionParticles
    ];

    for (const particle of allParticles) {
      if (!particle.isAlive()) continue;

      const distance = particle.distanceTo(x, y);
      if (distance < 200) {
        const force = strength / (distance + 1);
        const dx = particle.x - x;
        const dy = particle.y - y;
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

  public getHandParticles(handIndex: number): Particle[] {
    const handKey = `hand_${handIndex}`;
    return this.handParticles.get(handKey) || [];
  }

  public getAuraParticles(): Particle[] {
    return this.auraParticles;
  }

  public getConnectionParticles(): Particle[] {
    return this.connectionParticles;
  }

  public getPerformanceMode(): string {
    return this.performanceMode;
  }
}
