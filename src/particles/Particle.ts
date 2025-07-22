export interface Vector2 {
  x: number;
  y: number;
}

export enum ParticleRole {
  PALM_CENTER = 'palm_center',
  PALM_EDGE = 'palm_edge',
  FINGER_TIP = 'finger_tip',
  FINGER_JOINT = 'finger_joint',
  FINGER_BONE = 'finger_bone',
  WRIST = 'wrist',
  THUMB = 'thumb',
  INDEX = 'index',
  MIDDLE = 'middle',
  RING = 'ring',
  PINKY = 'pinky',
  CONNECTION = 'connection',
  AURA = 'aura'
}

export class Particle {
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;
  public baseX: number;
  public baseY: number;
  public originX: number;
  public originY: number;
  public size: number;
  public baseSize: number;
  public color: string;
  public baseColor: string;
  public life: number;
  public opacity: number;
  public baseOpacity: number;
  public density: number;
  public role: ParticleRole;
  public fingerIndex: number;
  public jointIndex: number;
  public isActive: boolean;
  public energy: number;
  public phase: number;
  public amplitude: number;
  public frequency: number;
  public trail: Vector2[];
  public maxTrailLength: number;
  public isForming: boolean;
  public formingSpeed: number;

  constructor(x: number, y: number, role: ParticleRole = ParticleRole.AURA, fingerIndex: number = -1, jointIndex: number = -1) {
    // Posisi dan target (mengikuti sistem pembentuk benda)
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.baseX = x;
    this.baseY = y;

    // Posisi asal acak untuk efek pembentukan
    this.originX = Math.random() * (window.innerWidth || 800);
    this.originY = Math.random() * (window.innerHeight || 600);

    // Role dan identitas
    this.role = role;
    this.fingerIndex = fingerIndex;
    this.jointIndex = jointIndex;
    this.isActive = false; // Start inactive

    // Properti fisik berdasarkan role
    this.initializeByRole();

    // Sistem pembentuk benda
    this.density = (Math.random() * 40) + 5; // Faktor "berat" atau inersia
    this.isForming = false;
    this.formingSpeed = 20; // Kecepatan konvergensi ke bentuk

    // Animasi dan efek
    this.energy = 1.0;
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = Math.random() * 5 + 2;
    this.frequency = Math.random() * 0.02 + 0.01;

    // Trail system
    this.trail = [];
    this.maxTrailLength = this.getTrailLength();

    // Set posisi awal ke origin untuk efek pembentukan
    this.x = this.originX;
    this.y = this.originY;
  }

