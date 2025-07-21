// MediaPipe types and CDN loading
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

// Load MediaPipe from CDN
async function loadMediaPipeFromCDN(): Promise<boolean> {
  try {
    // Load MediaPipe scripts from CDN
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
    ]);

    // Wait a bit for scripts to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    return !!(window.Hands && window.Camera);
  } catch (error) {
    console.warn('Failed to load MediaPipe from CDN:', error);
    return false;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  handedness: string;
  palmCenter: { x: number; y: number };
  fingerTips: { x: number; y: number }[];
  isOpen: boolean;
  isPinching: boolean;
}

export class HandTracker {
  private hands: any = null;
  private camera: any = null;
  private video: HTMLVideoElement;
  private handData: HandData[] = [];
  private isInitialized: boolean = false;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
    // MediaPipe will be loaded asynchronously in initialize()
  }

  private setupHands(): void {
    if (!this.hands) return;

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults(this.onResults.bind(this));
  }

  public async initialize(): Promise<void> {
    try {
      // Load MediaPipe from CDN
      const loaded = await loadMediaPipeFromCDN();
      if (!loaded) {
        console.warn('MediaPipe not available, skipping hand tracking initialization');
        return;
      }

      // Initialize MediaPipe Hands
      this.hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      this.setupHands();

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      this.video.srcObject = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        this.video.onloadedmetadata = () => {
          this.canvasWidth = window.innerWidth;
          this.canvasHeight = window.innerHeight;
          resolve();
        };
      });

      // Initialize camera
      this.camera = new window.Camera(this.video, {
        onFrame: async () => {
          if (this.hands) {
            await this.hands.send({ image: this.video });
          }
        },
        width: 1280,
        height: 720
      });

      await this.camera.start();
      this.isInitialized = true;

    } catch (error) {
      console.error('Failed to initialize hand tracking:', error);
      // Don't throw error, just log it so the app can continue without hand tracking
      console.warn('Continuing without hand tracking...');
    }
  }

  private onResults(results: Results): void {
    this.handData = [];

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i];

        // Convert landmarks to screen coordinates
        const convertedLandmarks: HandLandmark[] = landmarks.map(landmark => ({
          x: landmark.x * this.canvasWidth,
          y: landmark.y * this.canvasHeight,
          z: landmark.z
        }));

        // Calculate palm center (average of palm landmarks)
        const palmLandmarks = [0, 1, 2, 5, 9, 13, 17]; // Key palm points
        const palmCenter = this.calculateCenter(convertedLandmarks, palmLandmarks);

        // Get finger tips
        const fingerTips = [4, 8, 12, 16, 20].map(index => ({
          x: convertedLandmarks[index].x,
          y: convertedLandmarks[index].y
        }));

        // Detect hand gestures
        const isOpen = this.detectOpenHand(convertedLandmarks);
        const isPinching = this.detectPinch(convertedLandmarks);

        this.handData.push({
          landmarks: convertedLandmarks,
          handedness: handedness.label,
          palmCenter,
          fingerTips,
          isOpen,
          isPinching
        });
      }
    }
  }

  private calculateCenter(landmarks: HandLandmark[], indices: number[]): { x: number; y: number } {
    let x = 0, y = 0;
    for (const index of indices) {
      x += landmarks[index].x;
      y += landmarks[index].y;
    }
    return {
      x: x / indices.length,
      y: y / indices.length
    };
  }

  private detectOpenHand(landmarks: HandLandmark[]): boolean {
    // Check if fingers are extended
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerMCPs = [3, 6, 10, 14, 18];
    
    let extendedFingers = 0;
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const mcp = landmarks[fingerMCPs[i]];
      
      // For thumb, check x-axis; for others, check y-axis
      if (i === 0) {
        if (Math.abs(tip.x - mcp.x) > 30) extendedFingers++;
      } else {
        if (tip.y < mcp.y - 20) extendedFingers++;
      }
    }
    
    return extendedFingers >= 4;
  }

  private detectPinch(landmarks: HandLandmark[]): boolean {
    const thumb = landmarks[4];
    const index = landmarks[8];
    const distance = Math.sqrt(
      Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
    );
    return distance < 40;
  }

  public getHandData(): HandData[] {
    return this.handData;
  }

  public getHandCount(): number {
    return this.handData.length;
  }

  public renderDebug(ctx: CanvasRenderingContext2D): void {
    if (!this.handData.length) return;

    ctx.save();
    
    for (const hand of this.handData) {
      // Draw palm center
      ctx.fillStyle = hand.isPinching ? '#ff0000' : (hand.isOpen ? '#00ff00' : '#ffff00');
      ctx.beginPath();
      ctx.arc(hand.palmCenter.x, hand.palmCenter.y, 10, 0, 2 * Math.PI);
      ctx.fill();

      // Draw finger tips
      ctx.fillStyle = '#ffffff';
      for (const tip of hand.fingerTips) {
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw connections between landmarks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      this.drawHandConnections(ctx, hand.landmarks);
    }
    
    ctx.restore();
  }

  private drawHandConnections(ctx: CanvasRenderingContext2D, landmarks: HandLandmark[]): void {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    ctx.beginPath();
    for (const [start, end] of connections) {
      ctx.moveTo(landmarks[start].x, landmarks[start].y);
      ctx.lineTo(landmarks[end].x, landmarks[end].y);
    }
    ctx.stroke();
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}
