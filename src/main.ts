import { Game } from './game/Game';
import { HandTracker } from './tracking/HandTracker';
import { ParticleSystem } from './particles/ParticleSystem';
import { InputManager } from './input/InputManager';

class App {
  private game!: Game;
  private handTracker!: HandTracker;
  private particleSystem!: ParticleSystem;
  private inputManager!: InputManager;
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
    const settingsBtn = document.getElementById('settingsBtn');
    const settings = document.getElementById('settings');

    // Start button handler
    startBtn?.addEventListener('click', () => {
      instructions?.classList.add('hidden');
      controls?.style.setProperty('display', 'flex');
    });

    // Help button handler
    helpBtn?.addEventListener('click', () => {
      instructions?.classList.toggle('hidden');
    });

    // Settings button handler
    settingsBtn?.addEventListener('click', () => {
      settings?.style.setProperty('display', 'block');
    });

    // Close settings handler
    const closeSettings = document.getElementById('closeSettings');
    closeSettings?.addEventListener('click', () => {
      settings?.style.setProperty('display', 'none');
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

    // COSMIC CONTROL BUTTONS
    const formBtn = document.getElementById('formBtn');
    const disperseBtn = document.getElementById('disperseBtn');
    const bigBangBtn = document.getElementById('bigBangBtn');

    formBtn?.addEventListener('click', () => {
      if (this.particleSystem) {
        this.particleSystem.formCosmicConstellation();
        console.log('🌌 Forming Cosmic Constellation...');
      }
    });

    disperseBtn?.addEventListener('click', () => {
      if (this.particleSystem) {
        this.particleSystem.disperseIntoVoid();
        console.log('🌌 Dispersing into Cosmic Void...');
      }
    });

    // Add Big Bang button if it exists
    bigBangBtn?.addEventListener('click', () => {
      if (this.particleSystem) {
        this.particleSystem.triggerBigBang();
        console.log('💥 BIG BANG TRIGGERED! COSMIC EXPLOSION!');
      }
    });

    // Setup settings controls
    this.setupSettingsControls();
  }

  private setupSettingsControls(): void {
    // Particle count slider
    const particleCount = document.getElementById('particleCount') as HTMLInputElement;
    const particleCountValue = document.getElementById('particleCountValue');

    particleCount?.addEventListener('input', () => {
      const value = parseInt(particleCount.value);
      if (particleCountValue) particleCountValue.textContent = value.toString();
      if (this.particleSystem) {
        this.particleSystem.updateSettings({ particleCount: value });
      }
    });

    // Energy level slider
    const energyLevel = document.getElementById('energyLevel') as HTMLInputElement;
    const energyLevelValue = document.getElementById('energyLevelValue');

    energyLevel?.addEventListener('input', () => {
      const value = parseFloat(energyLevel.value);
      if (energyLevelValue) energyLevelValue.textContent = value.toFixed(1);
      if (this.particleSystem) {
        this.particleSystem.updateSettings({ energyLevel: value });
      }
    });

    // Color intensity slider
    const colorIntensity = document.getElementById('colorIntensity') as HTMLInputElement;
    const colorIntensityValue = document.getElementById('colorIntensityValue');

    colorIntensity?.addEventListener('input', () => {
      const value = parseFloat(colorIntensity.value);
      if (colorIntensityValue) colorIntensityValue.textContent = value.toFixed(1);
      if (this.particleSystem) {
        this.particleSystem.updateSettings({ colorIntensity: value });
      }
    });

    // Animation speed slider
    const animationSpeed = document.getElementById('animationSpeed') as HTMLInputElement;
    const animationSpeedValue = document.getElementById('animationSpeedValue');

    animationSpeed?.addEventListener('input', () => {
      const value = parseFloat(animationSpeed.value);
      if (animationSpeedValue) animationSpeedValue.textContent = value.toFixed(1);
      if (this.particleSystem) {
        this.particleSystem.updateSettings({ animationSpeed: value });
      }
    });

    // Show trails checkbox
    const showTrails = document.getElementById('showTrails') as HTMLInputElement;
    showTrails?.addEventListener('change', () => {
      if (this.particleSystem) {
        this.particleSystem.updateSettings({ showTrails: showTrails.checked });
      }
    });

    // Show connections checkbox
    const showConnections = document.getElementById('showConnections') as HTMLInputElement;
    showConnections?.addEventListener('change', () => {
      if (this.particleSystem) {
        this.particleSystem.updateSettings({ showConnections: showConnections.checked });
      }
    });

    // Reset settings button
    const resetSettings = document.getElementById('resetSettings');
    resetSettings?.addEventListener('click', () => {
      this.resetSettingsToDefault();
    });
  }

  private resetSettingsToDefault(): void {
    // Reset sliders
    const particleCount = document.getElementById('particleCount') as HTMLInputElement;
    const energyLevel = document.getElementById('energyLevel') as HTMLInputElement;
    const colorIntensity = document.getElementById('colorIntensity') as HTMLInputElement;
    const animationSpeed = document.getElementById('animationSpeed') as HTMLInputElement;
    const showTrails = document.getElementById('showTrails') as HTMLInputElement;
    const showConnections = document.getElementById('showConnections') as HTMLInputElement;

    if (particleCount) {
      particleCount.value = '300';
      document.getElementById('particleCountValue')!.textContent = '300';
    }
    if (energyLevel) {
      energyLevel.value = '1.0';
      document.getElementById('energyLevelValue')!.textContent = '1.0';
    }
    if (colorIntensity) {
      colorIntensity.value = '1.0';
      document.getElementById('colorIntensityValue')!.textContent = '1.0';
    }
    if (animationSpeed) {
      animationSpeed.value = '1.0';
      document.getElementById('animationSpeedValue')!.textContent = '1.0';
    }
    if (showTrails) showTrails.checked = true;
    if (showConnections) showConnections.checked = true;

    // Update particle system
    if (this.particleSystem) {
      this.particleSystem.updateSettings({
        particleCount: 300,
        energyLevel: 1.0,
        colorIntensity: 1.0,
        animationSpeed: 1.0,
        showTrails: true,
        showConnections: true
      });
    }
  }

  private setupCanvas(): void {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
  }

  private setupInputHandlers(): void {
    // Mouse interaction untuk sistem pembentuk benda
    this.inputManager.onMouseInteraction((x, y, isActive) => {
      if (isActive) {
        this.particleSystem.setMouseInteraction(x, y, 100);
      } else {
        this.particleSystem.clearMouseInteraction();
      }
    });

    // Touch controls untuk mobile
    this.inputManager.onPointerMove((x, y) => {
      if (this.inputManager.isPointerDown()) {
        this.particleSystem.setMouseInteraction(x, y, 100);
      }
    });

    this.inputManager.onPointerUp(() => {
      this.particleSystem.clearMouseInteraction();
    });
  }

  private async init(): Promise<void> {
    try {
      // Initialize systems
      this.particleSystem = new ParticleSystem(this.canvas.width, this.canvas.height);
      this.inputManager = new InputManager(this.canvas);
      this.handTracker = new HandTracker(this.video);
      this.game = new Game(this.particleSystem, this.handTracker, this.inputManager);

      // Setup input handlers untuk sistem pembentuk benda
      this.setupInputHandlers();

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
      this.gameLoop(performance.now());

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

    // Render particles (particle system handles its own blending)
    this.particleSystem.render(this.ctx);

    // Render hand tracking overlay
    this.handTracker.renderDebug(this.ctx);

    // Add screen effects
    this.renderScreenEffects();
  }

  private renderBackground(): void {
    // Apply fade effect for particle trails (like the original system)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

    gradient.addColorStop(0, `rgba(${Math.sin(time * 0.2) * 10 + 5}, ${Math.cos(time * 0.3) * 10 + 5}, ${Math.sin(time * 0.1) * 15 + 10}, 0.3)`);
    gradient.addColorStop(0.5, 'rgba(2, 2, 8, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
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