  private initializeByRole(): void {
    const colorPalettes = {
      [ParticleRole.PALM_CENTER]: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
      [ParticleRole.PALM_EDGE]: ['#4ECDC4', '#45B7D1', '#96CEB4'],
      [ParticleRole.FINGER_TIP]: ['#FFEAA7', '#FDCB6E', '#E17055'],
      [ParticleRole.FINGER_JOINT]: ['#74B9FF', '#0984E3', '#6C5CE7'],
      [ParticleRole.FINGER_BONE]: ['#A29BFE', '#6C5CE7', '#FD79A8'],
      [ParticleRole.WRIST]: ['#2D3436', '#636E72', '#B2BEC3'],
      [ParticleRole.THUMB]: ['#E84393', '#FD79A8', '#FDCB6E'],
      [ParticleRole.INDEX]: ['#00B894', '#00CEC9', '#55EFC4'],
      [ParticleRole.MIDDLE]: ['#0984E3', '#74B9FF', '#81ECEC'],
      [ParticleRole.RING]: ['#A29BFE', '#6C5CE7', '#FD79A8'],
      [ParticleRole.PINKY]: ['#FDCB6E', '#E17055', '#FF7675'],
      [ParticleRole.CONNECTION]: ['#DDD', '#EEE', '#FFF'],
      [ParticleRole.AURA]: ['#2185C5', '#7ECEFD', '#FFF6E5']
    };

    const sizeMaps = {
      [ParticleRole.PALM_CENTER]: { min: 8, max: 15 },
      [ParticleRole.PALM_EDGE]: { min: 4, max: 8 },
      [ParticleRole.FINGER_TIP]: { min: 6, max: 12 },
      [ParticleRole.FINGER_JOINT]: { min: 5, max: 9 },
      [ParticleRole.FINGER_BONE]: { min: 3, max: 6 },
      [ParticleRole.WRIST]: { min: 6, max: 10 },
      [ParticleRole.THUMB]: { min: 4, max: 8 },
      [ParticleRole.INDEX]: { min: 4, max: 8 },
      [ParticleRole.MIDDLE]: { min: 4, max: 8 },
      [ParticleRole.RING]: { min: 4, max: 8 },
      [ParticleRole.PINKY]: { min: 3, max: 6 },
      [ParticleRole.CONNECTION]: { min: 1, max: 3 },
      [ParticleRole.AURA]: { min: 2, max: 5 }
    };

    // Set color
    const palette = colorPalettes[this.role];
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.baseColor = this.color;

    // Set size (lebih kecil untuk efek pembentuk benda)
    const sizeRange = sizeMaps[this.role];
    this.size = Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min;
    this.baseSize = this.size;

    // Ukuran lebih kecil untuk partikel pembentuk
    this.size = Math.max(1.5, this.size * 0.6);
    this.baseSize = this.size;

    // Set opacity
    this.opacity = this.role === ParticleRole.CONNECTION ? 0.6 : 1.0;
    this.baseOpacity = this.opacity;

    // Set life
    this.life = 1.0;
  }

  private getTrailLength(): number {
    const trailMaps = {
      [ParticleRole.PALM_CENTER]: 15,
      [ParticleRole.PALM_EDGE]: 10,
      [ParticleRole.FINGER_TIP]: 20,
      [ParticleRole.FINGER_JOINT]: 8,
      [ParticleRole.FINGER_BONE]: 5,
      [ParticleRole.WRIST]: 12,
      [ParticleRole.THUMB]: 10,
      [ParticleRole.INDEX]: 10,
      [ParticleRole.MIDDLE]: 10,
      [ParticleRole.RING]: 10,
      [ParticleRole.PINKY]: 8,
      [ParticleRole.CONNECTION]: 3,
      [ParticleRole.AURA]: 6
    };
    return trailMaps[this.role];
  }

  public update(deltaTime: number, mouseX?: number, mouseY?: number, mouseRadius: number = 100): void {
    if (!this.isActive) return;

    // Update phase untuk animasi
    this.phase += this.frequency;

    // Interaksi dengan mouse/hand (sistem pembentuk benda)
    if (mouseX !== undefined && mouseY !== undefined) {
      this.handleMouseInteraction(mouseX, mouseY, mouseRadius);
    } else {
      // Jika tidak ada interaksi, bergerak ke target (bentuk tangan)
      this.moveToTarget();
    }

    // Organic movement berdasarkan role (lebih subtle)
    this.applyOrganicMovement();

    // Update trail
    this.updateTrail();

    // Update visual properties berdasarkan energy
    this.updateVisualProperties();
  }

  private handleMouseInteraction(mouseX: number, mouseY: number, mouseRadius: number): void {
    // Interaksi dengan mouse: mendorong partikel menjauh (seperti sistem pembentuk benda)
    const dxMouse = this.x - mouseX;
    const dyMouse = this.y - mouseY;
    const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

    if (distanceMouse < mouseRadius) {
      // Partikel berada dalam jangkauan mouse
      const forceDirectionX = dxMouse / distanceMouse;
      const forceDirectionY = dyMouse / distanceMouse;
      const force = (mouseRadius - distanceMouse) / mouseRadius;
      const directionX = forceDirectionX * force * this.density * 0.8;
      const directionY = forceDirectionY * force * this.density * 0.8;
      this.x += directionX;
      this.y += directionY;
    } else {
      // Jika tidak ada interaksi mouse, partikel bergerak ke targetnya
      this.moveToTarget();
    }
  }

