/**
 * Gesture Control UI Components
 * Provides user interface for gesture control system
 */

class GestureUI {
    constructor(gestureController) {
        this.gestureController = gestureController;
        this.isUIVisible = false;
        this.tutorialStep = 0;
        this.gestureGuide = {
            'point': '👆 Point with index finger to draw',
            'peace': '✌️ Peace sign (V) to erase',
            'pinch': '🤏 Pinch to select element',
            'open_palm': '✋ Open palm to pause/play',
            'fist': '✊ Fist to reset canvas',
            'thumbs_up': '👍 Thumbs up to increase brush size',
            'thumbs_down': '👎 Thumbs down to decrease brush size'
        };
        
        this.createUI();
        this.bindEvents();
    }

    /**
     * Create gesture control UI
     */
    createUI() {
        // Main gesture control panel
        this.panel = document.createElement('div');
        this.panel.id = 'gesture-control-panel';
        this.panel.className = 'gesture-panel';
        this.panel.innerHTML = `
            <div class="gesture-header">
                <h3>🎮 Gesture Control</h3>
                <button id="gesture-close-btn" class="gesture-btn-close">×</button>
            </div>
            
            <div class="gesture-content">
                <!-- Status Section -->
                <div class="gesture-status">
                    <div class="status-item">
                        <span class="status-label">Status:</span>
                        <span id="gesture-status" class="status-value">Disabled</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Camera:</span>
                        <span id="camera-status" class="status-value">Not Connected</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">FPS:</span>
                        <span id="gesture-fps" class="status-value">0</span>
                    </div>
                </div>

                <!-- Control Buttons -->
                <div class="gesture-controls">
                    <button id="gesture-toggle-btn" class="gesture-btn primary">
                        <span id="gesture-toggle-text">Start Gesture Control</span>
                    </button>
                    <button id="gesture-calibrate-btn" class="gesture-btn secondary">
                        Calibrate
                    </button>
                    <button id="gesture-tutorial-btn" class="gesture-btn secondary">
                        Tutorial
                    </button>
                </div>

                <!-- Settings -->
                <div class="gesture-settings">
                    <h4>Settings</h4>
                    <div class="setting-item">
                        <label for="gesture-sensitivity">Sensitivity:</label>
                        <input type="range" id="gesture-sensitivity" min="0.3" max="0.9" step="0.1" value="0.6">
                        <span id="sensitivity-value">0.6</span>
                    </div>
                    <div class="setting-item">
                        <label for="gesture-smoothing">Smoothing:</label>
                        <input type="range" id="gesture-smoothing" min="3" max="10" step="1" value="5">
                        <span id="smoothing-value">5</span>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="gesture-overlay" checked>
                            Show Hand Overlay
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="gesture-sound">
                            Sound Feedback
                        </label>
                    </div>
                </div>

                <!-- Current Gesture Display -->
                <div class="current-gesture">
                    <h4>Current Gesture</h4>
                    <div id="gesture-display" class="gesture-display-area">
                        <span id="current-gesture-text">None</span>
                        <div id="gesture-confidence" class="confidence-bar">
                            <div id="confidence-fill" class="confidence-fill"></div>
                        </div>
                    </div>
                </div>

                <!-- Gesture Guide -->
                <div class="gesture-guide">
                    <h4>Gesture Guide</h4>
                    <div id="gesture-list" class="gesture-list"></div>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(this.panel);

        // Create gesture button in main UI
        this.createGestureButton();

        // Create tutorial modal
        this.createTutorialModal();

        // Populate gesture guide
        this.populateGestureGuide();

        // Apply styles
        this.applyStyles();
    }

    /**
     * Create gesture control button in main game UI
     */
    createGestureButton() {
        // Find the control buttons container
        const controlsContainer = document.querySelector('.controlButtons') || 
                                document.querySelector('#controls') ||
                                document.querySelector('.controls');

        if (controlsContainer) {
            const gestureBtn = document.createElement('button');
            gestureBtn.id = 'main-gesture-btn';
            gestureBtn.className = 'controlButton';
            gestureBtn.title = 'Gesture Control';
            gestureBtn.innerHTML = '🎮';
            gestureBtn.onclick = () => this.togglePanel();
            
            // Insert after settings button or at the end
            const settingsBtn = document.getElementById('settingsButton');
            if (settingsBtn) {
                settingsBtn.parentNode.insertBefore(gestureBtn, settingsBtn.nextSibling);
            } else {
                controlsContainer.appendChild(gestureBtn);
            }
        }
    }

    /**
     * Create tutorial modal
     */
    createTutorialModal() {
        this.tutorialModal = document.createElement('div');
        this.tutorialModal.id = 'gesture-tutorial-modal';
        this.tutorialModal.className = 'gesture-modal';
        this.tutorialModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Gesture Control Tutorial</h3>
                    <button id="tutorial-close-btn" class="gesture-btn-close">×</button>
                </div>
                <div class="modal-body">
                    <div id="tutorial-content" class="tutorial-content">
                        <!-- Tutorial steps will be populated here -->
                    </div>
                    <div class="tutorial-navigation">
                        <button id="tutorial-prev-btn" class="gesture-btn secondary">Previous</button>
                        <span id="tutorial-progress">1 / 7</span>
                        <button id="tutorial-next-btn" class="gesture-btn primary">Next</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.tutorialModal);
    }

    /**
     * Populate gesture guide list
     */
    populateGestureGuide() {
        const guideContainer = document.getElementById('gesture-list');
        guideContainer.innerHTML = '';

        for (const [gesture, description] of Object.entries(this.gestureGuide)) {
            const item = document.createElement('div');
            item.className = 'gesture-guide-item';
            item.innerHTML = `
                <span class="gesture-icon">${description.split(' ')[0]}</span>
                <span class="gesture-desc">${description.substring(description.indexOf(' ') + 1)}</span>
            `;
            guideContainer.appendChild(item);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Panel controls
        document.getElementById('gesture-close-btn').onclick = () => this.hidePanel();
        document.getElementById('gesture-toggle-btn').onclick = () => this.toggleGestureControl();
        document.getElementById('gesture-calibrate-btn').onclick = () => this.calibrate();
        document.getElementById('gesture-tutorial-btn').onclick = () => this.showTutorial();

        // Settings
        document.getElementById('gesture-sensitivity').oninput = (e) => this.updateSensitivity(e.target.value);
        document.getElementById('gesture-smoothing').oninput = (e) => this.updateSmoothing(e.target.value);
        document.getElementById('gesture-overlay').onchange = (e) => this.toggleOverlay(e.target.checked);
        document.getElementById('gesture-sound').onchange = (e) => this.toggleSound(e.target.checked);

        // Tutorial controls
        document.getElementById('tutorial-close-btn').onclick = () => this.hideTutorial();
        document.getElementById('tutorial-prev-btn').onclick = () => this.previousTutorialStep();
        document.getElementById('tutorial-next-btn').onclick = () => this.nextTutorialStep();

        // Gesture controller events
        window.addEventListener('gestureControlStarted', () => this.onGestureStarted());
        window.addEventListener('gestureControlStopped', () => this.onGestureStopped());

        // Update status periodically
        setInterval(() => this.updateStatus(), 100);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                this.togglePanel();
            }
        });
    }

    /**
     * Apply CSS styles
     */
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .gesture-panel {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 320px;
                max-height: 80vh;
                background: var(--theme-darker, #191919);
                border: 2px solid var(--theme, #7f7f7f);
                border-radius: 8px;
                color: white;
                font-family: 'Press Start 2P', monospace;
                font-size: 10px;
                z-index: 10000;
                display: none;
                overflow-y: auto;
            }

            .gesture-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: var(--theme-dark, #3f3f3f);
                border-bottom: 1px solid var(--theme, #7f7f7f);
            }

            .gesture-header h3 {
                margin: 0;
                font-size: 12px;
            }

            .gesture-btn-close {
                background: #ff4444;
                border: none;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 12px;
                line-height: 1;
            }

            .gesture-content {
                padding: 15px;
            }

            .gesture-status {
                margin-bottom: 15px;
            }

            .status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }

            .status-label {
                color: var(--theme, #7f7f7f);
            }

            .status-value {
                color: #00ff00;
            }

            .gesture-controls {
                margin-bottom: 15px;
            }

            .gesture-btn {
                width: 100%;
                padding: 8px;
                margin-bottom: 5px;
                border: 1px solid var(--theme, #7f7f7f);
                background: var(--theme-dark, #3f3f3f);
                color: white;
                cursor: pointer;
                font-family: inherit;
                font-size: 9px;
                border-radius: 4px;
            }

            .gesture-btn.primary {
                background: #4CAF50;
            }

            .gesture-btn.secondary {
                background: #2196F3;
            }

            .gesture-btn:hover {
                opacity: 0.8;
            }

            .gesture-settings h4,
            .current-gesture h4,
            .gesture-guide h4 {
                margin: 0 0 10px 0;
                font-size: 10px;
                color: var(--theme, #7f7f7f);
            }

            .setting-item {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 8px;
            }

            .setting-item label {
                flex: 1;
                margin-right: 10px;
            }

            .setting-item input[type="range"] {
                flex: 2;
                margin-right: 5px;
            }

            .gesture-display-area {
                text-align: center;
                padding: 10px;
                background: var(--theme-darkest, #000);
                border-radius: 4px;
                margin-bottom: 15px;
            }

            .confidence-bar {
                width: 100%;
                height: 4px;
                background: var(--theme-dark, #3f3f3f);
                border-radius: 2px;
                margin-top: 5px;
                overflow: hidden;
            }

            .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff4444, #ffff44, #44ff44);
                width: 0%;
                transition: width 0.2s ease;
            }

            .gesture-guide-item {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                padding: 5px;
                background: var(--theme-darkest, #000);
                border-radius: 4px;
            }

            .gesture-icon {
                font-size: 16px;
                margin-right: 10px;
                width: 20px;
            }

            .gesture-desc {
                font-size: 8px;
                flex: 1;
            }

            .gesture-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                z-index: 20000;
                align-items: center;
                justify-content: center;
            }

            .modal-content {
                background: var(--theme-darker, #191919);
                border: 2px solid var(--theme, #7f7f7f);
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: var(--theme-dark, #3f3f3f);
                border-bottom: 1px solid var(--theme, #7f7f7f);
            }

            .modal-body {
                padding: 20px;
            }

            .tutorial-content {
                min-height: 200px;
                margin-bottom: 20px;
            }

            .tutorial-navigation {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .tutorial-step {
                text-align: center;
            }

            .tutorial-step h4 {
                color: #4CAF50;
                margin-bottom: 15px;
            }

            .tutorial-step .step-icon {
                font-size: 48px;
                margin: 20px 0;
            }

            .tutorial-step .step-description {
                font-size: 12px;
                line-height: 1.5;
                margin-bottom: 15px;
            }

            .tutorial-step .step-tip {
                font-size: 10px;
                color: var(--theme, #7f7f7f);
                font-style: italic;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .gesture-panel {
                    right: 10px;
                    width: 280px;
                }
                
                .modal-content {
                    width: 95%;
                    margin: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Toggle panel visibility
     */
    togglePanel() {
        if (this.isUIVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    /**
     * Show gesture control panel
     */
    showPanel() {
        this.panel.style.display = 'block';
        this.isUIVisible = true;
        this.updateStatus();
    }

    /**
     * Hide gesture control panel
     */
    hidePanel() {
        this.panel.style.display = 'none';
        this.isUIVisible = false;
    }

    /**
     * Toggle gesture control on/off
     */
    async toggleGestureControl() {
        const toggleBtn = document.getElementById('gesture-toggle-btn');
        const toggleText = document.getElementById('gesture-toggle-text');
        
        try {
            if (this.gestureController.isEnabled) {
                this.gestureController.stop();
            } else {
                toggleBtn.disabled = true;
                toggleText.textContent = 'Starting...';
                await this.gestureController.start();
            }
        } catch (error) {
            alert('Failed to start gesture control: ' + error.message);
        } finally {
            toggleBtn.disabled = false;
            this.updateStatus();
        }
    }

    /**
     * Update UI status
     */
    updateStatus() {
        if (!this.isUIVisible) return;

        const status = this.gestureController.getStatus();
        
        // Update status indicators
        document.getElementById('gesture-status').textContent = status.isEnabled ? 'Active' : 'Disabled';
        document.getElementById('camera-status').textContent = status.isInitialized ? 'Connected' : 'Not Connected';
        document.getElementById('gesture-fps').textContent = status.fps;

        // Update toggle button
        const toggleText = document.getElementById('gesture-toggle-text');
        toggleText.textContent = status.isEnabled ? 'Stop Gesture Control' : 'Start Gesture Control';

        // Update current gesture display
        if (status.currentGesture) {
            document.getElementById('current-gesture-text').textContent = 
                this.gestureGuide[status.currentGesture.type] || status.currentGesture.type;
            
            const confidenceFill = document.getElementById('confidence-fill');
            confidenceFill.style.width = (status.confidence * 100) + '%';
        } else {
            document.getElementById('current-gesture-text').textContent = 'None';
            document.getElementById('confidence-fill').style.width = '0%';
        }
    }

    /**
     * Event handlers
     */
    onGestureStarted() {
        this.updateStatus();
    }

    onGestureStopped() {
        this.updateStatus();
    }

    updateSensitivity(value) {
        document.getElementById('sensitivity-value').textContent = value;
        // Update gesture controller sensitivity
        if (this.gestureController.hands) {
            this.gestureController.hands.setOptions({
                minDetectionConfidence: parseFloat(value),
                minTrackingConfidence: parseFloat(value)
            });
        }
    }

    updateSmoothing(value) {
        document.getElementById('smoothing-value').textContent = value;
        this.gestureController.smoothingFrames = parseInt(value);
    }

    toggleOverlay(enabled) {
        this.gestureController.showGestureOverlay(enabled);
    }

    toggleSound(enabled) {
        // Implement sound feedback
        console.log('Sound feedback:', enabled);
    }

    calibrate() {
        alert('Calibration feature coming soon!');
    }

    showTutorial() {
        this.tutorialModal.style.display = 'flex';
        this.tutorialStep = 0;
        this.updateTutorialContent();
    }

    hideTutorial() {
        this.tutorialModal.style.display = 'none';
    }

    nextTutorialStep() {
        if (this.tutorialStep < 6) {
            this.tutorialStep++;
            this.updateTutorialContent();
        }
    }

    previousTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorialContent();
        }
    }

    updateTutorialContent() {
        const content = document.getElementById('tutorial-content');
        const progress = document.getElementById('tutorial-progress');
        const prevBtn = document.getElementById('tutorial-prev-btn');
        const nextBtn = document.getElementById('tutorial-next-btn');

        const steps = [
            {
                title: 'Welcome to Gesture Control',
                icon: '👋',
                description: 'Control Sandboxels with hand gestures! Make sure your camera is working and you have good lighting.',
                tip: 'Position yourself about 2 feet from the camera for best results.'
            },
            {
                title: 'Drawing Gesture',
                icon: '👆',
                description: 'Point with your index finger to draw with the selected element. Move your hand to draw on the canvas.',
                tip: 'Keep other fingers folded for better detection.'
            },
            {
                title: 'Erasing Gesture',
                icon: '✌️',
                description: 'Make a peace sign (V) with your index and middle finger to erase pixels.',
                tip: 'This works like right-clicking with the mouse.'
            },
            {
                title: 'Element Selection',
                icon: '🤏',
                description: 'Pinch with your thumb and index finger to select an element from the canvas.',
                tip: 'This is like middle-clicking to pick an element.'
            },
            {
                title: 'Control Gestures',
                icon: '✋',
                description: 'Open palm pauses/plays the simulation. Make a fist to reset the canvas.',
                tip: 'These gestures work from anywhere on screen.'
            },
            {
                title: 'Brush Size Control',
                icon: '👍',
                description: 'Thumbs up increases brush size, thumbs down decreases it.',
                tip: 'Great for quick size adjustments while drawing.'
            },
            {
                title: 'Ready to Start!',
                icon: '🎮',
                description: 'You\'re all set! Click "Start Gesture Control" and begin creating with your hands.',
                tip: 'Use Ctrl+Shift+G to quickly toggle the gesture panel.'
            }
        ];

        const step = steps[this.tutorialStep];
        content.innerHTML = `
            <div class="tutorial-step">
                <h4>${step.title}</h4>
                <div class="step-icon">${step.icon}</div>
                <div class="step-description">${step.description}</div>
                <div class="step-tip">${step.tip}</div>
            </div>
        `;

        progress.textContent = `${this.tutorialStep + 1} / ${steps.length}`;
        prevBtn.disabled = this.tutorialStep === 0;
        nextBtn.textContent = this.tutorialStep === steps.length - 1 ? 'Finish' : 'Next';

        if (this.tutorialStep === steps.length - 1) {
            nextBtn.onclick = () => this.hideTutorial();
        } else {
            nextBtn.onclick = () => this.nextTutorialStep();
        }
    }
}

// Initialize UI when gesture controller is available
window.addEventListener('load', () => {
    if (window.gestureController) {
        window.gestureUI = new GestureUI(window.gestureController);
    }
});
