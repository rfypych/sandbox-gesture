/**
 * Gesture Accuracy Configuration
 * Fine-tuned settings for maximum gesture recognition accuracy
 */

class GestureAccuracyConfig {
    constructor() {
        this.accuracySettings = {
            // MediaPipe Hand Detection Settings
            detection: {
                modelComplexity: 1, // 0=lite, 1=full (better accuracy)
                minDetectionConfidence: 0.8, // Higher threshold for better accuracy
                minTrackingConfidence: 0.8,
                maxNumHands: 2,
                staticImageMode: false,
                selfieMode: true // Mirror camera for natural interaction
            },
            
            // Gesture Recognition Thresholds
            recognition: {
                pinchThreshold: 0.04, // Distance threshold for pinch detection
                pinchConfidenceMin: 0.8, // Minimum confidence for pinch
                gestureConfidenceMin: 0.7, // Minimum confidence for gesture recognition
                stabilityFrames: 5, // Frames to confirm gesture stability
                smoothingWindow: 3, // Frames for gesture smoothing
                
                // Finger extension thresholds
                fingerExtensionRatio: 0.8, // Ratio for finger extension detection
                thumbExtensionMultiplier: 1.3, // Thumb extension sensitivity
                
                // Gesture-specific thresholds
                pointingStraightness: 0.85, // Index finger straightness for pointing
                vAngleMin: 20, // Minimum V-angle for peace sign
                vAngleMax: 60, // Maximum V-angle for peace sign
                palmSpreadMin: 0.6, // Minimum finger spread for open palm
                fistCompactness: 0.7 // Minimum compactness for fist detection
            },
            
            // Visual Feedback Settings
            visual: {
                showHandLandmarks: true,
                showGestureOverlay: true,
                showCameraPreview: true,
                cursorSize: 20, // Virtual cursor size in pixels
                pinchCursorSize: 40, // Pinch cursor size in pixels
                feedbackDuration: 600, // Visual feedback duration in ms
                
                // Colors
                colors: {
                    leftHand: '#4CAF50',
                    rightHand: '#2196F3',
                    activeCursor: '#ff4444',
                    inactiveCursor: '#4CAF50',
                    pinchActive: '#ff4444',
                    pinchInactive: '#2196F3'
                }
            },
            
            // Performance Settings
            performance: {
                targetFPS: 30,
                processingInterval: 1, // Process every N frames (1 = every frame)
                cameraWidth: 640,
                cameraHeight: 480,
                enableGPUAcceleration: true,
                
                // Adaptive quality based on performance
                adaptiveQuality: {
                    enabled: true,
                    fpsThreshold: 20, // Switch to lower quality below this FPS
                    lowQualitySettings: {
                        modelComplexity: 0,
                        cameraWidth: 320,
                        cameraHeight: 240,
                        processingInterval: 2
                    }
                }
            },
            
            // Platform-specific optimizations
            platform: {
                mobile: {
                    modelComplexity: 0,
                    cameraWidth: 320,
                    cameraHeight: 240,
                    processingInterval: 2,
                    maxNumHands: 1,
                    enableGPUAcceleration: false
                },
                desktop: {
                    modelComplexity: 1,
                    cameraWidth: 640,
                    cameraHeight: 480,
                    processingInterval: 1,
                    maxNumHands: 2,
                    enableGPUAcceleration: true
                }
            }
        };
        
        this.gestureProfiles = this.initializeGestureProfiles();
        this.currentProfile = 'balanced';
    }

    /**
     * Initialize different accuracy profiles
     */
    initializeGestureProfiles() {
        return {
            // Maximum accuracy (high resource usage)
            maximum: {
                name: 'Maximum Accuracy',
                detection: {
                    modelComplexity: 1,
                    minDetectionConfidence: 0.9,
                    minTrackingConfidence: 0.9
                },
                recognition: {
                    gestureConfidenceMin: 0.8,
                    stabilityFrames: 7,
                    smoothingWindow: 5
                },
                performance: {
                    processingInterval: 1,
                    cameraWidth: 640,
                    cameraHeight: 480
                }
            },
            
            // Balanced accuracy and performance
            balanced: {
                name: 'Balanced',
                detection: {
                    modelComplexity: 1,
                    minDetectionConfidence: 0.8,
                    minTrackingConfidence: 0.8
                },
                recognition: {
                    gestureConfidenceMin: 0.7,
                    stabilityFrames: 5,
                    smoothingWindow: 3
                },
                performance: {
                    processingInterval: 1,
                    cameraWidth: 480,
                    cameraHeight: 360
                }
            },
            
            // Performance optimized (lower accuracy)
            performance: {
                name: 'Performance',
                detection: {
                    modelComplexity: 0,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7
                },
                recognition: {
                    gestureConfidenceMin: 0.6,
                    stabilityFrames: 3,
                    smoothingWindow: 2
                },
                performance: {
                    processingInterval: 2,
                    cameraWidth: 320,
                    cameraHeight: 240
                }
            }
        };
    }

