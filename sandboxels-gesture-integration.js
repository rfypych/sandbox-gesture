/**
 * Sandboxels Gesture Control Integration
 * Bridges gesture recognition with Sandboxels game functions
 */

class SandboxelsGestureIntegration {
    constructor(gestureController) {
        this.gestureController = gestureController;
        this.gameCanvas = null;
        this.isIntegrated = false;
        this.gestureToActionMap = new Map();
        this.actionCooldowns = new Map();
        this.lastGestureTime = 0;
        this.gestureHoldTime = 500; // ms to hold gesture before triggering
        this.currentHoldGesture = null;
        this.holdStartTime = 0;
        
        // Sandboxels game state references
        this.gameState = {
            mouseX: 0,
            mouseY: 0,
            mouseSize: 5,
            currentElement: 'sand',
            paused: false,
            isDrawing: false,
            lastDrawTime: 0
        };
        
        this.initializeGestureMapping();
        this.setupGameStateMonitoring();
    }

    /**
     * Initialize gesture to game action mapping
     */
    initializeGestureMapping() {
        // Drawing and erasing
        this.gestureToActionMap.set('point', {
            action: 'startDrawing',
            cooldown: 50,
            holdRequired: false,
            description: 'Start drawing with current element'
        });

        this.gestureToActionMap.set('peace', {
            action: 'startErasing',
            cooldown: 50,
            holdRequired: false,
            description: 'Start erasing pixels'
        });

        this.gestureToActionMap.set('pinch', {
            action: 'selectElement',
            cooldown: 300,
            holdRequired: true,
            description: 'Select element from canvas'
        });

        // Game controls
        this.gestureToActionMap.set('open_palm', {
            action: 'togglePause',
            cooldown: 1000,
            holdRequired: true,
            description: 'Pause/unpause simulation'
        });

        this.gestureToActionMap.set('fist', {
            action: 'resetCanvas',
            cooldown: 2000,
            holdRequired: true,
            description: 'Clear entire canvas'
        });

        // Brush size controls
        this.gestureToActionMap.set('thumbs_up', {
            action: 'increaseBrushSize',
            cooldown: 200,
            holdRequired: false,
            description: 'Increase brush size'
        });

        this.gestureToActionMap.set('thumbs_down', {
            action: 'decreaseBrushSize',
            cooldown: 200,
            holdRequired: false,
            description: 'Decrease brush size'
        });

        // Navigation gestures
        this.gestureToActionMap.set('swipe_left', {
            action: 'previousCategory',
            cooldown: 500,
            holdRequired: false,
            description: 'Switch to previous element category'
        });

        this.gestureToActionMap.set('swipe_right', {
            action: 'nextCategory',
            cooldown: 500,
            holdRequired: false,
            description: 'Switch to next element category'
        });

        // Two-hand gestures
        this.gestureToActionMap.set('zoom_in', {
            action: 'zoomIn',
            cooldown: 100,
            holdRequired: false,
            description: 'Zoom in on canvas'
        });

        this.gestureToActionMap.set('zoom_out', {
            action: 'zoomOut',
            cooldown: 100,
            holdRequired: false,
            description: 'Zoom out from canvas'
        });
    }

    /**
     * Setup monitoring of Sandboxels game state
     */
    setupGameStateMonitoring() {
        // Monitor global variables if they exist
        const checkGameState = () => {
            if (typeof window !== 'undefined') {
                // Update game state references
                if (typeof mouseX !== 'undefined') this.gameState.mouseX = mouseX;
                if (typeof mouseY !== 'undefined') this.gameState.mouseY = mouseY;
                if (typeof mouseSize !== 'undefined') this.gameState.mouseSize = mouseSize;
                if (typeof currentElement !== 'undefined') this.gameState.currentElement = currentElement;
                if (typeof paused !== 'undefined') this.gameState.paused = paused;
                
                // Find game canvas
                if (!this.gameCanvas) {
                    this.gameCanvas = document.getElementById('game') || 
                                    document.querySelector('canvas') ||
                                    document.querySelector('#gameCanvas');
                }
            }
        };

        // Check game state periodically
        setInterval(checkGameState, 100);
        
        // Initial check
        setTimeout(checkGameState, 1000);
    }

