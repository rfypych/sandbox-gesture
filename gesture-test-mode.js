/**
 * Gesture Test Mode
 * Simple testing interface for gesture recognition debugging
 */

class GestureTestMode {
    constructor() {
        this.isTestMode = false;
        this.testPanel = null;
        this.currentLandmarks = null;
        this.gestureHistory = [];
        
        this.createTestPanel();
        this.setupTestControls();
    }

    /**
     * Create test panel
     */
    createTestPanel() {
        this.testPanel = document.createElement('div');
        this.testPanel.id = 'gesture-test-panel';
        this.testPanel.className = 'test-panel';
        this.testPanel.innerHTML = `
            <div class="test-header">
                <h4>🧪 Gesture Test Mode</h4>
                <button id="toggle-test-mode" class="test-btn">Enable Test</button>
                <button id="close-test-panel" class="test-btn">×</button>
            </div>
            <div class="test-content">
                <div class="finger-status">
                    <h5>Finger Status:</h5>
                    <div class="finger-grid">
                        <div class="finger-item">
                            <span>👍 Thumb:</span>
                            <span id="thumb-status" class="status-indicator">❌</span>
                        </div>
                        <div class="finger-item">
                            <span>👆 Index:</span>
                            <span id="index-status" class="status-indicator">❌</span>
                        </div>
                        <div class="finger-item">
                            <span>🖕 Middle:</span>
                            <span id="middle-status" class="status-indicator">❌</span>
                        </div>
                        <div class="finger-item">
                            <span>💍 Ring:</span>
                            <span id="ring-status" class="status-indicator">❌</span>
                        </div>
                        <div class="finger-item">
                            <span>🤙 Pinky:</span>
                            <span id="pinky-status" class="status-indicator">❌</span>
                        </div>
                    </div>
                </div>
                
                <div class="gesture-detection">
                    <h5>Gesture Detection:</h5>
                    <div class="detection-item">
                        <span>Raw Gesture:</span>
                        <span id="raw-gesture" class="gesture-value">None</span>
                    </div>
                    <div class="detection-item">
                        <span>Final Gesture:</span>
                        <span id="final-gesture" class="gesture-value">None</span>
                    </div>
                    <div class="detection-item">
                        <span>Confidence:</span>
                        <span id="gesture-confidence-test" class="confidence-value">0%</span>
                    </div>
                </div>
                
                <div class="test-gestures">
                    <h5>Test Gestures:</h5>
                    <div class="gesture-buttons">
                        <button class="gesture-test-btn" data-gesture="point">👆 Point</button>
                        <button class="gesture-test-btn" data-gesture="peace">✌️ Peace</button>
                        <button class="gesture-test-btn" data-gesture="thumbs_up">👍 Thumbs Up</button>
                        <button class="gesture-test-btn" data-gesture="open_palm">✋ Open Palm</button>
                        <button class="gesture-test-btn" data-gesture="fist">✊ Fist</button>
                        <button class="gesture-test-btn" data-gesture="pinch">🤏 Pinch</button>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button id="force-detect" class="test-action-btn">Force Detection</button>
                    <button id="reset-gesture" class="test-action-btn">Reset</button>
                    <button id="test-all-gestures" class="test-action-btn">Test All</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .test-panel {
                position: fixed;
                top: 50%;
                left: 20px;
                transform: translateY(-50%);
                width: 280px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #4CAF50;
                border-radius: 8px;
                color: white;
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                z-index: 25000;
                display: none;
                overflow-y: auto;
            }
            .test-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: #4CAF50;
                color: black;
            }
            .test-header h4 {
                margin: 0;
                font-size: 10px;
            }
            .test-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: black;
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 7px;
                margin-left: 4px;
            }
            .test-content {
                padding: 12px;
            }
            .finger-status, .gesture-detection, .test-gestures, .test-actions {
                margin-bottom: 15px;
            }
            .finger-status h5, .gesture-detection h5, .test-gestures h5 {
                margin: 0 0 8px 0;
                color: #4CAF50;
                font-size: 9px;
            }
            .finger-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
            }
            .finger-item, .detection-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            .status-indicator {
                font-size: 12px;
            }
            .status-indicator.active {
                color: #4CAF50;
            }
            .gesture-value, .confidence-value {
                color: #ffeb3b;
                font-weight: bold;
            }
            .gesture-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px;
                margin-bottom: 10px;
            }
            .gesture-test-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 6px 4px;
                border-radius: 3px;
                cursor: pointer;
                font-family: inherit;
                font-size: 7px;
            }
            .gesture-test-btn:hover {
                background: #1976D2;
            }
            .gesture-test-btn.active {
                background: #4CAF50;
            }
            .test-actions {
                display: flex;
                gap: 4px;
            }
            .test-action-btn {
                flex: 1;
                background: #ff9800;
                color: black;
                border: none;
                padding: 8px 4px;
                border-radius: 3px;
                cursor: pointer;
                font-family: inherit;
                font-size: 7px;
            }
            .test-action-btn:hover {
                background: #f57c00;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.testPanel);
    }

    /**
     * Setup test controls
     */
    setupTestControls() {
        document.getElementById('toggle-test-mode').onclick = () => this.toggleTestMode();
        document.getElementById('close-test-panel').onclick = () => this.hideTestPanel();
        document.getElementById('force-detect').onclick = () => this.forceDetection();
        document.getElementById('reset-gesture').onclick = () => this.resetGesture();
        document.getElementById('test-all-gestures').onclick = () => this.testAllGestures();

        // Gesture test buttons
        document.querySelectorAll('.gesture-test-btn').forEach(btn => {
            btn.onclick = () => this.testSpecificGesture(btn.dataset.gesture);
        });

        // Keyboard shortcut: Ctrl+Shift+T
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTestPanel();
            }
        });
    }

    /**
     * Enable test mode
     */
    enableTestMode() {
        this.isTestMode = true;
        document.getElementById('toggle-test-mode').textContent = 'Disable Test';
        
        // Hook into gesture controller
        if (window.gestureController) {
            this.hookGestureController();
        }
        
        console.log('Gesture test mode enabled');
        this.startTestLoop();
    }

    /**
     * Disable test mode
     */
    disableTestMode() {
        this.isTestMode = false;
        document.getElementById('toggle-test-mode').textContent = 'Enable Test';
        console.log('Gesture test mode disabled');
    }

    /**
     * Toggle test mode
     */
    toggleTestMode() {
        if (this.isTestMode) {
            this.disableTestMode();
        } else {
            this.enableTestMode();
        }
    }

    /**
     * Show test panel
     */
    showTestPanel() {
        this.testPanel.style.display = 'block';
    }

    /**
     * Hide test panel
     */
    hideTestPanel() {
        this.testPanel.style.display = 'none';
    }

    /**
     * Toggle test panel
     */
    toggleTestPanel() {
        if (this.testPanel.style.display === 'none') {
            this.showTestPanel();
            if (!this.isTestMode) {
                this.enableTestMode();
            }
        } else {
            this.hideTestPanel();
        }
    }

    /**
     * Hook into gesture controller
     */
    hookGestureController() {
        if (!window.gestureController) return;

        const originalOnResults = window.gestureController.onResults.bind(window.gestureController);
        window.gestureController.onResults = (results) => {
            // Store current landmarks
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                this.currentLandmarks = results.multiHandLandmarks[0];
                this.updateFingerStatus();
                this.updateGestureDetection();
            } else {
                this.currentLandmarks = null;
                this.clearStatus();
            }
            
            // Call original function
            originalOnResults(results);
        };
    }

    /**
     * Update finger status display
     */
    updateFingerStatus() {
        if (!this.currentLandmarks || !window.gestureController) return;

        const fingers = window.gestureController.getFingerStates(this.currentLandmarks);
        
        document.getElementById('thumb-status').textContent = fingers.thumb ? '✅' : '❌';
        document.getElementById('index-status').textContent = fingers.index ? '✅' : '❌';
        document.getElementById('middle-status').textContent = fingers.middle ? '✅' : '❌';
        document.getElementById('ring-status').textContent = fingers.ring ? '✅' : '❌';
        document.getElementById('pinky-status').textContent = fingers.pinky ? '✅' : '❌';

        // Update active status
        document.getElementById('thumb-status').className = fingers.thumb ? 'status-indicator active' : 'status-indicator';
        document.getElementById('index-status').className = fingers.index ? 'status-indicator active' : 'status-indicator';
        document.getElementById('middle-status').className = fingers.middle ? 'status-indicator active' : 'status-indicator';
        document.getElementById('ring-status').className = fingers.ring ? 'status-indicator active' : 'status-indicator';
        document.getElementById('pinky-status').className = fingers.pinky ? 'status-indicator active' : 'status-indicator';
    }

    /**
     * Update gesture detection display
     */
    updateGestureDetection() {
        if (!this.currentLandmarks || !window.gestureController) return;

        const rawGesture = window.gestureController.classifyHandGesture(this.currentLandmarks);
        const gestureResult = window.gestureController.recognizeGesture(this.currentLandmarks, { label: 'Right' });
        
        document.getElementById('raw-gesture').textContent = rawGesture;
        document.getElementById('final-gesture').textContent = gestureResult.type;
        document.getElementById('gesture-confidence-test').textContent = Math.round(gestureResult.confidence * 100) + '%';
        
        // Store in history
        this.gestureHistory.push({
            raw: rawGesture,
            final: gestureResult.type,
            confidence: gestureResult.confidence,
            timestamp: Date.now()
        });
        
        // Keep only recent history
        if (this.gestureHistory.length > 10) {
            this.gestureHistory.shift();
        }
    }

    /**
     * Clear status display
     */
    clearStatus() {
        ['thumb', 'index', 'middle', 'ring', 'pinky'].forEach(finger => {
            document.getElementById(`${finger}-status`).textContent = '❌';
            document.getElementById(`${finger}-status`).className = 'status-indicator';
        });
        
        document.getElementById('raw-gesture').textContent = 'None';
        document.getElementById('final-gesture').textContent = 'None';
        document.getElementById('gesture-confidence-test').textContent = '0%';
    }

    /**
     * Force detection
     */
    forceDetection() {
        if (!this.currentLandmarks || !window.gestureController) {
            alert('No hand landmarks available. Make sure gesture control is active and hands are visible.');
            return;
        }

        console.log('Forcing gesture detection...');
        console.log('Current landmarks:', this.currentLandmarks);
        
        const fingers = window.gestureController.getFingerStates(this.currentLandmarks);
        console.log('Finger states:', fingers);
        
        const rawGesture = window.gestureController.classifyHandGesture(this.currentLandmarks);
        console.log('Raw gesture:', rawGesture);
        
        alert(`Force detection result:\nFingers: ${JSON.stringify(fingers)}\nGesture: ${rawGesture}`);
    }

    /**
     * Reset gesture
     */
    resetGesture() {
        if (window.gestureController) {
            window.gestureController.gestureHistory = [];
            console.log('Gesture history reset');
        }
        this.gestureHistory = [];
        this.clearStatus();
    }

    /**
     * Test specific gesture
     */
    testSpecificGesture(gestureType) {
        // Highlight selected button
        document.querySelectorAll('.gesture-test-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-gesture="${gestureType}"]`).classList.add('active');
        