    /**
     * Apply accuracy configuration to gesture controller
     */
    applyConfiguration(gestureController, profile = null) {
        if (!gestureController) {
            console.error('Gesture controller not provided');
            return false;
        }

        const config = profile ? this.gestureProfiles[profile] : this.gestureProfiles[this.currentProfile];
        if (!config) {
            console.error('Invalid profile:', profile);
            return false;
        }

        try {
            // Apply MediaPipe settings
            if (gestureController.hands) {
                const detectionSettings = {
                    ...this.accuracySettings.detection,
                    ...config.detection
                };
                
                gestureController.hands.setOptions(detectionSettings);
                console.log('Applied MediaPipe settings:', detectionSettings);
            }

            // Apply recognition settings
            const recognitionSettings = {
                ...this.accuracySettings.recognition,
                ...config.recognition
            };
            
            Object.assign(gestureController, recognitionSettings);
            console.log('Applied recognition settings:', recognitionSettings);

            // Apply performance settings
            const performanceSettings = {
                ...this.accuracySettings.performance,
                ...config.performance
            };
            
            if (gestureController.camera) {
                // Note: Camera settings require restart to take effect
                gestureController.cameraSettings = {
                    width: performanceSettings.cameraWidth,
                    height: performanceSettings.cameraHeight
                };
            }

            gestureController.processingInterval = performanceSettings.processingInterval;
            console.log('Applied performance settings:', performanceSettings);

            // Apply visual settings
            if (window.enhancedGestureUI) {
                this.applyVisualSettings(window.enhancedGestureUI);
            }

            this.currentProfile = profile || this.currentProfile;
            console.log(`✅ Applied accuracy profile: ${config.name}`);
            
            return true;
        } catch (error) {
            console.error('Failed to apply configuration:', error);
            return false;
        }
    }