    /**
     * Integrate with gesture controller
     */
    integrate() {
        if (!this.gestureController) {
            console.error('Gesture controller not available');
            return false;
        }

        // Override gesture callbacks
        const originalCallbacks = this.gestureController.gestureCallbacks;
        
        // Replace with integrated callbacks
        this.gestureController.gestureCallbacks = {};
        
        for (const [gesture, mapping] of this.gestureToActionMap) {
            this.gestureController.gestureCallbacks[gesture] = (gestureData) => {
                this.handleGestureAction(gesture, gestureData, mapping);
            };
        }

        // Add gesture event listeners
        this.gestureController.processGesture = (gesture, landmarks) => {
            // Call original processing
            if (gesture.confidence < 0.6) return;

            // Update current gesture
            this.gestureController.currentGesture = gesture;
            
            // Handle gesture with integration
            this.processIntegratedGesture(gesture);
            
            // Update mouse position for drawing
            this.updateGameMousePosition(gesture.position);
        };

        this.isIntegrated = true;
        console.log('Sandboxels gesture integration activated');
        return true;
    }

    /**
     * Process gesture with game integration
     */
    processIntegratedGesture(gesture) {
        const mapping = this.gestureToActionMap.get(gesture.type);
        if (!mapping) return;

        const now = Date.now();
        
        // Check cooldown
        const lastActionTime = this.actionCooldowns.get(gesture.type) || 0;
        if (now - lastActionTime < mapping.cooldown) {
            return;
        }

        // Handle hold gestures
        if (mapping.holdRequired) {
            if (this.currentHoldGesture === gesture.type) {
                // Continue holding
                if (now - this.holdStartTime >= this.gestureHoldTime) {
                    // Execute action
                    this.executeGameAction(mapping.action, gesture);
                    this.actionCooldowns.set(gesture.type, now);
                    this.currentHoldGesture = null;
                }
            } else {
                // Start holding
                this.currentHoldGesture = gesture.type;
                this.holdStartTime = now;
            }
        } else {
            // Execute immediate action
            this.executeGameAction(mapping.action, gesture);
            this.actionCooldowns.set(gesture.type, now);
        }
    }

    /**
     * Execute game action based on gesture
     */
    executeGameAction(action, gestureData) {
        console.log(`Executing action: ${action}`);

        switch (action) {
            case 'startDrawing':
                this.startDrawing(gestureData);
                break;
            case 'startErasing':
                this.startErasing(gestureData);
                break;
            case 'selectElement':
                this.selectElement(gestureData);
                break;
            case 'togglePause':
                this.togglePause();
                break;
            case 'resetCanvas':
                this.resetCanvas();
                break;
            case 'increaseBrushSize':
                this.increaseBrushSize();
                break;
            case 'decreaseBrushSize':
                this.decreaseBrushSize();
                break;
            case 'previousCategory':
                this.switchCategory(-1);
                break;
            case 'nextCategory':
                this.switchCategory(1);
                break;
            case 'zoomIn':
                this.zoomCanvas(1.1);
                break;
            case 'zoomOut':
                this.zoomCanvas(0.9);
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    /**
     * Start drawing action
     */
    startDrawing(gestureData) {
        if (!this.gameCanvas) return;

        const canvasRect = this.gameCanvas.getBoundingClientRect();
        const x = gestureData.position.x - canvasRect.left;
        const y = gestureData.position.y - canvasRect.top;

        // Simulate mouse down event for drawing
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: gestureData.position.x,
            clientY: gestureData.position.y,
            button: 0,
            buttons: 1,
            bubbles: true,
            cancelable: true
        });

        this.gameCanvas.dispatchEvent(mouseEvent);
        this.gameState.isDrawing = true;
        this.gameState.lastDrawTime = Date.now();

        // Call Sandboxels mouse1Action if available
        if (typeof mouse1Action === 'function') {
            mouse1Action(mouseEvent, Math.floor(x), Math.floor(y));
        }
    }

    /**
     * Start erasing action
     */
    startErasing(gestureData) {
        if (!this.gameCanvas) return;

        const canvasRect = this.gameCanvas.getBoundingClientRect();
        const x = gestureData.position.x - canvasRect.left;
        const y = gestureData.position.y - canvasRect.top;

        // Simulate right mouse button for erasing
        const mouseEvent = new MouseEvent('contextmenu', {
            clientX: gestureData.position.x,
            clientY: gestureData.position.y,
            button: 2,
            buttons: 2,
            bubbles: true,
            cancelable: true
        });

        this.gameCanvas.dispatchEvent(mouseEvent);

        // Call Sandboxels mouse2Action if available
        if (typeof mouse2Action === 'function') {
            mouse2Action(mouseEvent, Math.floor(x), Math.floor(y));
        }
    }

