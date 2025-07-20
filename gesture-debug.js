/**
 * Gesture Debug Helper
 * Debug tools for troubleshooting gesture control issues
 */

class GestureDebugger {
    constructor() {
        this.isDebugMode = false;
        this.debugPanel = null;
        this.debugLog = [];
        this.maxLogEntries = 100;
        this.debugStats = {
            framesProcessed: 0,
            handsDetected: 0,
            gesturesRecognized: 0,
            errors: 0
        };
        
        this.createDebugPanel();
        this.setupDebugControls();
    }

    /**
     * Create debug panel
     */
    createDebugPanel() {
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'gesture-debug-panel';
        this.debugPanel.className = 'debug-panel';
        this.debugPanel.innerHTML = `
            <div class="debug-header">
                <h4>🐛 Gesture Debug</h4>
                <button id="toggle-debug" class="debug-btn">Enable Debug</button>
                <button id="clear-debug" class="debug-btn">Clear</button>
                <button id="close-debug" class="debug-btn">×</button>
            </div>
            <div class="debug-content">
                <div class="debug-stats">
                    <div class="stat-item">
                        <span>Frames:</span>
                        <span id="debug-frames">0</span>
                    </div>
                    <div class="stat-item">
                        <span>Hands:</span>
                        <span id="debug-hands">0</span>
                    </div>
                    <div class="stat-item">
                        <span>Gestures:</span>
                        <span id="debug-gestures">0</span>
                    </div>
                    <div class="stat-item">
                        <span>Errors:</span>
                        <span id="debug-errors">0</span>
                    </div>
                </div>
                <div class="debug-info">
                    <div class="info-item">
                        <span>Cursor Position:</span>
                        <span id="cursor-position">N/A</span>
                    </div>
                    <div class="info-item">
                        <span>Current Gesture:</span>
                        <span id="current-gesture-debug">None</span>
                    </div>
                    <div class="info-item">
                        <span>Confidence:</span>
                        <span id="gesture-confidence-debug">0%</span>
                    </div>
                    <div class="info-item">
                        <span>Hand Landmarks:</span>
                        <span id="landmarks-status">Not Available</span>
                    </div>
                </div>
                <div class="debug-log">
                    <h5>Debug Log:</h5>
                    <div id="debug-log-content" class="log-content"></div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 300px;
                max-height: 500px;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #ff9800;
                border-radius: 8px;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                z-index: 20000;
                display: none;
                overflow: hidden;
            }
            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: #ff9800;
                color: black;
            }
            .debug-header h4 {
                margin: 0;
                font-size: 12px;
            }
            .debug-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: black;
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 9px;
                margin-left: 4px;
            }
            .debug-btn:hover {
                background: rgba(255, 255, 255, 0.4);
            }
            .debug-content {
                padding: 12px;
                max-height: 400px;
                overflow-y: auto;
            }
            .debug-stats, .debug-info {
                margin-bottom: 12px;
            }
            .stat-item, .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                padding: 2px 0;
                border-bottom: 1px solid #333;
            }
            .debug-log h5 {
                margin: 0 0 8px 0;
                color: #ff9800;
            }
            .log-content {
                background: #111;
                border: 1px solid #333;
                border-radius: 4px;
                padding: 8px;
                height: 150px;
                overflow-y: auto;
                font-size: 10px;
            }
            .log-entry {
                margin-bottom: 2px;
                padding: 2px 4px;
                border-radius: 2px;
            }
            .log-info { background: #1a4a1a; color: #4CAF50; }
            .log-warn { background: #4a4a1a; color: #ffeb3b; }
            .log-error { background: #4a1a1a; color: #f44336; }
            .log-debug { background: #1a1a4a; color: #2196F3; }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.debugPanel);
    }

    /**
     * Setup debug controls
     */
    setupDebugControls() {
        document.getElementById('toggle-debug').onclick = () => this.toggleDebugMode();
        document.getElementById('clear-debug').onclick = () => this.clearDebugLog();
        document.getElementById('close-debug').onclick = () => this.hideDebugPanel();

        // Keyboard shortcut: Ctrl+Shift+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleDebugPanel();
            }
        });
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.isDebugMode = true;
        document.getElementById('toggle-debug').textContent = 'Disable Debug';
        
        // Hook into gesture controller if available
        if (window.gestureController) {
            this.hookGestureController();
        }
        
        // Hook into enhanced UI if available
        if (window.enhancedGestureUI) {
            this.hookEnhancedUI();
        }
        
        this.log('Debug mode enabled', 'info');
        this.startDebugLoop();
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.isDebugMode = false;
        document.getElementById('toggle-debug').textContent = 'Enable Debug';
        this.log('Debug mode disabled', 'info');
    }

    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        if (this.isDebugMode) {
            this.disableDebugMode();
        } else {
            this.enableDebugMode();
        }
    }

    /**
     * Show debug panel
     */
    showDebugPanel() {
        this.debugPanel.style.display = 'block';
    }

    /**
     * Hide debug panel
     */
    hideDebugPanel() {
        this.debugPanel.style.display = 'none';
    }

    /**
     * Toggle debug panel visibility
     */
    toggleDebugPanel() {
        if (this.debugPanel.style.display === 'none') {
            this.showDebugPanel();
        } else {
            this.hideDebugPanel();
        }
    }

    /**
     * Hook into gesture controller
     */
    hookGestureController() {
        if (!window.gestureController) return;

        const originalOnResults = window.gestureController.onResults.bind(window.gestureController);
        window.gestureController.onResults = (results) => {
            this.debugStats.framesProcessed++;
            
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                this.debugStats.handsDetected++;
                
                // Log landmark data
                const landmarks = results.multiHandLandmarks[0];
                if (landmarks && landmarks.length >= 21) {
                    const indexTip = landmarks[8];
                    this.updateCursorDebugInfo(indexTip);
                    
                    // Check gesture
                    const gesture = window.gestureController.classifyHandGesture(landmarks);
                    if (gesture !== 'unknown') {
                        this.debugStats.gesturesRecognized++;
                        this.log(`Gesture detected: ${gesture}`, 'info');
                    }
                    
                    document.getElementById('landmarks-status').textContent = 'Available (21 points)';
                    document.getElementById('current-gesture-debug').textContent = gesture;
                } else {
                    this.log('Invalid landmarks received', 'warn');
                    document.getElementById('landmarks-status').textContent = 'Invalid';
                }
            } else {
                document.getElementById('landmarks-status').textContent = 'No hands detected';
                document.getElementById('current-gesture-debug').textContent = 'None';
                document.getElementById('cursor-position').textContent = 'N/A';
            }
            
            // Call original function
            try {
                originalOnResults(results);
            } catch (error) {
                this.debugStats.errors++;
                this.log(`Error in onResults: ${error.message}`, 'error');
            }
        };
    }

    /**
     * Hook into enhanced UI
     */
    hookEnhancedUI() {
        if (!window.enhancedGestureUI) return;

        const originalUpdateCursor = window.enhancedGestureUI.updateCursorPosition.bind(window.enhancedGestureUI);
        window.enhancedGestureUI.updateCursorPosition = (landmarks) => {
            try {
                originalUpdateCursor(landmarks);
                
                // Debug cursor position
                if (window.enhancedGestureUI.cursorPosition) {
                    const pos = window.enhancedGestureUI.cursorPosition;
                    document.getElementById('cursor-position').textContent = `${Math.round(pos.x)}, ${Math.round(pos.y)}`;
                }
            } catch (error) {
                this.debugStats.errors++;
                this.log(`Error updating cursor: ${error.message}`, 'error');
            }
        };
    }

    /**
     * Update cursor debug info
     */
    updateCursorDebugInfo(indexTip) {
        if (!indexTip) return;
        
        const gameCanvas = document.getElementById('game') || document.querySelector('canvas');
        if (gameCanvas) {
            const canvasRect = gameCanvas.getBoundingClientRect();
            const x = canvasRect.left + (indexTip.x * canvasRect.width);
            const y = canvasRect.top + (indexTip.y * canvasRect.height);
            
            document.getElementById('cursor-position').textContent = `${Math.round(x)}, ${Math.round(y)}`;
        }
    }

    /**
     * Start debug update loop
     */
    startDebugLoop() {
        if (!this.isDebugMode) return;
        
        // Update debug stats
        document.getElementById('debug-frames').textContent = this.debugStats.framesProcessed;
        document.getElementById('debug-hands').textContent = this.debugStats.handsDetected;
        document.getElementById('debug-gestures').textContent = this.debugStats.gesturesRecognized;
        document.getElementById('debug-errors').textContent = this.debugStats.errors;
        
        // Continue loop
        setTimeout(() => this.startDebugLoop(), 100);
    }

    /**
     * Log debug message
     */
    log(message, type = 'debug') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        
        this.debugLog.push(logEntry);
        
        // Keep only recent entries
        if (this.debugLog.length > this.maxLogEntries) {
            this.debugLog.shift();
        }
        
        this.updateLogDisplay();
        
        // Also log to console
        console.log(`[Gesture Debug] ${timestamp} - ${message}`);
    }

    /**
     * Update log display
     */
    updateLogDisplay() {
        const logContent = document.getElementById('debug-log-content');
        if (!logContent) return;
        
        logContent.innerHTML = '';
        
        // Show recent entries
        const recentEntries = this.debugLog.slice(-20);
        for (const entry of recentEntries) {
            const div = document.createElement('div');
            div.className = `log-entry log-${entry.type}`;
            div.textContent = `[${entry.timestamp}] ${entry.message}`;
            logContent.appendChild(div);
        }
        
        // Scroll to bottom
        logContent.scrollTop = logContent.scrollHeight;
    }

    /**
     * Clear debug log
     */
    clearDebugLog() {
        this.debugLog = [];
        this.debugStats = {
            framesProcessed: 0,
            handsDetected: 0,
            gesturesRecognized: 0,
            errors: 0
        };
        this.updateLogDisplay();
        this.log('Debug log cleared', 'info');
    }

    /**
     * Export debug data
     */
    exportDebugData() {
        const debugData = {
            stats: this.debugStats,
            log: this.debugLog,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: {
                mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory
            }
        };
        
        const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gesture-debug-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('Debug data exported', 'info');
    }

    /**
     * Quick fix for stuck cursor
     */
    fixStuckCursor() {
        this.log('Attempting to fix stuck cursor...', 'info');
        
        // Reset cursor positions
        if (window.enhancedGestureUI) {
            window.enhancedGestureUI.hideCursors();
            
            setTimeout(() => {
                if (window.enhancedGestureUI.virtualCursor) {
                    window.enhancedGestureUI.virtualCursor.style.transform = 'translate(-50%, -50%)';
                    window.enhancedGestureUI.virtualCursor.style.transition = 'all 0.1s ease';
                }
                this.log('Cursor reset applied', 'info');
            }, 100);
        }
        
        // Force gesture controller restart
        if (window.gestureController && window.gestureController.isEnabled) {
            this.log('Restarting gesture controller...', 'info');
            window.gestureController.stop();
            setTimeout(() => {
                window.gestureController.start();
                this.log('Gesture controller restarted', 'info');
            }, 1000);
        }
    }
}

// Initialize debugger
window.gestureDebugger = new GestureDebugger();

// Add quick fix button to main UI
window.addEventListener('load', () => {
    setTimeout(() => {
        const controlsContainer = document.querySelector('.controlButtons') || 
                                document.querySelector('#controls') ||
                                document.querySelector('.controls');
        
        if (controlsContainer) {
            const debugBtn = document.createElement('button');
            debugBtn.id = 'debug-gesture-btn';
            debugBtn.className = 'controlButton';
            debugBtn.title = 'Debug Gesture Control (Ctrl+Shift+D)';
            debugBtn.innerHTML = '🐛';
            debugBtn.style.cssText = 'background: #ff9800; color: white; border: 2px solid #f57c00;';
            debugBtn.onclick = () => {
                window.gestureDebugger.toggleDebugPanel();
                if (!window.gestureDebugger.isDebugMode) {
                    window.gestureDebugger.enableDebugMode();
                }
            };
            
            // Insert after gesture button
            const gestureBtn = document.getElementById('main-gesture-btn');
            if (gestureBtn) {
                gestureBtn.parentNode.insertBefore(debugBtn, gestureBtn.nextSibling);
            } else {
                controlsContainer.appendChild(debugBtn);
            }
        }
        
        // Add quick fix button
        const fixBtn = document.createElement('button');
        fixBtn.textContent = 'Fix Stuck Cursor';
        fixBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 25000;
            font-family: 'Press Start 2P', monospace;
            font-size: 8px;
        `;
        fixBtn.onclick = () => window.gestureDebugger.fixStuckCursor();
        document.body.appendChild(fixBtn);
        
    }, 3000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureDebugger;
}