    /**
     * Apply visual settings to enhanced UI
     */
    applyVisualSettings(enhancedUI) {
        const visual = this.accuracySettings.visual;
        
        // Update cursor sizes
        if (enhancedUI.virtualCursor) {
            enhancedUI.virtualCursor.style.width = visual.cursorSize + 'px';
            enhancedUI.virtualCursor.style.height = visual.cursorSize + 'px';
        }
        
        if (enhancedUI.pinchCursor) {
            enhancedUI.pinchCursor.style.width = visual.pinchCursorSize + 'px';
            enhancedUI.pinchCursor.style.height = visual.pinchCursorSize + 'px';
        }
        
        // Update colors
        const style = document.createElement('style');
        style.textContent = `
            .virtual-cursor {
                border-color: ${visual.colors.inactiveCursor} !important;
                background: ${visual.colors.inactiveCursor}33 !important;
            }
            .virtual-cursor.active {
                border-color: ${visual.colors.activeCursor} !important;
                background: ${visual.colors.activeCursor}33 !important;
            }
            .pinch-circle {
                border-color: ${visual.colors.pinchInactive} !important;
            }
            .pinch-circle.active {
                border-color: ${visual.colors.pinchActive} !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Auto-detect and apply optimal settings
     */
    autoOptimize(gestureController) {
        const platform = this.detectPlatform();
        const deviceCapabilities = this.assessDeviceCapabilities();
        
        let optimalProfile = 'balanced';
        
        // Choose profile based on platform and capabilities
        if (platform.mobile || deviceCapabilities.memory < 4) {
            optimalProfile = 'performance';
        } else if (deviceCapabilities.cpu >= 8 && deviceCapabilities.memory >= 8) {
            optimalProfile = 'maximum';
        }
        
        console.log(`Auto-selected profile: ${optimalProfile} for platform: ${platform.type}`);
        return this.applyConfiguration(gestureController, optimalProfile);
    }

    /**
     * Detect current platform
     */
    detectPlatform() {
        const userAgent = navigator.userAgent;
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        return {
            mobile,
            type: mobile ? 'mobile' : 'desktop',
            ios: /iPad|iPhone|iPod/.test(userAgent),
            android: /Android/.test(userAgent)
        };
    }

    /**
     * Assess device capabilities
     */
    assessDeviceCapabilities() {
        return {
            cpu: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            gpu: this.hasGPUAcceleration(),
            camera: this.hasCameraSupport()
        };
    }

    /**
     * Check GPU acceleration support
     */
    hasGPUAcceleration() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check camera support
     */
    hasCameraSupport() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Create accuracy control UI
     */
    createAccuracyControlUI() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'accuracy-control-panel';
        controlPanel.className = 'accuracy-control';
        controlPanel.innerHTML = `
            <div class="accuracy-header">
                <h4>🎯 Accuracy Settings</h4>
            </div>
            <div class="accuracy-content">
                <div class="profile-selector">
                    <label>Profile:</label>
                    <select id="accuracy-profile">
                        <option value="maximum">Maximum Accuracy</option>
                        <option value="balanced" selected>Balanced</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>
                <div class="accuracy-settings">
                    <div class="setting-item">
                        <label>Detection Confidence:</label>
                        <input type="range" id="detection-confidence" min="0.5" max="0.95" step="0.05" value="0.8">
                        <span id="detection-value">0.8</span>
                    </div>
                    <div class="setting-item">
                        <label>Gesture Confidence:</label>
                        <input type="range" id="gesture-confidence" min="0.5" max="0.9" step="0.05" value="0.7">
                        <span id="gesture-value">0.7</span>
                    </div>
                    <div class="setting-item">
                        <label>Stability Frames:</label>
                        <input type="range" id="stability-frames" min="2" max="10" step="1" value="5">
                        <span id="stability-value">5</span>
                    </div>
                </div>
                <div class="accuracy-actions">
                    <button id="apply-accuracy" class="accuracy-btn">Apply Settings</button>
                    <button id="auto-optimize" class="accuracy-btn">Auto Optimize</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .accuracy-control {
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid #4CAF50;
                border-radius: 5px;
                padding: 10px;
                margin: 10px 0;
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                color: white;
            }
            .accuracy-header h4 {
                margin: 0 0 10px 0;
                color: #4CAF50;
            }
            .profile-selector, .setting-item {
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .profile-selector select, .setting-item input {
                margin-left: 10px;
            }
            .accuracy-btn {
                background: #4CAF50;
                color: black;
                border: none;
                padding: 5px 10px;
                margin: 2px;
                border-radius: 3px;
                cursor: pointer;
                font-family: inherit;
                font-size: 7px;
            }
            .accuracy-btn:hover {
                background: #45a049;
            }
        `;
        document.head.appendChild(style);

        return controlPanel;
    }

    /**
     * Get current configuration
     */
    getCurrentConfig() {
        return {
            profile: this.currentProfile,
            settings: this.accuracySettings,
            profileSettings: this.gestureProfiles[this.currentProfile]
        };
    }

    /**
     * Export configuration
     */
    exportConfig() {
        return JSON.stringify(this.getCurrentConfig(), null, 2);
    }

    /**
     * Import configuration
     */
    importConfig(configJson) {
        try {
            const config = JSON.parse(configJson);
            if (config.settings) {
                this.accuracySettings = { ...this.accuracySettings, ...config.settings };
            }
            if (config.profile && this.gestureProfiles[config.profile]) {
                this.currentProfile = config.profile;
            }
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
}

// Initialize accuracy configuration
window.gestureAccuracyConfig = new GestureAccuracyConfig();

// Auto-apply optimal settings when gesture controller is ready
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.gestureController && window.gestureAccuracyConfig) {
            window.gestureAccuracyConfig.autoOptimize(window.gestureController);
            console.log('✅ Auto-optimized gesture accuracy settings');
        }
    }, 3000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureAccuracyConfig;
}