        console.log(`Testing gesture: ${gestureType}`);
        alert(`Now perform the ${gestureType} gesture and watch the detection results.`);
    }

    /**
     * Test all gestures
     */
    testAllGestures() {
        const gestures = ['point', 'peace', 'thumbs_up', 'open_palm', 'fist', 'pinch'];
        let currentIndex = 0;
        
        const testNext = () => {
            if (currentIndex >= gestures.length) {
                alert('All gestures tested!');
                return;
            }
            
            const gesture = gestures[currentIndex];
            this.testSpecificGesture(gesture);
            
            setTimeout(() => {
                currentIndex++;
                testNext();
            }, 3000);
        };
        
        testNext();
    }

    /**
     * Start test loop
     */
    startTestLoop() {
        if (!this.isTestMode) return;
        
        // Update display every 100ms
        setTimeout(() => this.startTestLoop(), 100);
    }
}

// Initialize test mode
window.gestureTestMode = new GestureTestMode();

// Add test button to main UI
window.addEventListener('load', () => {
    setTimeout(() => {
        const controlsContainer = document.querySelector('.controlButtons') || 
                                document.querySelector('#controls') ||
                                document.querySelector('.controls');
        
        if (controlsContainer) {
            const testBtn = document.createElement('button');
            testBtn.id = 'test-gesture-btn';
            testBtn.className = 'controlButton';
            testBtn.title = 'Gesture Test Mode (Ctrl+Shift+T)';
            testBtn.innerHTML = '🧪';
            testBtn.style.cssText = 'background: #4CAF50; color: white; border: 2px solid #45a049;';
            testBtn.onclick = () => {
                window.gestureTestMode.toggleTestPanel();
            };
            
            // Insert after debug button
            const debugBtn = document.getElementById('debug-gesture-btn');
            if (debugBtn) {
                debugBtn.parentNode.insertBefore(testBtn, debugBtn.nextSibling);
            } else {
                controlsContainer.appendChild(testBtn);
            }
        }
    }, 3000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureTestMode;
}