    /**
     * Select element from canvas
     */
    selectElement(gestureData) {
        if (!this.gameCanvas) return;

        const canvasRect = this.gameCanvas.getBoundingClientRect();
        const x = gestureData.position.x - canvasRect.left;
        const y = gestureData.position.y - canvasRect.top;

        // Simulate middle mouse button for element selection
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: gestureData.position.x,
            clientY: gestureData.position.y,
            button: 1,
            buttons: 4,
            bubbles: true,
            cancelable: true
        });

        this.gameCanvas.dispatchEvent(mouseEvent);

        // Call Sandboxels mouseMiddleAction if available
        if (typeof mouseMiddleAction === 'function') {
            mouseMiddleAction(mouseEvent, Math.floor(x), Math.floor(y));
        }
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (typeof togglePause === 'function') {
            togglePause();
            console.log('Toggled pause via gesture');
        } else {
            // Fallback: simulate spacebar press
            const spaceEvent = new KeyboardEvent('keydown', {
                key: ' ',
                code: 'Space',
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(spaceEvent);
        }
    }

    /**
     * Reset canvas
     */
    resetCanvas() {
        if (typeof resetPrompt === 'function') {
            // Call with confirmed=true to skip confirmation dialog
            resetPrompt(true);
            console.log('Reset canvas via gesture');
        }
    }

    /**
     * Increase brush size
     */
    increaseBrushSize() {
        if (typeof mouseSize !== 'undefined' && typeof checkMouseSize === 'function') {
            const oldSize = mouseSize;
            mouseSize += 2;
            checkMouseSize(true);
            console.log(`Increased brush size from ${oldSize} to ${mouseSize}`);
        }
    }

    /**
     * Decrease brush size
     */
    decreaseBrushSize() {
        if (typeof mouseSize !== 'undefined' && typeof checkMouseSize === 'function') {
            const oldSize = mouseSize;
            mouseSize = Math.max(1, mouseSize - 2);
            checkMouseSize(true);
            console.log(`Decreased brush size from ${oldSize} to ${mouseSize}`);
        }
    }

    /**
     * Switch element category
     */
    switchCategory(direction) {
        // Try to find category switching functions
        if (typeof switchCategory === 'function') {
            // If Sandboxels has a switchCategory function
            const categories = ['solids', 'liquids', 'gases', 'powders', 'special', 'life', 'tools'];
            const currentCat = typeof currentCategory !== 'undefined' ? currentCategory : 'solids';
            const currentIndex = categories.indexOf(currentCat);
            const newIndex = (currentIndex + direction + categories.length) % categories.length;
            switchCategory(categories[newIndex]);
        } else {
            // Fallback: simulate arrow key presses
            const key = direction > 0 ? 'ArrowRight' : 'ArrowLeft';
            const keyEvent = new KeyboardEvent('keydown', {
                key: key,
                code: direction > 0 ? 'ArrowRight' : 'ArrowLeft',
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(keyEvent);
        }
    }

    /**
     * Zoom canvas
     */
    zoomCanvas(factor) {
        // Try to find zoom functions or simulate zoom
        if (typeof pixelSize !== 'undefined') {
            const newSize = Math.max(1, Math.min(10, pixelSize * factor));
            if (typeof setPixelSize === 'function') {
                setPixelSize(newSize);
            }
        } else {
            // Fallback: simulate Ctrl + scroll
            const wheelEvent = new WheelEvent('wheel', {
                deltaY: factor > 1 ? -100 : 100,
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            });
            
            if (this.gameCanvas) {
                this.gameCanvas.dispatchEvent(wheelEvent);
            }
        }
    }

    /**
     * Update game mouse position
     */
    updateGameMousePosition(position) {
        if (!this.gameCanvas) return;

        const canvasRect = this.gameCanvas.getBoundingClientRect();
        const x = Math.floor(position.x - canvasRect.left);
        const y = Math.floor(position.y - canvasRect.top);

        // Update global mouse coordinates if they exist
        if (typeof mouseX !== 'undefined') {
            mouseX = x;
        }
        if (typeof mouseY !== 'undefined') {
            mouseY = y;
        }

        // Update mouse position object if it exists
        if (typeof mousePos !== 'undefined') {
            mousePos.x = x;
            mousePos.y = y;
        }

        // Store in game state
        this.gameState.mouseX = x;
        this.gameState.mouseY = y;
    }

    /**
     * Get current gesture mapping
     */
    getGestureMapping() {
        const mapping = {};
        for (const [gesture, config] of this.gestureToActionMap) {
            mapping[gesture] = {
                action: config.action,
                description: config.description,
                cooldown: config.cooldown,
                holdRequired: config.holdRequired
            };
        }
        return mapping;
    }

    /**
     * Add custom gesture mapping
     */
    addGestureMapping(gesture, action, config = {}) {
        this.gestureToActionMap.set(gesture, {
            action: action,
            cooldown: config.cooldown || 300,
            holdRequired: config.holdRequired || false,
            description: config.description || `Custom action: ${action}`
        });

        // Update gesture controller callback
        if (this.gestureController && this.gestureController.gestureCallbacks) {
            this.gestureController.gestureCallbacks[gesture] = (gestureData) => {
                this.handleGestureAction(gesture, gestureData, this.gestureToActionMap.get(gesture));
            };
        }

        console.log(`Added custom gesture mapping: ${gesture} -> ${action}`);
    }

    /**
     * Remove gesture mapping
     */
    removeGestureMapping(gesture) {
        if (this.gestureToActionMap.has(gesture)) {
            this.gestureToActionMap.delete(gesture);
            
            // Remove from gesture controller
            if (this.gestureController && this.gestureController.gestureCallbacks) {
                delete this.gestureController.gestureCallbacks[gesture];
            }
            
            console.log(`Removed gesture mapping: ${gesture}`);
            return true;
        }
        return false;
    }

    /**
     * Get integration status
     */
    getStatus() {
        return {
            isIntegrated: this.isIntegrated,
            gameCanvasFound: !!this.gameCanvas,
            gestureCount: this.gestureToActionMap.size,
            gameState: this.gameState,
            currentHoldGesture: this.currentHoldGesture,
            holdProgress: this.currentHoldGesture ? 
                Math.min(1, (Date.now() - this.holdStartTime) / this.gestureHoldTime) : 0
        };
    }

    /**
     * Enable/disable specific gestures
     */
    setGestureEnabled(gesture, enabled) {
        if (this.gestureController && this.gestureController.gestureCallbacks) {
            if (enabled && this.gestureToActionMap.has(gesture)) {
                const mapping = this.gestureToActionMap.get(gesture);
                this.gestureController.gestureCallbacks[gesture] = (gestureData) => {
                    this.handleGestureAction(gesture, gestureData, mapping);
                };
            } else {
                delete this.gestureController.gestureCallbacks[gesture];
            }
        }
    }

    /**
     * Handle gesture action with error handling
     */
    handleGestureAction(gesture, gestureData, mapping) {
        try {
            this.processIntegratedGesture({
                type: gesture,
                confidence: gestureData.confidence,
                position: gestureData.position
            });
        } catch (error) {
            console.error(`Error handling gesture ${gesture}:`, error);
        }
    }
}

// Initialize integration when both systems are ready
window.addEventListener('load', () => {
    // Wait for both gesture controller and Sandboxels to be ready
    const initializeIntegration = () => {
        if (window.gestureController && (typeof mouseSize !== 'undefined' || document.querySelector('canvas'))) {
            window.sandboxelsGestureIntegration = new SandboxelsGestureIntegration(window.gestureController);
            
            // Auto-integrate if gesture control is enabled
            if (window.gestureController.isEnabled) {
                window.sandboxelsGestureIntegration.integrate();
            }
            
            // Listen for gesture control events
            window.addEventListener('gestureControlStarted', () => {
                if (window.sandboxelsGestureIntegration && !window.sandboxelsGestureIntegration.isIntegrated) {
                    window.sandboxelsGestureIntegration.integrate();
                }
            });
            
            console.log('Sandboxels gesture integration ready');
        } else {
            // Retry after a short delay
            setTimeout(initializeIntegration, 1000);
        }
    };
    
    setTimeout(initializeIntegration, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SandboxelsGestureIntegration;
}