  private moveToTarget(): void {
    // Bergerak ke target dengan kecepatan berdasarkan density
    const dxTarget = this.targetX - this.x;
    const dyTarget = this.targetY - this.y;
    this.x += dxTarget / this.formingSpeed;
    this.y += dyTarget / this.formingSpeed;
  }

  private applyOrganicMovement(): void {
    // Gerakan organik yang lebih subtle untuk sistem pembentuk benda
    const time = performance.now() * 0.001;

    switch (this.role) {
      case ParticleRole.FINGER_TIP:
        // Finger tips have subtle breathing effect
        const breathe = Math.sin(time * 3) * 0.5;
        this.size = this.baseSize * (1 + breathe * 0.2);
        break;

      case ParticleRole.PALM_CENTER:
        // Palm center pulses gently
        const pulse = Math.sin(time * 2) * 0.5 + 0.5;
        this.size = this.baseSize * (0.9 + pulse * 0.2);
        break;

      case ParticleRole.FINGER_BONE:
        // Very subtle movement for finger bones
        const wave = Math.sin(this.phase + this.jointIndex) * 0.3;
        this.x += wave;
        break;

      case ParticleRole.AURA:
        // Aura particles float gently
        this.x += Math.sin(this.phase) * 0.5;
        this.y += Math.cos(this.phase * 0.7) * 0.3;
        break;

      case ParticleRole.CONNECTION:
        // Connections are stable
        break;
    }
  }

