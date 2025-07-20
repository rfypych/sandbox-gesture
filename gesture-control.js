/**
 * Main Gesture Control Module for Sandboxels
 * Integrates hand tracking and gesture recognition with the game's input system
 */

class GestureController {
    constructor() {
        this.handTracker = null;
        this.gestureRecognizer = null;
        this.isEnabled = false;
        this.inputMode = 'mouse'; // 'mouse' or 'gesture'
        
        // Gesture state tracking
        this.previousGestureState = {
            isPinching: false,
            isTwoFingerPinch: false,
            isOpenPalm: false,
            isClosedFist: false
        };
        
        // Performance monitoring
        this.performanceStats = {
            fps: 0,
            latency: 0,
            handDetected: false
        };
        
        // Settings
        this.settings = {
            enabled: false,
            sensitivity: 0.7,
            smoothing: 0.3,
            showHandSkeleton: false,
            showGestureIndicators: true,
            autoTogglePause: true, // Auto pause/unpause with open palm
            autoClearSelection: true // Auto clear selection with closed fist
        };
        
        // UI elements
        this.statusIndicator = null;
        this.gestureOverlay = null;
        
        // Bind methods
        this.onHandTrackingResults = this.onHandTrackingResults.bind(this);
        this.onHandTrackingError = this.onHandTrackingError.bind(this);
    }

    /**
     * Initialize gesture control system
     */
    async initialize() {
        try {
            console.log('Initializing gesture control system...');
            
            // Create hand tracker and gesture recognizer
            this.handTracker = new HandTracker();
            this.gestureRecognizer = new GestureRecognizer();
            
            // Set up callbacks
            this.handTracker.setOnResultsCallback(this.onHandTrackingResults);
            this.handTracker.setOnErrorCallback(this.onHandTrackingError);
            
            // Create UI elements
            this.createStatusIndicator();
            this.createGestureOverlay();
            
            // Add keyboard shortcut for toggling gesture mode
            this.addKeyboardShortcuts();
            
            console.log('Gesture control system initialized');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize gesture control:', error);
            return false;
        }
    }

    /**
     * Enable gesture control
     */
    async enable() {
        if (this.isEnabled) return true;
        
        try {
            // Initialize hand tracking
            const success = await this.handTracker.startTracking();
            if (!success) {
                throw new Error('Failed to start hand tracking');
            }
            
            this.isEnabled = true;
            this.inputMode = 'gesture';
            this.settings.enabled = true;
            
            // Update UI
            this.updateStatusIndicator('active');
            this.showGestureOverlay();
            
            console.log('Gesture control enabled');
            return true;
            
        } catch (error) {
            console.error('Failed to enable gesture control:', error);
            this.updateStatusIndicator('error');
            return false;
        }
    }

    /**
     * Disable gesture control
     */
    disable() {
        if (!this.isEnabled) return;
        
        this.handTracker.stopTracking();
        this.isEnabled = false;
        this.inputMode = 'mouse';
        this.settings.enabled = false;
        
        // Update UI
        this.updateStatusIndicator('inactive');
        this.hideGestureOverlay();
        
        console.log('Gesture control disabled');
    }

