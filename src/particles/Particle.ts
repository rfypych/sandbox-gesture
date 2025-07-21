export interface Vector2 {
  x: number;
  y: number;
}

export class Particle {
  public x: number;
  public y: number;
  public speedX: number;
  public speedY: number;
  public size: number;
  public color: string;
  public life: number;
  public opacity: number;
  public maxLife: number;
  public mass: number;

  constructor(x: number, y: number) {
    // Posisi awal partikel
    this.x = x;
    this.y = y;

    // Ukuran partikel acak untuk variasi
    this.size = Math.random() * 8 + 1;

    // Kecepatan dan arah partikel (acak)
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;

    // Palet warna yang cerah dan menarik
    const colors = [
      '#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66',
      '#F08A5D', '#B83B5E', '#6A2C70', '#FF6B6B',
      '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
    ];

    // Warna partikel diambil secara acak dari palet
    this.color = colors[Math.floor(Math.random() * colors.length)];

    // Waktu hidup partikel untuk efek menghilang
    this.life = Math.random() * 100 + 50;
    this.maxLife = this.life;
    this.opacity = 1;
    this.mass = this.size * 0.1;
  }

  public update(deltaTime: number): void {
    // Menggerakkan partikel
    this.x += this.speedX;
    this.y += this.speedY;

    // Mengurangi ukuran partikel seiring waktu untuk efek menyusut
    if (this.size > 0.2) {
      this.size -= 0.1;
    }

    // Mengurangi waktu hidup dan opacity
    this.life -= 1;
    if (this.life < 50) {
      this.opacity = this.life / 50;
    }

    // Clamp opacity
    if (this.opacity < 0) this.opacity = 0;
  }

  public applyForce(forceX: number, forceY: number): void {
    this.speedX += forceX / this.mass;
    this.speedY += forceY / this.mass;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.life <= 0 || this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Render particle with glow effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2
    );

    // Parse hex color to RGB for gradient
    const hex = this.color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.5)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public isAlive(): boolean {
    return this.life > 0 && this.size > 0.2;
  }

  public distanceTo(x: number, y: number): number {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.size = Math.random() * 8 + 1;
    this.life = Math.random() * 100 + 50;
    this.maxLife = this.life;
    this.opacity = 1;

    // New random color from palette
    const colors = [
      '#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66',
      '#F08A5D', '#B83B5E', '#6A2C70', '#FF6B6B',
      '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
}
