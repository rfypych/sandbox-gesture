import { Particle, Vector2 } from './Particle';

export class ParticleSystem {
  private particles: Particle[] = [];
  private particlePool: Particle[] = [];
  private maxParticles: number = this.getOptimalParticleCount();
  private width: number;
  private height: number;
  private spawnRate: number = 50; // particles per second
  private spawnTimer: number = 0;
  private attractors: Vector2[] = [];
  private repulsors: Vector2[] = [];
  private lastUpdateTime: number = 0;
  private frameSkip: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeParticles();
  }

  private getOptimalParticleCount(): number {
    // Adjust particle count based on device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenArea = window.innerWidth * window.innerHeight;

    if (isMobile) {
      return Math.min(200, Math.floor(screenArea / 5000));
    } else {
      return Math.min(800, Math.floor(screenArea / 2000));
    }
  }

  private initializeParticles(): void {
    // Pre-allocate particle pool for better performance
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push(new Particle(0, 0));
    }

    // Create initial active particles
    const initialCount = Math.min(100, this.maxParticles);
    for (let i = 0; i < initialCount; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.reset(Math.random() * this.width, Math.random() * this.height);
        this.particles.push(particle);
      }
    }
  }

  private getParticleFromPool(): Particle | null {
    return this.particlePool.pop() || null;
  }

  private returnParticleToPool(particle: Particle): void {
    this.particlePool.push(particle);
  }

  public update(deltaTime: number): void {
    const currentTime = performance.now();

    // Frame rate limiting for mobile devices
    if (currentTime - this.lastUpdateTime < 16.67) { // ~60fps
      this.frameSkip++;
      if (this.frameSkip < 2) return; // Skip every other frame on slow devices
    }
    this.frameSkip = 0;
    this.lastUpdateTime = currentTime;

    // Spawn new particles
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 1 / this.spawnRate && this.particles.length < this.maxParticles) {
      this.spawnParticle();
      this.spawnTimer = 0;
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Apply forces from attractors and repulsors
      this.applyForces(particle);

      // Apply boundary forces
      this.applyBoundaryForces(particle);

      // Update particle
      particle.update(deltaTime);

      // Remove dead particles and return to pool
      if (!particle.isAlive()) {
        this.particles.splice(i, 1);
        this.returnParticleToPool(particle);
      }
    }

    // Particle interactions (reduced frequency for performance)
    if (this.particles.length < 200) {
      this.updateParticleInteractions();
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
    // Render all particles with screen blend mode for glow effect
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const particle of this.particles) {
      particle.render(ctx);
    }
    ctx.restore();

    // Render attractors and repulsors
    this.renderForceFields(ctx);
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

  public explode(x: number, y: number, strength: number = 1000): void {
    // Create explosion effect
    for (const particle of this.particles) {
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

    // Spawn explosion particles
    this.spawnParticlesAt(x, y, 20);
  }
}
