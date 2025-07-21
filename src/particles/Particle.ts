export interface Vector2 {
  x: number;
  y: number;
}

export class Particle {
  public position: Vector2;
  public velocity: Vector2;
  public acceleration: Vector2;
  public life: number;
  public maxLife: number;
  public size: number;
  public color: { r: number; g: number; b: number; a: number };
  public mass: number;
  public trail: Vector2[];
  public maxTrailLength: number;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.life = 1.0;
    this.maxLife = 1.0;
    this.size = Math.random() * 3 + 2;
    this.mass = this.size * 0.1;
    this.trail = [];
    this.maxTrailLength = 10;
    
    // Random vibrant colors
    const hue = Math.random() * 360;
    this.color = this.hslToRgb(hue, 0.8, 0.6);
  }

  public update(deltaTime: number): void {
    // Store trail position
    this.trail.push({ x: this.position.x, y: this.position.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Physics update
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Apply drag
    const drag = 0.98;
    this.velocity.x *= drag;
    this.velocity.y *= drag;

    // Reset acceleration
    this.acceleration.x = 0;
    this.acceleration.y = 0;

    // Update life
    this.life -= deltaTime * 0.5;
    if (this.life < 0) this.life = 0;

    // Update alpha based on life
    this.color.a = this.life;
  }

  public applyForce(force: Vector2): void {
    this.acceleration.x += force.x / this.mass;
    this.acceleration.y += force.y / this.mass;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.life <= 0) return;

    ctx.save();

    // Render trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a * 0.3})`;
      ctx.lineWidth = this.size * 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      
      for (let i = 0; i < this.trail.length - 1; i++) {
        const alpha = (i / this.trail.length) * this.color.a * 0.3;
        ctx.globalAlpha = alpha;
        
        if (i === 0) {
          ctx.moveTo(this.trail[i].x, this.trail[i].y);
        } else {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
      }
      ctx.stroke();
    }

    // Render particle with glow effect
    const gradient = ctx.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, this.size * 2
    );
    
    gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`);
    gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a * 0.5})`);
    gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size * 2, 0, 2 * Math.PI);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = `rgba(255, 255, 255, ${this.color.a * 0.8})`;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size * 0.3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  public isAlive(): boolean {
    return this.life > 0;
  }

  public distanceTo(other: Vector2): number {
    const dx = this.position.x - other.x;
    const dy = this.position.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public reset(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = (Math.random() - 0.5) * 100;
    this.velocity.y = (Math.random() - 0.5) * 100;
    this.life = 1.0;
    this.trail = [];
    
    // New random color
    const hue = Math.random() * 360;
    this.color = this.hslToRgb(hue, 0.8, 0.6);
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number; a: number } {
    h /= 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / (1/12)) % 1;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
      a: 1.0
    };
  }
}