    /**
     * Toggle gesture control on/off
     */
    async toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            await this.enable();
        }
    }

    /**
     * Handle hand tracking results
     */
    onHandTrackingResults(results) {
        if (!this.isEnabled || this.inputMode !== 'gesture') return;
        
        // Update performance stats
        this.performanceStats.fps = this.handTracker.getFps();
        this.performanceStats.handDetected = this.handTracker.isHandDetected();
        
        // Get canvas dimensions for coordinate mapping
        const canvas = document.getElementById('game');
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const canvasWidth = width; // Game canvas width in pixels
        const canvasHeight = height; // Game canvas height in pixels
        
        // Process gestures
        const landmarks = this.handTracker.getHandLandmarks();
        const gestureState = this.gestureRecognizer.processLandmarks(landmarks, canvasWidth, canvasHeight);
        
        // Handle gesture events
        this.handleGestureEvents(gestureState);
        
        // Update visual feedback
        if (this.settings.showGestureIndicators && typeof gestureUI !== 'undefined') {
            gestureUI.updateGestureIndicators(gestureState, landmarks);
            gestureUI.updateHandSkeleton(landmarks);
        }
    }

    /**
     * Handle gesture events and map to game actions
     */
    handleGestureEvents(gestureState) {
        // Update cursor position
        if (typeof mousePos !== 'undefined') {
            mousePos.x = Math.max(0, Math.min(width, gestureState.cursorPosition.x));
            mousePos.y = Math.max(0, Math.min(height, gestureState.cursorPosition.y));
        }
        
        // Handle pinch gesture (left click)
        if (gestureState.isPinching && !this.previousGestureState.isPinching) {
            this.simulateMouseDown('left');
        } else if (!gestureState.isPinching && this.previousGestureState.isPinching) {
            this.simulateMouseUp('left');
        }
        
        // Handle two-finger pinch (right click)
        if (gestureState.isTwoFingerPinch && !this.previousGestureState.isTwoFingerPinch) {
            this.simulateMouseDown('right');
        } else if (!gestureState.isTwoFingerPinch && this.previousGestureState.isTwoFingerPinch) {
            this.simulateMouseUp('right');
        }
        
        // Handle open palm (pause/unpause)
        if (this.settings.autoTogglePause && gestureState.isOpenPalm && !this.previousGestureState.isOpenPalm) {
            if (typeof togglePause === 'function') {
                togglePause();
            }
        }
        
        // Handle closed fist (clear selection)
        if (this.settings.autoClearSelection && gestureState.isClosedFist && !this.previousGestureState.isClosedFist) {
            if (typeof selectElement === 'function') {
                selectElement('unknown');
            }
        }
        
        // Update previous state
        this.previousGestureState = {
            isPinching: gestureState.isPinching,
            isTwoFingerPinch: gestureState.isTwoFingerPinch,
            isOpenPalm: gestureState.isOpenPalm,
            isClosedFist: gestureState.isClosedFist
        };
    }

    /**
     * Simulate mouse down event
     */
    simulateMouseDown(button) {
        if (typeof mouseIsDown !== 'undefined' && typeof mouseType !== 'undefined') {
            mouseIsDown = true;
            mouseType = button;
            
            // Call appropriate mouse action
            if (typeof mouseAction === 'function') {
                mouseAction(null, mousePos.x, mousePos.y);
            }
        }
    }

    /**
     * Simulate mouse up event
     */
    simulateMouseUp(button) {
        if (typeof mouseIsDown !== 'undefined') {
            mouseIsDown = false;
        }
    }

    /**
     * Handle hand tracking errors
     */
    onHandTrackingError(errorType, message) {
        console.error(`Hand tracking error (${errorType}):`, message);
        
        // Update status indicator
        this.updateStatusIndicator('error');
        
        // Show user-friendly error message
        this.showErrorMessage(errorType, message);
    }

    /**
     * Create status indicator UI element
     */
    createStatusIndicator() {
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.id = 'gesture-status-indicator';
        this.statusIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #666;
            border: 2px solid #333;
            z-index: 1000;
            cursor: pointer;
            transition: background-color 0.3s;
        `;
        this.statusIndicator.title = 'Gesture Control Status (Click to toggle)';
        this.statusIndicator.addEventListener('click', () => this.toggle());
        
        document.body.appendChild(this.statusIndicator);
        this.updateStatusIndicator('inactive');
    }

    /**
     * Update status indicator appearance
     */
    updateStatusIndicator(status) {
        if (!this.statusIndicator) return;
        
        const colors = {
            inactive: '#666',
            active: '#4CAF50',
            error: '#F44336'
        };
        
        this.statusIndicator.style.backgroundColor = colors[status] || colors.inactive;
        
        const titles = {
            inactive: 'Gesture Control: Disabled (Click to enable)',
            active: 'Gesture Control: Active (Click to disable)',
            error: 'Gesture Control: Error (Click to retry)'
        };
        
        this.statusIndicator.title = titles[status] || titles.inactive;
    }

    /**
     * Create gesture overlay for visual feedback
     */
    createGestureOverlay() {
        this.gestureOverlay = document.createElement('div');
        this.gestureOverlay.id = 'gesture-overlay';
        this.gestureOverlay.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            width: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            display: none;
        `;
        
        document.body.appendChild(this.gestureOverlay);
    }

    /**
     * Show gesture overlay
     */
    showGestureOverlay() {
        if (this.gestureOverlay) {
            this.gestureOverlay.style.display = 'block';
        }
    }

    /**
     * Hide gesture overlay
     */
    hideGestureOverlay() {
        if (this.gestureOverlay) {
            this.gestureOverlay.style.display = 'none';
        }
    }

    /**
     * Update gesture indicators in overlay
     */
    updateGestureIndicators(gestureState) {
        if (!this.gestureOverlay) return;
        
        const html = `
            <div><strong>Gesture Control</strong></div>
            <div>FPS: ${this.performanceStats.fps}</div>
            <div>Hand: ${this.performanceStats.handDetected ? 'Detected' : 'Not detected'}</div>
            <div>Position: ${gestureState.cursorPosition.x}, ${gestureState.cursorPosition.y}</div>
            <div>Pinch: ${gestureState.isPinching ? 'Yes' : 'No'}</div>
            <div>Two-finger: ${gestureState.isTwoFingerPinch ? 'Yes' : 'No'}</div>
            <div>Open palm: ${gestureState.isOpenPalm ? 'Yes' : 'No'}</div>
            <div>Closed fist: ${gestureState.isClosedFist ? 'Yes' : 'No'}</div>
        `;
        
        this.gestureOverlay.innerHTML = html;
    }

    /**
     * Add keyboard shortcuts
     */
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Toggle gesture mode with 'G' key
            if (event.code === 'KeyG' && !event.ctrlKey && !event.altKey && !event.metaKey) {
                event.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Show error message to user
     */
    showErrorMessage(errorType, message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #F44336;
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;
        
        errorDiv.innerHTML = `
            <h3>Gesture Control Error</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">OK</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Apply settings to components
        if (this.gestureRecognizer) {
            this.gestureRecognizer.updateThresholds({
                pinchDistance: 0.05 * this.settings.sensitivity,
                twoFingerPinchDistance: 0.06 * this.settings.sensitivity
            });
            
            this.gestureRecognizer.setSmoothingBufferSize(Math.round(5 * this.settings.smoothing));
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return { ...this.performanceStats };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.disable();
        
        if (this.handTracker) {
            this.handTracker.destroy();
        }
        
        if (this.statusIndicator) {
            this.statusIndicator.remove();
        }
        
        if (this.gestureOverlay) {
            this.gestureOverlay.remove();
        }
    }
}

// Create global instance
window.gestureController = new GestureController();
