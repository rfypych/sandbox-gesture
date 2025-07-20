/**
 * Hand Tracking Module for Sandboxels Gesture Control
 * Handles MediaPipe Hands integration, camera initialization, and basic hand detection
 */

class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.isInitialized = false;
        this.isTracking = false;
        this.lastResults = null;
        this.onResultsCallback = null;
        this.onErrorCallback = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFpsTime = Date.now();
        this.currentFps = 0;
        
        // Configuration
        this.config = {
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5,
            cameraWidth: 640,
            cameraHeight: 480
        };
    }

    /**
     * Initialize MediaPipe Hands and camera
     */
    async initialize() {
        try {
            // Check if MediaPipe is available
            if (typeof Hands === 'undefined') {
                throw new Error('MediaPipe Hands library not loaded');
            }

            // Create video element for camera feed
            this.videoElement = document.createElement('video');
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            // Create canvas for MediaPipe processing
            this.canvasElement = document.createElement('canvas');
            this.canvasElement.width = this.config.cameraWidth;
            this.canvasElement.height = this.config.cameraHeight;
            this.canvasElement.style.display = 'none';
            document.body.appendChild(this.canvasElement);
            this.canvasCtx = this.canvasElement.getContext('2d');

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: this.config.maxNumHands,
                modelComplexity: this.config.modelComplexity,
                minDetectionConfidence: this.config.minDetectionConfidence,
                minTrackingConfidence: this.config.minTrackingConfidence,
            });

            this.hands.onResults(this.onResults.bind(this));

            // Initialize camera
            await this.initializeCamera();

            this.isInitialized = true;
            console.log('Hand tracking initialized successfully');
            return true;

        } catch (error) {
            console.error('Failed to initialize hand tracking:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback('initialization', error.message);
            }
            return false;
        }
    }

    /**
     * Initialize camera access
     */
    async initializeCamera() {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera access not supported in this browser');
            }

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: this.config.cameraWidth,
                    height: this.config.cameraHeight,
                    facingMode: 'user' // Front-facing camera
                }
            });

            this.videoElement.srcObject = stream;
            this.videoElement.play();

            // Wait for video to be ready
            return new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
                this.videoElement.onerror = (error) => {
                    reject(new Error('Failed to load camera stream'));
                };
            });

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera access denied. Please allow camera permissions and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera found. Please connect a camera and refresh the page.');
            } else {
                throw new Error(`Camera initialization failed: ${error.message}`);
            }
        }
    }

    /**
     * Start hand tracking
     */
    async startTracking() {
        if (!this.isInitialized) {
            const success = await this.initialize();
            if (!success) return false;
        }

        this.isTracking = true;
        this.processFrame();
        console.log('Hand tracking started');
        return true;
    }

    /**
     * Stop hand tracking
     */
    stopTracking() {
        this.isTracking = false;
        
        // Stop camera stream
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }

        console.log('Hand tracking stopped');
    }

    /**
     * Process video frame for hand detection
     */
    async processFrame() {
        if (!this.isTracking || !this.videoElement || !this.hands) {
            return;
        }

        try {
            // Send frame to MediaPipe
            await this.hands.send({ image: this.videoElement });
            
            // Update FPS counter
            this.updateFps();
            
            // Schedule next frame
            requestAnimationFrame(() => this.processFrame());
            
        } catch (error) {
            console.error('Error processing frame:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback('processing', error.message);
            }
        }
    }

    /**
     * Handle MediaPipe results
     */
    onResults(results) {
        this.lastResults = results;
        
        // Call external callback if provided
        if (this.onResultsCallback) {
            this.onResultsCallback(results);
        }
    }

    /**
     * Update FPS counter
     */
    updateFps() {
        this.frameCount++;
        const now = Date.now();
        
        if (now - this.lastFpsTime >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
        }
    }

    /**
     * Get current hand landmarks
     */
    getHandLandmarks() {
        if (!this.lastResults || !this.lastResults.multiHandLandmarks || this.lastResults.multiHandLandmarks.length === 0) {
            return null;
        }
        
        return this.lastResults.multiHandLandmarks[0]; // Return first hand
    }

    /**
     * Get hand detection confidence
     */
    getHandConfidence() {
        if (!this.lastResults || !this.lastResults.multiHandedness || this.lastResults.multiHandedness.length === 0) {
            return 0;
        }
        
        return this.lastResults.multiHandedness[0].score;
    }

    /**
     * Check if hand is detected
     */
    isHandDetected() {
        return this.getHandLandmarks() !== null;
    }

    /**
     * Get current FPS
     */
    getFps() {
        return this.currentFps;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.hands) {
            this.hands.setOptions({
                maxNumHands: this.config.maxNumHands,
                modelComplexity: this.config.modelComplexity,
                minDetectionConfidence: this.config.minDetectionConfidence,
                minTrackingConfidence: this.config.minTrackingConfidence,
            });
        }
    }

    /**
     * Set callback for hand tracking results
     */
    setOnResultsCallback(callback) {
        this.onResultsCallback = callback;
    }

    /**
     * Set callback for errors
     */
    setOnErrorCallback(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopTracking();
        
        if (this.videoElement) {
            document.body.removeChild(this.videoElement);
            this.videoElement = null;
        }
        
        if (this.canvasElement) {
            document.body.removeChild(this.canvasElement);
            this.canvasElement = null;
        }
        
        this.hands = null;
        this.isInitialized = false;
    }
}

// Export for use in other modules
window.HandTracker = HandTracker;
