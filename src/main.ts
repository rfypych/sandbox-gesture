import { Game } from './game/Game';
import { HandTracker } from './tracking/HandTracker';
import { ParticleSystem } from './particles/ParticleSystem';
import { InputManager } from './input/InputManager';

class App {
  private game: Game;
  private handTracker: HandTracker;
  private particleSystem: ParticleSystem;
  private inputManager: InputManager;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private lastFpsTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.video = document.getElementById('videoElement') as HTMLVideoElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.setupCanvas();
    this.setupUI();
    this.init();
  }

  private setupUI(): void {
    const startBtn = document.getElementById('startBtn');
    const instructions = document.getElementById('instructions');
    const controls = document.getElementById('controls');
    const helpBtn = document.getElementById('helpBtn');

    // Start button handler
    startBtn?.addEventListener('click', () => {
      instructions?.classList.add('hidden');
      controls?.style.setProperty('display', 'flex');
    });

    // Help button handler
    helpBtn?.addEventListener('click', () => {
      instructions?.classList.toggle('hidden');
    });

    // Control buttons
    const attractBtn = document.getElementById('attractBtn');
    const repelBtn = document.getElementById('repelBtn');
    const spawnBtn = document.getElementById('spawnBtn');
    const explodeBtn = document.getElementById('explodeBtn');

    const buttons = [attractBtn, repelBtn, spawnBtn, explodeBtn];
    const modes = ['attract', 'repel', 'spawn', 'explode'] as const;

    buttons.forEach((btn, index) => {
      btn?.addEventListener('click', () => {
        // Remove active class from all buttons
        buttons.forEach(b => b?.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Set game mode
        if (this.game) {
          this.game.setGameMode(modes[index]);
        }
      });
    });
  }

  private setupCanvas(): void {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
  }

  private async init(): Promise<void> {
    try {
      // Initialize systems
      this.particleSystem = new ParticleSystem(this.canvas.width, this.canvas.height);
      this.inputManager = new InputManager(this.canvas);
      this.handTracker = new HandTracker(this.video);
      this.game = new Game(this.particleSystem, this.handTracker, this.inputManager);

      // Setup hand tracking
      await this.handTracker.initialize();
      
      // Hide loading screen
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';

      // Show success message
      console.log('🎮 Particle Hand Game initialized successfully!');
      console.log('✋ Use hand gestures to control particles');
      console.log('📱 Touch controls available on mobile');

      // Start game loop
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();

    } catch (error) {
      console.error('Failed to initialize app:', error);
      const loading = document.getElementById('loading');
      if (loading) loading.textContent = 'Failed to load. Please refresh and allow camera access.';
    }
  }

  private gameLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Calculate FPS
    this.frameCount++;
    if (currentTime - this.lastFpsTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = currentTime;
      this.updateUI();
    }

    // Update game
    this.game.update(deltaTime);

    // Render
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private render(): void {
    // Create stunning background with gradient and effects
    this.renderBackground();

    // Render particles with bloom effect
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.particleSystem.render(this.ctx);
    this.ctx.restore();

    // Render hand tracking overlay
    this.handTracker.renderDebug(this.ctx);

    // Add screen effects
    this.renderScreenEffects();
  }

  private renderBackground(): void {
    // Create animated gradient background
    const time = performance.now() * 0.001;
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2 + Math.sin(time * 0.5) * 100,
      this.canvas.height / 2 + Math.cos(time * 0.3) * 100,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height)
    );

    gradient.addColorStop(0, `rgba(${Math.sin(time * 0.2) * 20 + 10}, ${Math.cos(time * 0.3) * 20 + 10}, ${Math.sin(time * 0.1) * 30 + 20}, 0.8)`);
    gradient.addColorStop(0.5, 'rgba(5, 5, 15, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderScreenEffects(): void {
    // Add subtle vignette effect
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private updateUI(): void {
    const fpsElement = document.getElementById('fps');
    const particleCountElement = document.getElementById('particleCount');
    const handStatusElement = document.getElementById('handStatus');
    const scoreElement = document.getElementById('score');
    const comboElement = document.getElementById('combo');

    if (fpsElement) fpsElement.textContent = this.fps.toString();
    if (particleCountElement) particleCountElement.textContent = this.particleSystem.getParticleCount().toString();
    if (handStatusElement) handStatusElement.textContent = this.handTracker.getHandCount() > 0 ? `${this.handTracker.getHandCount()} detected` : 'None detected';
    if (scoreElement && this.game) scoreElement.textContent = this.game.getScore().toString();
    if (comboElement && this.game) comboElement.textContent = this.game.getCombo().toString();
  }
}

// Start the application
new App();
