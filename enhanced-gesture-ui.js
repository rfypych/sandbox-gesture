/**
 * Enhanced Gesture UI with Camera Preview and Visual Cursor
 * Improved accuracy and visual feedback for gesture control
 */

class EnhancedGestureUI {
    constructor(gestureController) {
        this.gestureController = gestureController;
        this.cameraPreview = null;
        this.virtualCursor = null;
        this.pinchCursor = null;
        this.isPreviewVisible = true;
        this.cursorPosition = { x: 0, y: 0 };
        this.pinchStrength = 0;
        this.gestureStability = 0;
        
        this.createEnhancedUI();
        this.setupVisualFeedback();
        this.bindEnhancedEvents();
    }

    /**
     * Create enhanced UI with camera preview
     */
    createEnhancedUI() {
        // Create camera preview window
        this.cameraPreview = document.createElement('div');
        this.cameraPreview.id = 'camera-preview';
        this.cameraPreview.className = 'camera-preview-window';
        this.cameraPreview.innerHTML = `
            <div class="preview-header">
                <span class="preview-title">📷 Camera Preview</span>
                <div class="preview-controls">
                    <button id="toggle-preview" class="preview-btn" title="Toggle Preview">👁️</button>
                    <button id="flip-camera" class="preview-btn" title="Flip Camera">🔄</button>
                    <button id="close-preview" class="preview-btn" title="Close">✕</button>
                </div>
            </div>
            <div class="preview-content">
                <video id="preview-video" autoplay muted playsinline></video>
                <canvas id="preview-overlay"></canvas>
                <div class="gesture-info">
                    <div class="current-gesture-display">
                        <span id="gesture-name">No Gesture</span>
                        <div class="confidence-bar">
                            <div id="confidence-fill" class="confidence-fill"></div>
                        </div>
                    </div>
                    <div class="stability-indicator">
                        <span>Stability: </span>
                        <div class="stability-bar">
                            <div id="stability-fill" class="stability-fill"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create virtual cursor for game canvas
        this.virtualCursor = document.createElement('div');
        this.virtualCursor.id = 'virtual-cursor';
        this.virtualCursor.className = 'virtual-cursor';
        
        // Create pinch cursor
        this.pinchCursor = document.createElement('div');
        this.pinchCursor.id = 'pinch-cursor';
        this.pinchCursor.className = 'pinch-cursor';
        this.pinchCursor.innerHTML = `
            <div class="pinch-indicator">
                <div class="pinch-circle"></div>
                <div class="pinch-target">+</div>
            </div>
        `;

        // Add to document
        document.body.appendChild(this.cameraPreview);
        document.body.appendChild(this.virtualCursor);
        document.body.appendChild(this.pinchCursor);

        this.applyEnhancedStyles();
    }

    /**
     * Apply enhanced styles
     */
    applyEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .camera-preview-window {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                height: 280px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #4CAF50;
                border-radius: 10px;
                z-index: 15000;
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                color: white;
                display: none;
                overflow: hidden;
            }

            .preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: #4CAF50;
                color: black;
            }

            .preview-title {
                font-size: 9px;
                font-weight: bold;
            }

            .preview-controls {
                display: flex;
                gap: 5px;
            }

            .preview-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: black;
                padding: 4px 6px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
            }

            .preview-btn:hover {
                background: rgba(255, 255, 255, 0.4);
            }

            .preview-content {
                position: relative;
                height: calc(100% - 32px);
            }

            #preview-video {
                width: 100%;
                height: 180px;
                object-fit: cover;
                transform: scaleX(-1); /* Mirror effect */
            }

            #preview-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 180px;
                pointer-events: none;
            }

            .gesture-info {
                padding: 8px;
                background: rgba(0, 0, 0, 0.8);
                height: calc(100% - 180px);
            }

            .current-gesture-display {
                margin-bottom: 8px;
            }

            #gesture-name {
                display: block;
                color: #4CAF50;
                font-size: 10px;
                margin-bottom: 4px;
            }

            .confidence-bar, .stability-bar {
                width: 100%;
                height: 8px;
                background: #333;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 4px;
            }

            .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff4444, #ffff44, #44ff44);
                width: 0%;
                transition: width 0.2s ease;
            }

            .stability-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff4444, #4CAF50);
                width: 0%;
                transition: width 0.2s ease;
            }

            .stability-indicator {
                font-size: 8px;
                color: #ccc;
            }

            .virtual-cursor {
                position: absolute;
                width: 20px;
                height: 20px;
                border: 2px solid #4CAF50;
                border-radius: 50%;
                background: rgba(76, 175, 80, 0.3);
                pointer-events: none;
                z-index: 10000;
                display: none;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
            }

            .virtual-cursor.active {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.3);
                box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
            }

            .pinch-cursor {
                position: absolute;
                width: 40px;
                height: 40px;
                pointer-events: none;
                z-index: 10001;
                display: none;
                transform: translate(-50%, -50%);
            }

            .pinch-indicator {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .pinch-circle {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 30px;
                height: 30px;
                border: 3px solid #2196F3;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.2s ease;
            }

            .pinch-circle.active {
                width: 20px;
                height: 20px;
                border-color: #ff4444;
                box-shadow: 0 0 15px rgba(255, 68, 68, 0.7);
            }

            .pinch-target {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #2196F3;
                font-size: 16px;
                font-weight: bold;
                transition: color 0.2s ease;
            }

            .pinch-target.active {
                color: #ff4444;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .camera-preview-window {
                    width: 280px;
                    height: 240px;
                    top: 10px;
                    right: 10px;
                }
                
                #preview-video {
                    height: 140px;
                }
                
                #preview-overlay {
                    height: 140px;
                }
            }

            /* Gesture feedback animations */
            @keyframes gestureDetected {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            .gesture-detected {
                animation: gestureDetected 0.3s ease;
            }

            /* Hand tracking visualization */
            .hand-landmark {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #4CAF50;
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }

            .hand-connection {
                position: absolute;
                background: #4CAF50;
                height: 2px;
                transform-origin: left center;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup visual feedback system
     */
    setupVisualFeedback() {
        // Override gesture controller's onResults to add visual feedback
        const originalOnResults = this.gestureController.onResults.bind(this.gestureController);

        this.gestureController.onResults = (results) => {
            try {
                // Call original processing
                originalOnResults(results);

                // Add enhanced visual feedback with error handling
                this.updateVisualFeedback(results);
            } catch (error) {
                console.error('Error in gesture processing:', error);
                // Reset cursors on error
                this.hideCursors();
            }
        };

        // Add periodic cursor position validation
        setInterval(() => {
            this.validateCursorPositions();
        }, 1000);
    }

    /**
     * Validate and fix cursor positions
     */
    validateCursorPositions() {
        if (!this.gestureController.isEnabled) return;

        // Check if cursors are stuck outside viewport
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        if (this.virtualCursor && this.virtualCursor.style.display === 'block') {
            const cursorX = parseInt(this.virtualCursor.style.left) || 0;
            const cursorY = parseInt(this.virtualCursor.style.top) || 0;

            // If cursor is way outside viewport, hide it
            if (cursorX < -100 || cursorX > viewport.width + 100 ||
                cursorY < -100 || cursorY > viewport.height + 100) {
                console.warn('Cursor detected outside viewport, hiding');
                this.hideCursors();
            }
        }
    }

    /**
     * Update visual feedback based on gesture results
     */
    updateVisualFeedback(results) {
        const previewVideo = document.getElementById('preview-video');
        const previewOverlay = document.getElementById('preview-overlay');

        if (!previewVideo || !previewOverlay) return;

        const ctx = previewOverlay.getContext('2d');
        ctx.clearRect(0, 0, previewOverlay.width, previewOverlay.height);

        // Set canvas size to match video
        previewOverlay.width = previewVideo.videoWidth || 320;
        previewOverlay.height = previewVideo.videoHeight || 240;

        // Reset cursor update flag
        let cursorUpdated = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];

                // Validate landmarks
                if (!landmarks || landmarks.length < 21) {
                    console.warn('Invalid landmarks detected');
                    continue;
                }

                // Draw enhanced hand landmarks
                this.drawEnhancedHandLandmarks(ctx, landmarks, handedness);

                // Update cursor position (only for the first valid hand)
                if (!cursorUpdated) {
                    this.updateCursorPosition(landmarks);
                    cursorUpdated = true;
                }

                // Check for pinch gesture
                const pinchData = this.detectPinchGesture(landmarks);
                this.updatePinchCursor(pinchData);

                // Update gesture info
                this.updateGestureInfo(landmarks, handedness);
            }
        } else {
            // Hide cursors when no hands detected
            this.hideCursors();
        }

        // Force cursor update if no valid hands but cursor should be visible
        if (!cursorUpdated && this.virtualCursor.style.display === 'block') {
            setTimeout(() => this.hideCursors(), 1000);
        }
    }

    /**
     * Draw enhanced hand landmarks with better visualization
     */
    drawEnhancedHandLandmarks(ctx, landmarks, handedness) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Draw connections first
        ctx.strokeStyle = handedness.label === 'Left' ? '#4CAF50' : '#2196F3';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;

        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm connections
        ];

        ctx.beginPath();
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            ctx.moveTo(startPoint.x * width, startPoint.y * height);
            ctx.lineTo(endPoint.x * width, endPoint.y * height);
        }
        ctx.stroke();

        // Draw landmarks
        ctx.globalAlpha = 1;
        for (let i = 0; i < landmarks.length; i++) {
            const landmark = landmarks[i];
            const x = landmark.x * width;
            const y = landmark.y * height;
            
            // Different colors for different finger parts
            if (i === 4 || i === 8 || i === 12 || i === 16 || i === 20) {
                // Fingertips
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            } else if (i === 0) {
                // Wrist
                ctx.fillStyle = '#ffff44';
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                // Other joints
                ctx.fillStyle = handedness.label === 'Left' ? '#4CAF50' : '#2196F3';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // Draw hand label
        const wrist = landmarks[0];
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(handedness.label, wrist.x * width + 10, wrist.y * height - 10);
    }

    /**
     * Update cursor position based on index finger
     */
    updateCursorPosition(landmarks) {
        const indexTip = landmarks[8]; // Index finger tip
        const gameCanvas = document.getElementById('game') || document.querySelector('canvas');

        if (!gameCanvas || !indexTip) {
            this.hideCursors();
            return;
        }

        const canvasRect = gameCanvas.getBoundingClientRect();

        // Convert normalized coordinates to screen coordinates with bounds checking
        const normalizedX = Math.max(0, Math.min(1, indexTip.x));
        const normalizedY = Math.max(0, Math.min(1, indexTip.y));

        const x = canvasRect.left + (normalizedX * canvasRect.width);
        const y = canvasRect.top + (normalizedY * canvasRect.height);

        // Only update if coordinates are valid
        if (isNaN(x) || isNaN(y) || x < 0 || y < 0) {
            return;
        }

        this.cursorPosition = { x, y };

        // Update virtual cursor position with smooth animation
        this.virtualCursor.style.left = x + 'px';
        this.virtualCursor.style.top = y + 'px';
        this.virtualCursor.style.display = 'block';
        this.virtualCursor.style.opacity = '1';

        // Check if cursor is active (pointing gesture)
        const gesture = this.gestureController.classifyHandGesture(landmarks);
        if (gesture === 'point') {
            this.virtualCursor.classList.add('active');
        } else {
            this.virtualCursor.classList.remove('active');
        }

        // Reset cursor hide timer
        clearTimeout(this.cursorHideTimer);
        this.cursorHideTimer = setTimeout(() => {
            this.virtualCursor.style.opacity = '0.5';
        }, 2000);
    }

    /**
     * Detect pinch gesture with strength measurement
     */
    detectPinchGesture(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        // Calculate distance between thumb and index finger
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        
        // Calculate pinch strength (0 = far apart, 1 = touching)
        const maxDistance = 0.15; // Maximum distance for pinch detection
        const pinchStrength = Math.max(0, 1 - (distance / maxDistance));
        
        // Calculate midpoint for cursor position
        const midX = (thumbTip.x + indexTip.x) / 2;
        const midY = (thumbTip.y + indexTip.y) / 2;
        
        return {
            isPinching: distance < 0.05,
            strength: pinchStrength,
            position: { x: midX, y: midY },
            distance: distance
        };
    }

    /**
     * Update pinch cursor visualization
     */
    updatePinchCursor(pinchData) {
        const gameCanvas = document.getElementById('game') || document.querySelector('canvas');
        if (!gameCanvas) return;

        const canvasRect = gameCanvas.getBoundingClientRect();
        
        // Convert normalized coordinates to screen coordinates
        const x = canvasRect.left + (pinchData.position.x * canvasRect.width);
        const y = canvasRect.top + (pinchData.position.y * canvasRect.height);
        
        // Update pinch cursor position
        this.pinchCursor.style.left = x + 'px';
        this.pinchCursor.style.top = y + 'px';
        this.pinchCursor.style.display = 'block';
        
        // Update pinch visual feedback
        const pinchCircle = this.pinchCursor.querySelector('.pinch-circle');
        const pinchTarget = this.pinchCursor.querySelector('.pinch-target');
        
        if (pinchData.isPinching) {
            pinchCircle.classList.add('active');
            pinchTarget.classList.add('active');
            
            // Trigger element selection
            this.triggerElementSelection(x, y);
        } else {
            pinchCircle.classList.remove('active');
            pinchTarget.classList.remove('active');
        }
        
        // Update circle size based on pinch strength
        const scale = 1 - (pinchData.strength * 0.3);
        pinchCircle.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    /**
     * Trigger element selection at pinch position
     */
    triggerElementSelection(x, y) {
        const gameCanvas = document.getElementById('game') || document.querySelector('canvas');
        if (!gameCanvas) return;

        // Create and dispatch middle mouse event for element selection
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: x,
            clientY: y,
            button: 1, // Middle button
            buttons: 4,
            bubbles: true,
            cancelable: true
        });

        gameCanvas.dispatchEvent(mouseEvent);
        
        // Visual feedback
        this.showSelectionFeedback(x, y);
    }

    /**
     * Show visual feedback for element selection
     */
    showSelectionFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 30px;
            height: 30px;
            border: 3px solid #4CAF50;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 20000;
            animation: selectionPulse 0.6s ease-out forwards;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes selectionPulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            feedback.remove();
            style.remove();
        }, 600);
    }

    /**
     * Update gesture information display
     */
    updateGestureInfo(landmarks, handedness) {
        const gestureName = document.getElementById('gesture-name');
        const confidenceFill = document.getElementById('confidence-fill');
        const stabilityFill = document.getElementById('stability-fill');
        
        if (!gestureName) return;

        // Get current gesture
        const gesture = this.gestureController.recognizeGesture(landmarks);
        const confidence = this.gestureController.gestureConfidence || 0;
        const stability = this.gestureController.calculateGestureStability() || 0;
        
        // Update display
        gestureName.textContent = this.getGestureDisplayName(gesture);
        confidenceFill.style.width = (confidence * 100) + '%';
        stabilityFill.style.width = (stability * 100) + '%';
        
        // Add gesture detected animation
        if (gesture !== 'unknown' && confidence > 0.7) {
            gestureName.classList.add('gesture-detected');
            setTimeout(() => gestureName.classList.remove('gesture-detected'), 300);
        }
    }

    /**
     * Get user-friendly gesture display name
     */
    getGestureDisplayName(gesture) {
        const names = {
            'point': '👆 Pointing',
            'peace': '✌️ Peace Sign',
            'pinch': '🤏 Pinching',
            'open_palm': '✋ Open Palm',
            'fist': '✊ Fist',
            'thumbs_up': '👍 Thumbs Up',
            'thumbs_down': '👎 Thumbs Down',
            'unknown': 'No Gesture'
        };
        
        return names[gesture] || gesture;
    }

    /**
     * Hide all cursors
     */
    hideCursors() {
        if (this.virtualCursor) {
            this.virtualCursor.style.display = 'none';
            this.virtualCursor.style.opacity = '0';
        }
        if (this.pinchCursor) {
            this.pinchCursor.style.display = 'none';
            this.pinchCursor.style.opacity = '0';
        }

        // Clear any pending timers
        if (this.cursorHideTimer) {
            clearTimeout(this.cursorHideTimer);
        }
    }

    /**
     * Bind enhanced events
     */
    bindEnhancedEvents() {
        // Camera preview controls
        document.getElementById('toggle-preview').onclick = () => this.togglePreview();
        document.getElementById('flip-camera').onclick = () => this.flipCamera();
        document.getElementById('close-preview').onclick = () => this.closePreview();
        
        // Show preview when gesture control starts
        window.addEventListener('gestureControlStarted', () => {
            this.showPreview();
            this.connectCameraPreview();
        });
        
        window.addEventListener('gestureControlStopped', () => {
            this.hidePreview();
        });
    }

    /**
     * Show camera preview
     */
    showPreview() {
        this.cameraPreview.style.display = 'block';
        this.isPreviewVisible = true;
    }

    /**
     * Hide camera preview
     */
    hidePreview() {
        this.cameraPreview.style.display = 'none';
        this.isPreviewVisible = false;
        this.hideCursors();
    }

    /**
     * Toggle camera preview
     */
    togglePreview() {
        if (this.isPreviewVisible) {
            this.hidePreview();
        } else {
            this.showPreview();
        }
    }

    /**
     * Flip camera (mirror effect)
     */
    flipCamera() {
        const video = document.getElementById('preview-video');
        const currentTransform = video.style.transform;
        
        if (currentTransform.includes('scaleX(-1)')) {
            video.style.transform = currentTransform.replace('scaleX(-1)', 'scaleX(1)');
        } else {
            video.style.transform = currentTransform.replace('scaleX(1)', 'scaleX(-1)');
        }
    }

    /**
     * Close camera preview
     */
    closePreview() {
        this.hidePreview();
    }

    /**
     * Connect camera preview to gesture controller
     */
    connectCameraPreview() {
        const previewVideo = document.getElementById('preview-video');
        
        if (this.gestureController.videoElement && previewVideo) {
            // Share the same video stream
            previewVideo.srcObject = this.gestureController.videoElement.srcObject;
        }
    }
}

// Initialize enhanced UI when gesture controller is available
window.addEventListener('load', () => {
    if (window.gestureController) {
        window.enhancedGestureUI = new EnhancedGestureUI(window.gestureController);
        console.log('✅ Enhanced Gesture UI initialized with camera preview and visual cursors');
    }
});