  private updateTrail(): void {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  private updateVisualProperties(): void {
    const energyPulse = Math.sin(this.phase * 2) * 0.1 + 0.9;

    // Update opacity based on energy and role
    if (this.role === ParticleRole.FINGER_TIP) {
      this.opacity = this.baseOpacity * energyPulse;
    } else if (this.role === ParticleRole.AURA) {
      this.opacity = this.baseOpacity * (0.6 + energyPulse * 0.4);
    }

    // Update color intensity for some roles
    if (this.role === ParticleRole.PALM_CENTER || this.role === ParticleRole.FINGER_TIP) {
      // Color intensity varies with energy
      const intensity = energyPulse;
      this.updateColorIntensity(intensity);
    }
  }

  private updateColorIntensity(intensity: number): void {
    // Parse hex color and adjust brightness
    const hex = this.baseColor.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * intensity);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * intensity);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * intensity);

    this.color = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }

  public applyForce(forceX: number, forceY: number): void {
    this.speedX += forceX / this.mass;
    this.speedY += forceY / this.mass;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive || this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Render simple particle (sistem pembentuk benda style)
    this.renderSimpleParticle(ctx);

    ctx.restore();
  }

  private renderSimpleParticle(ctx: CanvasRenderingContext2D): void {
    // Render partikel sederhana dengan warna HSL yang vibrant
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // Add subtle glow effect for finger tips and palm center
    if (this.role === ParticleRole.FINGER_TIP || this.role === ParticleRole.PALM_CENTER) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.size * 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private renderTrail(ctx: CanvasRenderingContext2D): void {
    if (this.trail.length < 2) return;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size * 0.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * this.opacity * 0.5;
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.stroke();
    }

    ctx.globalAlpha = this.opacity; // Reset alpha
  }

  private renderByRole(ctx: CanvasRenderingContext2D): void {
    switch (this.role) {
      case ParticleRole.PALM_CENTER:
        this.renderPalmCenter(ctx);
        break;
      case ParticleRole.FINGER_TIP:
        this.renderFingerTip(ctx);
        break;
      case ParticleRole.FINGER_JOINT:
        this.renderFingerJoint(ctx);
        break;
      case ParticleRole.CONNECTION:
        this.renderConnection(ctx);
        break;
      default:
        this.renderDefault(ctx);
        break;
    }
  }

  private renderPalmCenter(ctx: CanvasRenderingContext2D): void {
    // Multi-layered palm center with pulsing effect
    const layers = 3;
    for (let i = layers; i > 0; i--) {
      const layerSize = this.size * (i / layers);
      const layerAlpha = (layers - i + 1) / layers * 0.4;

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, layerSize * 2
      );

      const rgb = this.parseColor(this.color);
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${layerAlpha})`);
      gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${layerAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, layerSize * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bright core
    ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderFingerTip(ctx: CanvasRenderingContext2D): void {
    // Star-like finger tip with radiating energy
    const spikes = 8;
    const innerRadius = this.size * 0.5;
    const outerRadius = this.size * 1.5;

    ctx.fillStyle = this.color;
    ctx.beginPath();

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = this.x + Math.cos(angle + this.phase) * radius;
      const y = this.y + Math.sin(angle + this.phase) * radius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();

    // Glow effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, outerRadius * 2
    );

    const rgb = this.parseColor(this.color);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, outerRadius * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderFingerJoint(ctx: CanvasRenderingContext2D): void {
    // Hexagonal joint
    const sides = 6;
    const radius = this.size;

    ctx.fillStyle = this.color;
    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = this.x + Math.cos(angle) * radius;
      const y = this.y + Math.sin(angle) * radius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();

    // Inner glow
    ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderConnection(ctx: CanvasRenderingContext2D): void {
    // Simple small circle for connections
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDefault(ctx: CanvasRenderingContext2D): void {
    // Default rendering with glow
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2
    );

    const rgb = this.parseColor(this.color);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private parseColor(color: string): { r: number; g: number; b: number } {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      return {
        r: parseInt(matches![0]),
        g: parseInt(matches![1]),
        b: parseInt(matches![2])
      };
    }
    return { r: 255, g: 255, b: 255 };
  }

  public isAlive(): boolean {
    return this.isActive && this.life > 0;
  }

  public distanceTo(x: number, y: number): number {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.baseX = x;
    this.baseY = y;
  }

  public setActive(active: boolean): void {
    this.isActive = active;
    if (!active) {
      this.opacity = 0;
      // Return to origin when inactive
      this.targetX = this.originX;
      this.targetY = this.originY;
    } else {
      this.opacity = this.baseOpacity;
      // Move to hand position when active
      this.targetX = this.baseX;
      this.targetY = this.baseY;
    }
  }

  public formShape(): void {
    // Membentuk ke posisi target (bentuk tangan)
    this.isForming = true;
    this.targetX = this.baseX;
    this.targetY = this.baseY;
  }

  public disperseShape(): void {
    // Menyebar ke posisi acak
    this.isForming = false;
    this.targetX = Math.random() * (window.innerWidth || 800);
    this.targetY = Math.random() * (window.innerHeight || 600);
  }

  public setEnergy(energy: number): void {
    this.energy = Math.max(0, Math.min(1, energy));
    this.updateEnergyEffects();
  }

  private updateEnergyEffects(): void {
    // Size varies with energy
    this.size = this.baseSize * (0.5 + this.energy * 0.5);

    // Frequency varies with energy
    this.frequency = (0.01 + this.energy * 0.02);

    // Amplitude varies with energy
    this.amplitude = (2 + this.energy * 8);
  }

  public reset(x: number, y: number, role?: ParticleRole, fingerIndex?: number, jointIndex?: number): void {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.baseX = x;
    this.baseY = y;

    if (role !== undefined) {
      this.role = role;
      this.fingerIndex = fingerIndex || -1;
      this.jointIndex = jointIndex || -1;
      this.initializeByRole();
    }

    this.speedX = 0;
    this.speedY = 0;
    this.life = 1.0;
    this.isActive = true;
    this.energy = 1.0;
    this.phase = Math.random() * Math.PI * 2;
    this.trail = [];

    this.updateEnergyEffects();
  }

  public applyForce(forceX: number, forceY: number): void {
    this.speedX += forceX / this.mass;
    this.speedY += forceY / this.mass;
  }

  public getRole(): ParticleRole {
    return this.role;
  }

  public getFingerIndex(): number {
    return this.fingerIndex;
  }

  public getJointIndex(): number {
    return this.jointIndex;
  }
}
