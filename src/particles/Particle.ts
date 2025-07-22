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
  public z: number; // 3D depth
  public targetX: number;
  public targetY: number;
  public targetZ: number;
  public baseX: number;
  public baseY: number;
  public baseZ: number;
  public originX: number;
  public originY: number;
  public originZ: number;
  public velocityX: number;
  public velocityY: number;
  public velocityZ: number;
  public size: number;
  public baseSize: number;
  public color: string;
  public baseColor: string;
  public secondaryColor: string;
  public life: number;
  public opacity: number;
  public baseOpacity: number;
  public density: number;
  public mass: number;
  public role: ParticleRole;
  public fingerIndex: number;
  public jointIndex: number;
  public isActive: boolean;
  public energy: number;
  public maxEnergy: number;
  public phase: number;
  public amplitude: number;
  public frequency: number;
  public trail: Vector2[];
  public maxTrailLength: number;
  public isForming: boolean;
  public formingSpeed: number;
  public magneticField: number;
  public electricCharge: number;
  public temperature: number;
  public spin: number;
  public spinSpeed: number;
  public pulseIntensity: number;
  public waveLength: number;
  public resonance: number;
  public quantumState: number;
  public morphingFactor: number;
  public dimensionalShift: number;
  public cosmicEnergy: number;
  public stellarMagnitude: number;
  public nebulaEffect: number;
  public plasmaDensity: number;
  public gravitationalPull: number;
  public timeDistortion: number;

  constructor(x: number, y: number, role: ParticleRole = ParticleRole.AURA, fingerIndex: number = -1, jointIndex: number = -1) {
    // 3D Positioning System
    this.x = x;
    this.y = y;
    this.z = Math.random() * 200 - 100; // 3D depth
    this.targetX = x;
    this.targetY = y;
    this.targetZ = this.z;
    this.baseX = x;
    this.baseY = y;
    this.baseZ = this.z;

    // Cosmic Origin Points
    this.originX = Math.random() * (window.innerWidth || 800);
    this.originY = Math.random() * (window.innerHeight || 600);
    this.originZ = Math.random() * 400 - 200;

    // Velocity System
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;

    // Role dan identitas
    this.role = role;
    this.fingerIndex = fingerIndex;
    this.jointIndex = jointIndex;
    this.isActive = false;

    // Advanced Physics Properties
    this.density = (Math.random() * 40) + 5;
    this.mass = this.density * 0.1;
    this.magneticField = Math.random() * 2 - 1;
    this.electricCharge = Math.random() * 2 - 1;
    this.temperature = Math.random() * 1000 + 273; // Kelvin
    this.gravitationalPull = Math.random() * 0.5;

    // Quantum Properties
    this.quantumState = Math.random();
    this.morphingFactor = Math.random();
    this.dimensionalShift = Math.random() * Math.PI * 2;
    this.timeDistortion = 1.0 + (Math.random() - 0.5) * 0.1;

    // Cosmic Properties
    this.cosmicEnergy = Math.random() * 10;
    this.stellarMagnitude = Math.random() * 5;
    this.nebulaEffect = Math.random();
    this.plasmaDensity = Math.random() * 3;

    // Animation Properties
    this.energy = 1.0;
    this.maxEnergy = 5.0;
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = Math.random() * 10 + 5;
    this.frequency = Math.random() * 0.05 + 0.01;
    this.spin = 0;
    this.spinSpeed = Math.random() * 0.1 + 0.05;
    this.pulseIntensity = Math.random();
    this.waveLength = Math.random() * 50 + 20;
    this.resonance = Math.random();

    // Formation Properties
    this.isForming = false;
    this.formingSpeed = 15 + Math.random() * 10;

    // Initialize role-based properties
    this.initializeByRole();

    // Trail system
    this.trail = [];
    this.maxTrailLength = this.getTrailLength();

    // Set initial position
    this.x = this.originX;
    this.y = this.originY;
    this.z = this.originZ;
  }

  private initializeByRole(): void {
    // COSMIC COLOR PALETTES - Each role has its own stellar signature
    const colorPalettes = {
      [ParticleRole.PALM_CENTER]: ['#FF0080', '#FF4081', '#E91E63', '#C2185B', '#AD1457'], // Magenta Nebula
      [ParticleRole.PALM_EDGE]: ['#00E5FF', '#00B0FF', '#0091EA', '#0277BD', '#01579B'], // Cyan Supernova
      [ParticleRole.FINGER_TIP]: ['#FFD700', '#FFC107', '#FF9800', '#FF5722', '#E65100'], // Golden Pulsar
      [ParticleRole.FINGER_JOINT]: ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4'], // Purple Galaxy
      [ParticleRole.FINGER_BONE]: ['#E040FB', '#D500F9', '#AA00FF', '#7C4DFF', '#651FFF'], // Violet Quasar
      [ParticleRole.WRIST]: ['#37474F', '#455A64', '#546E7A', '#607D8B', '#78909C'], // Dark Matter
      [ParticleRole.THUMB]: ['#FF1744', '#F50057', '#E91E63', '#AD1457', '#880E4F'], // Red Giant
      [ParticleRole.INDEX]: ['#00E676', '#00C853', '#4CAF50', '#388E3C', '#2E7D32'], // Emerald Star
      [ParticleRole.MIDDLE]: ['#00B8D4', '#00ACC1', '#0097A7', '#00838F', '#006064'], // Teal Constellation
      [ParticleRole.RING]: ['#7C4DFF', '#651FFF', '#6200EA', '#4527A0', '#311B92'], // Indigo Cosmos
      [ParticleRole.PINKY]: ['#FF6D00', '#FF8F00', '#FFA000', '#FFB300', '#FFC107'], // Orange Dwarf
      [ParticleRole.CONNECTION]: ['#FFFFFF', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD'], // Stellar Bridge
      [ParticleRole.AURA]: ['#00FFFF', '#40E0D0', '#48D1CC', '#20B2AA', '#008B8B'] // Aqua Aura
    };

    // SECONDARY COLOR PALETTES for dual-tone effects
    const secondaryPalettes = {
      [ParticleRole.PALM_CENTER]: ['#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C', '#38006B'],
      [ParticleRole.PALM_EDGE]: ['#FF6B35', '#FF5722', '#E64A19', '#D84315', '#BF360C'],
      [ParticleRole.FINGER_TIP]: ['#1A237E', '#283593', '#303F9F', '#3949AB', '#3F51B5'],
      [ParticleRole.FINGER_JOINT]: ['#FF8F00', '#FF9800', '#FFA000', '#FFB300', '#FFC107'],
      [ParticleRole.FINGER_BONE]: ['#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064'],
      [ParticleRole.WRIST]: ['#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'],
      [ParticleRole.THUMB]: ['#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
      [ParticleRole.INDEX]: ['#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C'],
      [ParticleRole.MIDDLE]: ['#FF5722', '#F4511E', '#E64A19', '#D84315', '#BF360C'],
      [ParticleRole.RING]: ['#00E676', '#00C853', '#4CAF50', '#388E3C', '#2E7D32'],
      [ParticleRole.PINKY]: ['#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
      [ParticleRole.CONNECTION]: ['#FF4081', '#F50057', '#E91E63', '#C2185B', '#AD1457'],
      [ParticleRole.AURA]: ['#FF9800', '#FF8F00', '#FF6F00', '#E65100', '#BF360C']
    };

    // COSMIC SIZE MAPPING - Each role has different stellar magnitude
    const sizeMaps = {
      [ParticleRole.PALM_CENTER]: { min: 12, max: 25 }, // Supermassive
      [ParticleRole.PALM_EDGE]: { min: 6, max: 12 }, // Large Star
      [ParticleRole.FINGER_TIP]: { min: 8, max: 18 }, // Bright Star
      [ParticleRole.FINGER_JOINT]: { min: 7, max: 14 }, // Medium Star
      [ParticleRole.FINGER_BONE]: { min: 4, max: 9 }, // Small Star
      [ParticleRole.WRIST]: { min: 10, max: 16 }, // Giant Star
      [ParticleRole.THUMB]: { min: 6, max: 12 }, // Binary Star
      [ParticleRole.INDEX]: { min: 6, max: 12 }, // Pulsar
      [ParticleRole.MIDDLE]: { min: 6, max: 12 }, // Quasar
      [ParticleRole.RING]: { min: 6, max: 12 }, // Neutron Star
      [ParticleRole.PINKY]: { min: 4, max: 9 }, // White Dwarf
      [ParticleRole.CONNECTION]: { min: 2, max: 5 }, // Cosmic Dust
      [ParticleRole.AURA]: { min: 3, max: 8 } // Nebula Particle
    };

    // ENERGY MAPPING - Each role has different cosmic energy levels
    const energyMaps = {
      [ParticleRole.PALM_CENTER]: { min: 3.0, max: 5.0 }, // Black Hole Energy
      [ParticleRole.PALM_EDGE]: { min: 2.0, max: 3.5 }, // Supernova Energy
      [ParticleRole.FINGER_TIP]: { min: 2.5, max: 4.0 }, // Pulsar Energy
      [ParticleRole.FINGER_JOINT]: { min: 1.8, max: 3.0 }, // Star Energy
      [ParticleRole.FINGER_BONE]: { min: 1.2, max: 2.5 }, // Planet Energy
      [ParticleRole.WRIST]: { min: 2.2, max: 3.8 }, // Giant Energy
      [ParticleRole.THUMB]: { min: 1.5, max: 2.8 }, // Binary Energy
      [ParticleRole.INDEX]: { min: 1.5, max: 2.8 }, // Cosmic Energy
      [ParticleRole.MIDDLE]: { min: 1.5, max: 2.8 }, // Galactic Energy
      [ParticleRole.RING]: { min: 1.5, max: 2.8 }, // Stellar Energy
      [ParticleRole.PINKY]: { min: 1.0, max: 2.2 }, // Dwarf Energy
      [ParticleRole.CONNECTION]: { min: 0.8, max: 1.5 }, // Dark Energy
      [ParticleRole.AURA]: { min: 1.0, max: 2.0 } // Nebula Energy
    };

    // Set primary and secondary colors
    const palette = colorPalettes[this.role];
    const secondaryPalette = secondaryPalettes[this.role];
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.secondaryColor = secondaryPalette[Math.floor(Math.random() * secondaryPalette.length)];
    this.baseColor = this.color;

    // Set cosmic size with stellar magnitude
    const sizeRange = sizeMaps[this.role];
    this.size = Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min;
    this.baseSize = this.size;
    this.stellarMagnitude = this.size / 5; // Brightness based on size

    // Set cosmic energy levels
    const energyRange = energyMaps[this.role];
    this.energy = Math.random() * (energyRange.max - energyRange.min) + energyRange.min;
    this.maxEnergy = energyRange.max;
    this.cosmicEnergy = this.energy * 2;

    // Set opacity with cosmic glow
    this.opacity = this.role === ParticleRole.CONNECTION ? 0.7 : 0.9;
    this.baseOpacity = this.opacity;

    // Set eternal life (cosmic particles don't die)
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

    // COSMIC TIME PROGRESSION
    this.phase += this.frequency * this.timeDistortion;
    this.spin += this.spinSpeed * deltaTime;
    this.quantumState = (this.quantumState + 0.01) % 1;
    this.dimensionalShift += 0.02;

    // QUANTUM FIELD FLUCTUATIONS
    this.updateQuantumFields();

    // GRAVITATIONAL AND ELECTROMAGNETIC FORCES
    this.applyCosmicForces(deltaTime);

    // MOUSE/HAND INTERACTION (Gravitational Lensing Effect)
    if (mouseX !== undefined && mouseY !== undefined) {
      this.handleGravitationalLensing(mouseX, mouseY, mouseRadius);
    } else {
      // STELLAR FORMATION - Return to constellation pattern
      this.formStellarConstellation();
    }

    // COSMIC PHENOMENA
    this.applyStellarEvolution(deltaTime);
    this.updateNebulaEffects();
    this.applyQuantumTunneling();

    // DIMENSIONAL SHIFTS
    this.updateDimensionalProperties();

    // TRAIL OF STARDUST
    this.updateCosmicTrail();

    // ENERGY RESONANCE
    this.updateEnergyResonance();

    // PLASMA DYNAMICS
    this.updatePlasmaDynamics(deltaTime);
  }

  private updateQuantumFields(): void {
    // Quantum field fluctuations affect particle behavior
    const quantumFluctuation = Math.sin(this.phase * 3) * 0.1;
    this.morphingFactor += quantumFluctuation;
    this.electricCharge += Math.sin(this.phase * 2) * 0.05;
    this.magneticField += Math.cos(this.phase * 1.5) * 0.03;
  }

  private applyCosmicForces(deltaTime: number): void {
    // Gravitational waves
    const gravWaveX = Math.sin(this.phase * 0.5) * this.gravitationalPull;
    const gravWaveY = Math.cos(this.phase * 0.7) * this.gravitationalPull;

    // Electromagnetic fields
    const emFieldX = this.electricCharge * Math.sin(this.phase * 2);
    const emFieldY = this.magneticField * Math.cos(this.phase * 1.8);

    // Apply forces
    this.velocityX += (gravWaveX + emFieldX) * deltaTime;
    this.velocityY += (gravWaveY + emFieldY) * deltaTime;
    this.velocityZ += Math.sin(this.phase * 0.3) * this.cosmicEnergy * deltaTime;
  }

  private handleGravitationalLensing(mouseX: number, mouseY: number, mouseRadius: number): void {
    // Advanced gravitational lensing effect
    const dxMouse = this.x - mouseX;
    const dyMouse = this.y - mouseY;
    const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

    if (distanceMouse < mouseRadius) {
      // Gravitational lensing bends space-time
      const lensStrength = (mouseRadius - distanceMouse) / mouseRadius;
      const bendingAngle = lensStrength * Math.PI * 0.5;

      // Curved space-time trajectory
      const forceDirectionX = dxMouse / distanceMouse;
      const forceDirectionY = dyMouse / distanceMouse;

      // Apply relativistic effects
      const relativisticFactor = 1 + lensStrength * 0.5;
      const directionX = forceDirectionX * lensStrength * this.density * relativisticFactor;
      const directionY = forceDirectionY * lensStrength * this.density * relativisticFactor;

      this.x += directionX;
      this.y += directionY;

      // Time dilation effects
      this.timeDistortion = 1 + lensStrength * 0.2;

      // Energy increase from gravitational field
      this.energy = Math.min(this.maxEnergy, this.energy + lensStrength * 0.5);
    } else {
      // Return to normal space-time
      this.timeDistortion = 1.0;
      this.formStellarConstellation();
    }
  }

  private formStellarConstellation(): void {
    // Advanced stellar formation with cosmic drift
    const dxTarget = this.targetX - this.x;
    const dyTarget = this.targetY - this.y;
    const dzTarget = this.targetZ - this.z;

    // Cosmic drift with stellar winds
    const stellarWind = Math.sin(this.phase * 0.1) * this.stellarMagnitude;
    const cosmicDrift = this.cosmicEnergy * 0.1;

    // Formation speed based on cosmic energy
    const formationSpeed = this.formingSpeed * (1 + this.energy * 0.2);

    this.x += (dxTarget / formationSpeed) + stellarWind;
    this.y += (dyTarget / formationSpeed) + cosmicDrift;
    this.z += dzTarget / formationSpeed;
  }

  private applyStellarEvolution(deltaTime: number): void {
    // Stellar evolution based on role and cosmic time
    const cosmicTime = performance.now() * 0.001;

    switch (this.role) {
      case ParticleRole.FINGER_TIP:
        // Pulsar behavior - rapid rotation and energy bursts
        this.pulseIntensity = Math.sin(cosmicTime * 10) * 0.5 + 0.5;
        this.size = this.baseSize * (1 + this.pulseIntensity * 0.8);
        this.energy += this.pulseIntensity * 0.1;

        // Pulsar beam rotation
        const beamAngle = this.spin * 10;
        this.x += Math.cos(beamAngle) * this.pulseIntensity * 2;
        this.y += Math.sin(beamAngle) * this.pulseIntensity * 2;
        break;

      case ParticleRole.PALM_CENTER:
        // Black hole behavior - massive gravitational effects
        const schwarzschildRadius = this.baseSize * 2;
        this.size = schwarzschildRadius * (0.8 + Math.sin(cosmicTime * 1.5) * 0.4);
        this.gravitationalPull = this.size / 10;

        // Accretion disk rotation
        this.spin += deltaTime * 2;
        this.temperature += this.energy * 100;
        break;

      case ParticleRole.FINGER_BONE:
        // Neutron star behavior - incredibly dense
        this.density += Math.sin(this.phase + this.jointIndex) * 5;
        this.magneticField = Math.sin(cosmicTime * 5) * 2;

        // Magnetic field lines
        const magneticWave = Math.sin(this.phase + this.jointIndex) * this.magneticField;
        this.x += magneticWave * 0.5;
        this.y += Math.cos(this.phase + this.jointIndex) * this.magneticField * 0.3;
        break;

      case ParticleRole.AURA:
        // Nebula behavior - gas and dust clouds
        this.nebulaEffect = Math.sin(cosmicTime * 0.5) * 0.5 + 0.5;
        this.plasmaDensity = this.nebulaEffect * 3;

        // Nebula drift
        this.x += Math.sin(this.phase) * this.nebulaEffect * 2;
        this.y += Math.cos(this.phase * 0.7) * this.nebulaEffect * 1.5;
        this.z += Math.sin(this.phase * 0.3) * this.nebulaEffect;
        break;

      case ParticleRole.CONNECTION:
        // Dark matter filaments - invisible but influential
        this.opacity = 0.3 + Math.sin(cosmicTime * 0.2) * 0.2;
        this.gravitationalPull = this.density * 0.1;
        break;

      default:
        // Regular stellar behavior
        this.temperature = 5778 + Math.sin(cosmicTime * 0.8) * 1000; // Sun-like
        this.stellarMagnitude = this.baseSize + Math.sin(cosmicTime) * 2;
        break;
    }
  }

  private updateNebulaEffects(): void {
    // Nebula gas dynamics
    if (this.role === ParticleRole.AURA || this.nebulaEffect > 0.5) {
      const gasFlow = Math.sin(this.phase * 0.5) * this.plasmaDensity;
      const ionization = this.temperature / 1000;

      // Gas expansion and contraction
      this.size = this.baseSize * (1 + gasFlow * 0.3);
      this.opacity = this.baseOpacity * (0.7 + ionization * 0.3);

      // Color shifting based on temperature
      this.updateSpectralClass();
    }
  }

  private applyQuantumTunneling(): void {
    // Quantum tunneling effects
    if (this.quantumState > 0.8) {
      // Particle can tunnel through barriers
      const tunnelProbability = (this.quantumState - 0.8) * 5;

      if (Math.random() < tunnelProbability * 0.01) {
        // Quantum jump to random position near target
        const jumpDistance = 50 * tunnelProbability;
        this.x += (Math.random() - 0.5) * jumpDistance;
        this.y += (Math.random() - 0.5) * jumpDistance;
        this.z += (Math.random() - 0.5) * jumpDistance;

        // Energy cost for tunneling
        this.energy *= 0.9;
      }
    }
  }

  private updateDimensionalProperties(): void {
    // Higher dimensional effects
    const dimensionalPhase = this.dimensionalShift;

    // 4th dimensional projection affects 3D position
    const fourthDimension = Math.sin(dimensionalPhase) * this.morphingFactor;
    this.x += fourthDimension * Math.cos(this.phase) * 0.5;
    this.y += fourthDimension * Math.sin(this.phase) * 0.5;

    // Dimensional resonance affects size and opacity
    this.size = this.baseSize * (1 + fourthDimension * 0.2);
    this.opacity = this.baseOpacity * (0.8 + Math.abs(fourthDimension) * 0.4);
  }

  private updateCosmicTrail(): void {
    // Stardust trail with 3D coordinates
    this.trail.push({
      x: this.x + Math.sin(this.spin) * this.stellarMagnitude,
      y: this.y + Math.cos(this.spin) * this.stellarMagnitude
    });

    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Trail particles have their own cosmic properties
    for (let i = 0; i < this.trail.length; i++) {
      const trailParticle = this.trail[i];
      const age = i / this.trail.length;

      // Trail particles fade and drift
      trailParticle.x += Math.sin(this.phase + i) * 0.2;
      trailParticle.y += Math.cos(this.phase + i) * 0.2;
    }
  }

  private updateEnergyResonance(): void {
    // Energy resonance with cosmic background radiation
    const cosmicBackground = Math.sin(performance.now() * 0.0001) * 0.1;
    const energyResonance = Math.sin(this.phase * this.resonance) * 0.2;

    this.energy += cosmicBackground + energyResonance;
    this.energy = Math.max(0.1, Math.min(this.maxEnergy, this.energy));

    // Energy affects all properties
    const energyFactor = this.energy / this.maxEnergy;

    // Size pulsation based on energy
    this.size = this.baseSize * (0.8 + energyFactor * 0.4);

    // Opacity based on energy state
    this.opacity = this.baseOpacity * (0.6 + energyFactor * 0.4);

    // Color intensity based on energy
    this.updateSpectralClass();
  }

  private updatePlasmaDynamics(deltaTime: number): void {
    // Plasma physics simulation
    if (this.temperature > 10000) { // Hot plasma
      this.plasmaDensity = this.density * (this.temperature / 10000);

      // Plasma instabilities
      const instability = Math.sin(this.phase * 5) * this.plasmaDensity * 0.1;
      this.x += instability * Math.cos(this.spin);
      this.y += instability * Math.sin(this.spin);

      // Magnetic reconnection events
      if (Math.random() < 0.001 * this.plasmaDensity) {
        this.energy += this.plasmaDensity * 0.5;
        this.temperature += 1000;

        // Plasma jet
        const jetAngle = Math.random() * Math.PI * 2;
        this.velocityX += Math.cos(jetAngle) * this.plasmaDensity;
        this.velocityY += Math.sin(jetAngle) * this.plasmaDensity;
      }
    }

    // Apply velocity with cosmic drag
    const cosmicDrag = 0.98;
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    this.z += this.velocityZ * deltaTime;

    this.velocityX *= cosmicDrag;
    this.velocityY *= cosmicDrag;
    this.velocityZ *= cosmicDrag;
  }

  private updateSpectralClass(): void {
    // Update color based on temperature (stellar spectral classification)
    let spectralColor = this.baseColor;

    if (this.temperature > 30000) { // O-class: Blue
      spectralColor = '#9BB0FF';
    } else if (this.temperature > 10000) { // B-class: Blue-white
      spectralColor = '#AABFFF';
    } else if (this.temperature > 7500) { // A-class: White
      spectralColor = '#CAD7FF';
    } else if (this.temperature > 6000) { // F-class: Yellow-white
      spectralColor = '#F8F7FF';
    } else if (this.temperature > 5200) { // G-class: Yellow (Sun-like)
      spectralColor = '#FFF4EA';
    } else if (this.temperature > 3700) { // K-class: Orange
      spectralColor = '#FFD2A1';
    } else { // M-class: Red
      spectralColor = '#FFAD51';
    }

    // Blend with base color based on energy
    const energyFactor = this.energy / this.maxEnergy;
    this.color = this.blendColors(this.baseColor, spectralColor, energyFactor);
  }

  private blendColors(color1: string, color2: string, factor: number): string {
    // Simple color blending
    const f = Math.max(0, Math.min(1, factor));
    return f > 0.5 ? color2 : color1;
  }

  public applyForce(forceX: number, forceY: number): void {
    this.speedX += forceX / this.mass;
    this.speedY += forceY / this.mass;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive || this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Render cosmic trail first
    this.renderCosmicTrail(ctx);

    // Render main cosmic particle based on role
    this.renderCosmicParticle(ctx);

    // Render additional cosmic effects
    this.renderCosmicEffects(ctx);

    ctx.restore();
  }

  private renderCosmicTrail(ctx: CanvasRenderingContext2D): void {
    if (this.trail.length < 2) return;

    // Stardust trail with cosmic glow
    for (let i = 1; i < this.trail.length; i++) {
      const current = this.trail[i];
      const previous = this.trail[i - 1];
      const alpha = (i / this.trail.length) * this.opacity * 0.6;
      const trailSize = this.size * (i / this.trail.length) * 0.5;

      ctx.globalAlpha = alpha;

      // Create gradient for trail segment
      const gradient = ctx.createLinearGradient(
        previous.x, previous.y, current.x, current.y
      );
      gradient.addColorStop(0, this.secondaryColor);
      gradient.addColorStop(1, this.color);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = trailSize;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }

    ctx.globalAlpha = this.opacity; // Reset alpha
  }

  private renderCosmicParticle(ctx: CanvasRenderingContext2D): void {
    switch (this.role) {
      case ParticleRole.PALM_CENTER:
        this.renderBlackHole(ctx);
        break;
      case ParticleRole.FINGER_TIP:
        this.renderPulsar(ctx);
        break;
      case ParticleRole.FINGER_JOINT:
        this.renderNeutronStar(ctx);
        break;
      case ParticleRole.FINGER_BONE:
        this.renderMagnetar(ctx);
        break;
      case ParticleRole.AURA:
        this.renderNebula(ctx);
        break;
      case ParticleRole.CONNECTION:
        this.renderDarkMatter(ctx);
        break;
      default:
        this.renderStar(ctx);
        break;
    }
  }

  private renderBlackHole(ctx: CanvasRenderingContext2D): void {
    // Event horizon
    const eventHorizon = this.size * 0.8;
    const accretionDisk = this.size * 2;

    // Accretion disk
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + this.spin;
      const diskRadius = accretionDisk * (0.5 + i * 0.1);
      const diskX = this.x + Math.cos(angle) * diskRadius;
      const diskY = this.y + Math.sin(angle) * diskRadius * 0.3; // Flattened disk

      const gradient = ctx.createRadialGradient(diskX, diskY, 0, diskX, diskY, diskRadius * 0.5);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(0.5, this.secondaryColor);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.globalAlpha = this.opacity * (0.8 - i * 0.1);
      ctx.beginPath();
      ctx.arc(diskX, diskY, diskRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Event horizon (pure black)
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(this.x, this.y, eventHorizon, 0, Math.PI * 2);
    ctx.fill();

    // Hawking radiation
    const hawkingGlow = ctx.createRadialGradient(this.x, this.y, eventHorizon, this.x, this.y, this.size * 3);
    hawkingGlow.addColorStop(0, 'transparent');
    hawkingGlow.addColorStop(0.7, this.color + '40');
    hawkingGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = hawkingGlow;
    ctx.globalAlpha = this.opacity * 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderPulsar(ctx: CanvasRenderingContext2D): void {
    // Pulsar core
    const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.3, this.color);
    coreGradient.addColorStop(1, this.secondaryColor);

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Pulsar beams
    const beamLength = this.size * 8;
    const beamWidth = this.size * 0.5;

    for (let i = 0; i < 2; i++) {
      const beamAngle = this.spin * 10 + i * Math.PI;
      const beamEndX = this.x + Math.cos(beamAngle) * beamLength;
      const beamEndY = this.y + Math.sin(beamAngle) * beamLength;

      const beamGradient = ctx.createLinearGradient(this.x, this.y, beamEndX, beamEndY);
      beamGradient.addColorStop(0, this.color);
      beamGradient.addColorStop(0.5, this.secondaryColor + '80');
      beamGradient.addColorStop(1, 'transparent');

      ctx.strokeStyle = beamGradient;
      ctx.lineWidth = beamWidth * this.pulseIntensity;
      ctx.lineCap = 'round';
      ctx.globalAlpha = this.opacity * this.pulseIntensity;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(beamEndX, beamEndY);
      ctx.stroke();
    }
  }

  private renderNeutronStar(ctx: CanvasRenderingContext2D): void {
    // Ultra-dense core
    const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.2, this.color);
    coreGradient.addColorStop(0.6, this.secondaryColor);
    coreGradient.addColorStop(1, '#000000');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Magnetic field lines
    for (let i = 0; i < 6; i++) {
      const fieldAngle = (i / 6) * Math.PI * 2 + this.spin;
      const fieldRadius = this.size * 2;
      const fieldX = this.x + Math.cos(fieldAngle) * fieldRadius;
      const fieldY = this.y + Math.sin(fieldAngle) * fieldRadius;

      ctx.strokeStyle = this.secondaryColor + '60';
      ctx.lineWidth = 1;
      ctx.globalAlpha = this.opacity * 0.7;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.quadraticCurveTo(
        this.x + Math.cos(fieldAngle + 0.5) * fieldRadius * 0.5,
        this.y + Math.sin(fieldAngle + 0.5) * fieldRadius * 0.5,
        fieldX, fieldY
      );
      ctx.stroke();
    }
  }

  private renderMagnetar(ctx: CanvasRenderingContext2D): void {
    // Magnetar core with intense magnetic field
    const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.3, this.color);
    coreGradient.addColorStop(0.7, this.secondaryColor);
    coreGradient.addColorStop(1, '#FF0000');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Intense magnetic field visualization
    const magneticIntensity = this.magneticField * 2;
    for (let i = 0; i < 12; i++) {
      const fieldAngle = (i / 12) * Math.PI * 2 + this.spin * 2;
      const fieldLength = this.size * (3 + magneticIntensity);
      const fieldEndX = this.x + Math.cos(fieldAngle) * fieldLength;
      const fieldEndY = this.y + Math.sin(fieldAngle) * fieldLength;

      const fieldGradient = ctx.createLinearGradient(this.x, this.y, fieldEndX, fieldEndY);
      fieldGradient.addColorStop(0, this.color);
      fieldGradient.addColorStop(0.5, '#FF00FF80');
      fieldGradient.addColorStop(1, 'transparent');

      ctx.strokeStyle = fieldGradient;
      ctx.lineWidth = magneticIntensity;
      ctx.globalAlpha = this.opacity * 0.8;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(fieldEndX, fieldEndY);
      ctx.stroke();
    }
  }

  private renderNebula(ctx: CanvasRenderingContext2D): void {
    // Nebula gas cloud with multiple layers
    const nebulaLayers = 5;

    for (let layer = 0; layer < nebulaLayers; layer++) {
      const layerSize = this.size * (1 + layer * 0.8);
      const layerAlpha = this.opacity * (0.8 - layer * 0.15);
      const layerOffset = layer * 2;

      const layerX = this.x + Math.sin(this.phase + layer) * layerOffset;
      const layerY = this.y + Math.cos(this.phase + layer) * layerOffset;

      const nebulaGradient = ctx.createRadialGradient(
        layerX, layerY, 0,
        layerX, layerY, layerSize
      );

      if (layer % 2 === 0) {
        nebulaGradient.addColorStop(0, this.color + '80');
        nebulaGradient.addColorStop(0.5, this.secondaryColor + '40');
      } else {
        nebulaGradient.addColorStop(0, this.secondaryColor + '60');
        nebulaGradient.addColorStop(0.5, this.color + '30');
      }
      nebulaGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = nebulaGradient;
      ctx.globalAlpha = layerAlpha;
      ctx.beginPath();
      ctx.arc(layerX, layerY, layerSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nebula dust particles
    for (let i = 0; i < 8; i++) {
      const dustAngle = (i / 8) * Math.PI * 2 + this.phase;
      const dustDistance = this.size * (1 + Math.sin(this.phase + i) * 0.5);
      const dustX = this.x + Math.cos(dustAngle) * dustDistance;
      const dustY = this.y + Math.sin(dustAngle) * dustDistance;
      const dustSize = this.size * 0.2;

      ctx.fillStyle = this.secondaryColor + '60';
      ctx.globalAlpha = this.opacity * 0.6;
      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderDarkMatter(ctx: CanvasRenderingContext2D): void {
    // Dark matter filament - mostly invisible but with gravitational lensing effect
    const lensRadius = this.size * 3;

    // Gravitational lensing distortion
    const lensGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, lensRadius);
    lensGradient.addColorStop(0, 'transparent');
    lensGradient.addColorStop(0.5, '#000000' + '20');
    lensGradient.addColorStop(0.8, this.color + '40');
    lensGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = lensGradient;
    ctx.globalAlpha = this.opacity * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, lensRadius, 0, Math.PI * 2);
    ctx.fill();

    // Dark matter core (barely visible)
    ctx.fillStyle = this.color + '80';
    ctx.globalAlpha = this.opacity * 0.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderStar(ctx: CanvasRenderingContext2D): void {
    // Regular star with corona
    const coronaGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
    coronaGradient.addColorStop(0, '#FFFFFF');
    coronaGradient.addColorStop(0.3, this.color);
    coronaGradient.addColorStop(0.7, this.secondaryColor);
    coronaGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = coronaGradient;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Star core
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = this.opacity * 0.9;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderCosmicEffects(ctx: CanvasRenderingContext2D): void {
    // Quantum field fluctuations
    if (this.quantumState > 0.7) {
      this.renderQuantumFluctuations(ctx);
    }

    // Gravitational waves
    if (this.gravitationalPull > 0.3) {
      this.renderGravitationalWaves(ctx);
    }

    // Electromagnetic aurora
    if (this.electricCharge > 0.5 || this.magneticField > 0.5) {
      this.renderElectromagneticAura(ctx);
    }

    // Dimensional rifts
    if (this.dimensionalShift > Math.PI) {
      this.renderDimensionalRift(ctx);
    }
  }

  private renderQuantumFluctuations(ctx: CanvasRenderingContext2D): void {
    // Quantum uncertainty visualization
    const fluctuationCount = 6;

    for (let i = 0; i < fluctuationCount; i++) {
      const angle = (i / fluctuationCount) * Math.PI * 2 + this.quantumState * Math.PI * 2;
      const distance = this.size * (1 + Math.sin(this.phase * 3 + i) * 0.5);
      const fluctX = this.x + Math.cos(angle) * distance;
      const fluctY = this.y + Math.sin(angle) * distance;
      const fluctSize = this.size * 0.3 * this.quantumState;

      const quantumGradient = ctx.createRadialGradient(fluctX, fluctY, 0, fluctX, fluctY, fluctSize * 2);
      quantumGradient.addColorStop(0, '#FFFFFF' + 'AA');
      quantumGradient.addColorStop(0.5, this.color + '60');
      quantumGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = quantumGradient;
      ctx.globalAlpha = this.opacity * this.quantumState * 0.7;
      ctx.beginPath();
      ctx.arc(fluctX, fluctY, fluctSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderGravitationalWaves(ctx: CanvasRenderingContext2D): void {
    // Spacetime distortion visualization
    const waveCount = 4;

    for (let wave = 0; wave < waveCount; wave++) {
      const waveRadius = this.size * (2 + wave * 1.5);
      const wavePhase = this.phase + wave * Math.PI * 0.5;
      const waveStrength = this.gravitationalPull * Math.sin(wavePhase);

      if (Math.abs(waveStrength) > 0.1) {
        ctx.strokeStyle = this.color + '40';
        ctx.lineWidth = Math.abs(waveStrength) * 3;
        ctx.globalAlpha = this.opacity * Math.abs(waveStrength);

        ctx.beginPath();
        ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  private renderElectromagneticAura(ctx: CanvasRenderingContext2D): void {
    // Electromagnetic field visualization
    const fieldStrength = Math.abs(this.electricCharge) + Math.abs(this.magneticField);
    const auraRadius = this.size * (2 + fieldStrength);

    const auraGradient = ctx.createRadialGradient(this.x, this.y, this.size, this.x, this.y, auraRadius);

    if (this.electricCharge > 0) {
      auraGradient.addColorStop(0, 'transparent');
      auraGradient.addColorStop(0.5, '#00FFFF' + '40');
      auraGradient.addColorStop(1, 'transparent');
    } else {
      auraGradient.addColorStop(0, 'transparent');
      auraGradient.addColorStop(0.5, '#FF00FF' + '40');
      auraGradient.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = auraGradient;
    ctx.globalAlpha = this.opacity * fieldStrength * 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, auraRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDimensionalRift(ctx: CanvasRenderingContext2D): void {
    // Higher dimensional portal effect
    const riftSize = this.size * this.morphingFactor;
    const riftAngle = this.dimensionalShift;

    // Rift opening
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.opacity * 0.8;

    ctx.beginPath();
    ctx.ellipse(this.x, this.y, riftSize, riftSize * 0.3, riftAngle, 0, Math.PI * 2);
    ctx.stroke();

    // Dimensional energy
    const energyGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, riftSize);
    energyGradient.addColorStop(0, '#FFFFFF' + 'CC');
    energyGradient.addColorStop(0.5, this.secondaryColor + '80');
    energyGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = energyGradient;
    ctx.globalAlpha = this.opacity * this.morphingFactor * 0.5;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, riftSize, riftSize * 0.3, riftAngle, 0, Math.PI * 2);
    ctx.fill();
  }

  // COSMIC UTILITY METHODS

  public setCosmicTarget(x: number, y: number, z: number = 0): void {
    this.targetX = x;
    this.targetY = y;
    this.targetZ = z;
    this.baseX = x;
    this.baseY = y;
    this.baseZ = z;
  }

  public setCosmicActive(active: boolean): void {
    this.isActive = active;
    if (!active) {
      this.opacity = 0;
      // Return to cosmic origin
      this.targetX = this.originX;
      this.targetY = this.originY;
      this.targetZ = this.originZ;
    } else {
      this.opacity = this.baseOpacity;
      // Move to stellar position
      this.targetX = this.baseX;
      this.targetY = this.baseY;
      this.targetZ = this.baseZ;
    }
  }

  public setCosmicEnergy(energy: number): void {
    this.energy = Math.max(0.1, Math.min(this.maxEnergy, energy));
    this.cosmicEnergy = this.energy * 2;
    this.updateEnergyEffects();
  }

  private updateEnergyEffects(): void {
    // Energy affects all cosmic properties
    const energyFactor = this.energy / this.maxEnergy;

    // Size varies with energy
    this.size = this.baseSize * (0.5 + energyFactor * 1.5);

    // Frequency varies with energy
    this.frequency = (0.01 + energyFactor * 0.05);

    // Amplitude varies with energy
    this.amplitude = (5 + energyFactor * 15);

    // Temperature varies with energy
    this.temperature = 273 + energyFactor * 10000;

    // Cosmic properties
    this.stellarMagnitude = energyFactor * 5;
    this.plasmaDensity = energyFactor * 3;
    this.gravitationalPull = energyFactor * 0.8;
  }

  public formCosmicConstellation(): void {
    // Form into cosmic constellation pattern
    this.isForming = true;
    this.targetX = this.baseX;
    this.targetY = this.baseY;
    this.targetZ = this.baseZ;

    // Increase cosmic energy for formation
    this.setCosmicEnergy(this.energy * 1.5);
  }

  public disperseIntoVoid(): void {
    // Disperse into cosmic void
    this.isForming = false;
    this.targetX = Math.random() * (window.innerWidth || 800);
    this.targetY = Math.random() * (window.innerHeight || 600);
    this.targetZ = Math.random() * 400 - 200;

    // Add cosmic drift
    this.velocityX += (Math.random() - 0.5) * 10;
    this.velocityY += (Math.random() - 0.5) * 10;
    this.velocityZ += (Math.random() - 0.5) * 10;
  }

  public triggerStellarExplosion(): void {
    // Supernova explosion
    this.energy = this.maxEnergy;
    this.temperature = 100000;
    this.size = this.baseSize * 3;
    this.opacity = 1.0;

    // Explosive velocity
    const explosionAngle = Math.random() * Math.PI * 2;
    this.velocityX += Math.cos(explosionAngle) * 20;
    this.velocityY += Math.sin(explosionAngle) * 20;
    this.velocityZ += (Math.random() - 0.5) * 20;

    // Cosmic shockwave
    this.gravitationalPull = 2.0;
    this.plasmaDensity = 5.0;
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
