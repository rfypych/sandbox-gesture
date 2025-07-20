/**
 * Sandboxels Gesture Control System
 * Menggunakan MediaPipe Hands untuk deteksi gesture real-time
 * Author: Enhanced by AI Assistant
 * Version: 1.0.0
 */

class GestureController {
    constructor() {
        this.isEnabled = false;
        this.isInitialized = false;
        this.camera = null;
        this.hands = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        
        // Gesture state tracking
        this.currentGesture = null;
        this.gestureConfidence = 0;
        this.gestureHistory = [];
        this.smoothingFrames = 5;
        
        // Game integration
        this.lastMousePosition = { x: 0, y: 0 };
        this.isDrawing = false;
        this.gestureCallbacks = {};
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = Date.now();
        this.currentFPS = 0;
        
        this.initializeGestureCallbacks();
    }

    /**
     * Initialize MediaPipe Hands
     */
    async initialize() {
        try {
            // Check if MediaPipe is available
            if (typeof Hands === 'undefined') {
                throw new Error('MediaPipe Hands library not loaded');
            }

            // Setup video element for camera feed
            this.videoElement = document.createElement('video');
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            // Setup canvas for hand landmarks visualization (optional)
            this.canvasElement = document.createElement('canvas');
            this.canvasElement.id = 'gesture-overlay';
            this.canvasElement.style.position = 'absolute';
            this.canvasElement.style.top = '0';
            this.canvasElement.style.left = '0';
            this.canvasElement.style.pointerEvents = 'none';
            this.canvasElement.style.zIndex = '1000';
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
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onResults.bind(this));

            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.isEnabled) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            this.isInitialized = true;
            console.log('Gesture Control initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Gesture Control:', error);
            throw error;
        }
    }

    /**
     * Start gesture recognition
     */
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            await this.camera.start();
            this.isEnabled = true;
            this.showGestureOverlay(true);
            console.log('Gesture Control started');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('gestureControlStarted'));
            
        } catch (error) {
            console.error('Failed to start Gesture Control:', error);
            throw error;
        }
    }

    /**
     * Stop gesture recognition
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        this.isEnabled = false;
        this.showGestureOverlay(false);
        console.log('Gesture Control stopped');
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('gestureControlStopped'));
    }

    /**
     * Toggle gesture control on/off
     */
    toggle() {
        if (this.isEnabled) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Show/hide gesture overlay canvas
     */
    showGestureOverlay(show) {
        if (this.canvasElement) {
            this.canvasElement.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Process MediaPipe results
     */
    onResults(results) {
        if (!this.isEnabled) return;

        // Update canvas size to match game canvas
        const gameCanvas = document.getElementById('gameCanvas') || document.querySelector('canvas');
        if (gameCanvas && this.canvasElement) {
            const rect = gameCanvas.getBoundingClientRect();
            this.canvasElement.width = rect.width;
            this.canvasElement.height = rect.height;
            this.canvasElement.style.width = rect.width + 'px';
            this.canvasElement.style.height = rect.height + 'px';
            this.canvasElement.style.left = rect.left + 'px';
            this.canvasElement.style.top = rect.top + 'px';
        }

        // Clear canvas
        if (this.canvasCtx) {
            this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }

        // Process hand landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];
                
                // Draw hand landmarks (optional visualization)
                this.drawHandLandmarks(landmarks);
                
                // Recognize gesture
                const gesture = this.recognizeGesture(landmarks, handedness);
                if (gesture) {
                    this.processGesture(gesture, landmarks);
                }
            }
        }

        // Update FPS counter
        this.updateFPS();
    }

    /**
     * Draw hand landmarks on overlay canvas
     */
    drawHandLandmarks(landmarks) {
        if (!this.canvasCtx) return;

        this.canvasCtx.fillStyle = '#00FF00';
        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 2;

        // Draw landmarks
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvasElement.width;
            const y = landmark.y * this.canvasElement.height;
            
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        }

        // Draw connections (simplified)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        ];

        this.canvasCtx.beginPath();
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.canvasCtx.moveTo(
                startPoint.x * this.canvasElement.width,
                startPoint.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                endPoint.x * this.canvasElement.width,
                endPoint.y * this.canvasElement.height
            );
        }
        this.canvasCtx.stroke();
    }

    /**
     * Recognize gesture from hand landmarks
     */
    recognizeGesture(landmarks, handedness) {
        // Implement gesture recognition logic
        const gesture = this.classifyHandGesture(landmarks);
        
        // Add to history for smoothing
        this.gestureHistory.push(gesture);
        if (this.gestureHistory.length > this.smoothingFrames) {
            this.gestureHistory.shift();
        }

        // Get most common gesture in recent history
        const smoothedGesture = this.getMostCommonGesture();
        
        return {
            type: smoothedGesture,
            confidence: this.calculateGestureConfidence(),
            landmarks: landmarks,
            handedness: handedness.label,
            position: this.getHandPosition(landmarks)
        };
    }

    /**
     * Classify hand gesture based on landmarks
     */
    classifyHandGesture(landmarks) {
        // Get finger states (extended or folded)
        const fingers = this.getFingerStates(landmarks);
        
        // Gesture classification logic
        if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'thumbs_up';
        } else if (!fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'point';
        } else if (!fingers.thumb && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'peace';
        } else if (fingers.thumb && fingers.index && fingers.middle && fingers.ring && fingers.pinky) {
            return 'open_palm';
        } else if (!fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'fist';
        } else if (this.isPinchGesture(landmarks)) {
            return 'pinch';
        }
        
        return 'unknown';
    }

    /**
     * Get finger extension states
     */
    getFingerStates(landmarks) {
        return {
            thumb: landmarks[4].y < landmarks[3].y,
            index: landmarks[8].y < landmarks[6].y,
            middle: landmarks[12].y < landmarks[10].y,
            ring: landmarks[16].y < landmarks[14].y,
            pinky: landmarks[20].y < landmarks[18].y
        };
    }

    /**
     * Check if current gesture is a pinch
     */
    isPinchGesture(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        return distance < 0.05; // Threshold for pinch detection
    }

    /**
     * Get hand center position
     */
    getHandPosition(landmarks) {
        const wrist = landmarks[0];
        return {
            x: wrist.x * this.canvasElement.width,
            y: wrist.y * this.canvasElement.height
        };
    }

    /**
     * Get most common gesture from history
     */
    getMostCommonGesture() {
        const counts = {};
        for (const gesture of this.gestureHistory) {
            counts[gesture] = (counts[gesture] || 0) + 1;
        }
        
        let maxCount = 0;
        let mostCommon = 'unknown';
        for (const [gesture, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = gesture;
            }
        }
        
        return mostCommon;
    }

    /**
     * Calculate gesture confidence
     */
    calculateGestureConfidence() {
        if (this.gestureHistory.length === 0) return 0;
        
        const mostCommon = this.getMostCommonGesture();
        const count = this.gestureHistory.filter(g => g === mostCommon).length;
        return count / this.gestureHistory.length;
    }

    /**
     * Process recognized gesture
     */
    processGesture(gesture, landmarks) {
        if (gesture.confidence < 0.6) return; // Confidence threshold

        // Update current gesture
        this.currentGesture = gesture;
        
        // Execute gesture callback
        if (this.gestureCallbacks[gesture.type]) {
            this.gestureCallbacks[gesture.type](gesture);
        }

        // Update mouse position for drawing
        this.updateMousePosition(gesture.position);
    }

    /**
     * Initialize gesture callbacks for Sandboxels integration
     */
    initializeGestureCallbacks() {
        this.gestureCallbacks = {
            'point': (gesture) => this.handleDrawGesture(gesture),
            'peace': (gesture) => this.handleEraseGesture(gesture),
            'pinch': (gesture) => this.handleSelectGesture(gesture),
            'open_palm': (gesture) => this.handlePauseGesture(gesture),
            'fist': (gesture) => this.handleResetGesture(gesture),
            'thumbs_up': (gesture) => this.handleBrushSizeUp(gesture),
            'thumbs_down': (gesture) => this.handleBrushSizeDown(gesture)
        };
    }

    /**
     * Handle drawing gesture
     */
    handleDrawGesture(gesture) {
        // Simulate mouse down and move for drawing
        this.simulateMouseEvent('mousedown', gesture.position);
        this.isDrawing = true;
    }

    /**
     * Handle erase gesture
     */
    handleEraseGesture(gesture) {
        // Switch to erase mode and simulate right click
        this.simulateMouseEvent('contextmenu', gesture.position);
    }

    /**
     * Handle element selection gesture
     */
    handleSelectGesture(gesture) {
        // Simulate middle click for element picking
        this.simulateMouseEvent('mousedown', gesture.position, 1); // Middle button
    }

    /**
     * Handle pause gesture
     */
    handlePauseGesture(gesture) {
        // Trigger pause/play toggle
        if (typeof togglePause === 'function') {
            togglePause();
        }
    }

    /**
     * Handle reset gesture
     */
    handleResetGesture(gesture) {
        // Trigger reset function
        if (typeof resetPrompt === 'function') {
            resetPrompt();
        }
    }

    /**
     * Handle brush size increase
     */
    handleBrushSizeUp(gesture) {
        if (typeof mouseSize !== 'undefined') {
            mouseSize += 2;
            if (typeof checkMouseSize === 'function') {
                checkMouseSize(true);
            }
        }
    }

    /**
     * Handle brush size decrease
     */
    handleBrushSizeDown(gesture) {
        if (typeof mouseSize !== 'undefined') {
            mouseSize = Math.max(1, mouseSize - 2);
            if (typeof checkMouseSize === 'function') {
                checkMouseSize(true);
            }
        }
    }

    /**
     * Update mouse position for game integration
     */
    updateMousePosition(position) {
        this.lastMousePosition = position;
        
        // Update global mouse coordinates if they exist
        if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
            mouseX = position.x;
            mouseY = position.y;
        }
    }

    /**
     * Simulate mouse events for game integration
     */
    simulateMouseEvent(type, position, button = 0) {
        const gameCanvas = document.getElementById('gameCanvas') || document.querySelector('canvas');
        if (!gameCanvas) return;

        const event = new MouseEvent(type, {
            clientX: position.x,
            clientY: position.y,
            button: button,
            buttons: button === 0 ? 1 : (button === 1 ? 4 : 2),
            bubbles: true,
            cancelable: true
        });

        gameCanvas.dispatchEvent(event);
    }

    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isInitialized: this.isInitialized,
            currentGesture: this.currentGesture,
            fps: this.currentFPS,
            confidence: this.gestureConfidence
        };
    }
}

// Global instance
window.gestureController = new GestureController();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureController;
}
