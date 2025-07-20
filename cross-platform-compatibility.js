/**
 * Cross-Platform Compatibility Layer for Gesture Control
 * Handles browser differences, device capabilities, and fallback mechanisms
 */

class CrossPlatformCompatibility {
    constructor() {
        this.platform = this.detectPlatform();
        this.browser = this.detectBrowser();
        this.capabilities = this.detectCapabilities();
        this.optimizations = this.getOptimizations();
        
        this.initializeCompatibilityLayer();
    }

    /**
     * Detect current platform
     */
    detectPlatform() {
        const userAgent = navigator.userAgent;
        
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            return {
                type: 'ios',
                mobile: true,
                name: 'iOS',
                version: this.getIOSVersion(userAgent)
            };
        } else if (/Android/.test(userAgent)) {
            return {
                type: 'android',
                mobile: true,
                name: 'Android',
                version: this.getAndroidVersion(userAgent)
            };
        } else if (/Windows/.test(userAgent)) {
            return {
                type: 'windows',
                mobile: false,
                name: 'Windows',
                version: this.getWindowsVersion(userAgent)
            };
        } else if (/Mac OS X/.test(userAgent)) {
            return {
                type: 'macos',
                mobile: false,
                name: 'macOS',
                version: this.getMacOSVersion(userAgent)
            };
        } else if (/Linux/.test(userAgent)) {
            return {
                type: 'linux',
                mobile: false,
                name: 'Linux',
                version: 'Unknown'
            };
        }
        
        return {
            type: 'unknown',
            mobile: false,
            name: 'Unknown',
            version: 'Unknown'
        };
    }

    /**
     * Detect current browser
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
            return {
                name: 'Chrome',
                version: this.getChromeVersion(userAgent),
                engine: 'Blink',
                gestureSupport: 'excellent'
            };
        } else if (/Firefox/.test(userAgent)) {
            return {
                name: 'Firefox',
                version: this.getFirefoxVersion(userAgent),
                engine: 'Gecko',
                gestureSupport: 'good'
            };
        } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
            return {
                name: 'Safari',
                version: this.getSafariVersion(userAgent),
                engine: 'WebKit',
                gestureSupport: 'limited'
            };
        } else if (/Edge/.test(userAgent)) {
            return {
                name: 'Edge',
                version: this.getEdgeVersion(userAgent),
                engine: 'Blink',
                gestureSupport: 'good'
            };
        }
        
        return {
            name: 'Unknown',
            version: 'Unknown',
            engine: 'Unknown',
            gestureSupport: 'unknown'
        };
    }

    /**
     * Detect device capabilities
     */
    detectCapabilities() {
        return {
            camera: this.hasCameraSupport(),
            webgl: this.hasWebGLSupport(),
            webassembly: this.hasWebAssemblySupport(),
            mediaDevices: !!navigator.mediaDevices,
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            permissions: !!navigator.permissions,
            deviceMemory: navigator.deviceMemory || 4, // GB, fallback to 4GB
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            touchScreen: 'ontouchstart' in window,
            orientation: !!screen.orientation,
            fullscreen: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled),
            localStorage: this.hasLocalStorageSupport(),
            serviceWorker: 'serviceWorker' in navigator
        };
    }

    /**
     * Get platform-specific optimizations
     */
    getOptimizations() {
        const optimizations = {
            modelComplexity: 1,
            maxNumHands: 2,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            cameraWidth: 640,
            cameraHeight: 480,
            processingInterval: 1,
            smoothingFrames: 5,
            confidenceThreshold: 0.6
        };

        // iOS optimizations
        if (this.platform.type === 'ios') {
            optimizations.modelComplexity = 0;
            optimizations.maxNumHands = 1;
            optimizations.minDetectionConfidence = 0.7;
            optimizations.cameraWidth = 320;
            optimizations.cameraHeight = 240;
            optimizations.processingInterval = 2;
            optimizations.confidenceThreshold = 0.7;
        }

        // Android optimizations
        if (this.platform.type === 'android') {
            optimizations.modelComplexity = this.capabilities.deviceMemory < 4 ? 0 : 1;
            optimizations.maxNumHands = this.capabilities.deviceMemory < 3 ? 1 : 2;
            optimizations.cameraWidth = this.capabilities.deviceMemory < 4 ? 320 : 480;
            optimizations.cameraHeight = this.capabilities.deviceMemory < 4 ? 240 : 360;
            optimizations.processingInterval = this.capabilities.hardwareConcurrency < 4 ? 2 : 1;
        }

        // Low-end device optimizations
        if (this.capabilities.deviceMemory < 2 || this.capabilities.hardwareConcurrency < 2) {
            optimizations.modelComplexity = 0;
            optimizations.maxNumHands = 1;
            optimizations.cameraWidth = 240;
            optimizations.cameraHeight = 180;
            optimizations.processingInterval = 3;
            optimizations.smoothingFrames = 3;
        }

        // Safari-specific optimizations
        if (this.browser.name === 'Safari') {
            optimizations.minDetectionConfidence = 0.7;
            optimizations.minTrackingConfidence = 0.7;
            optimizations.confidenceThreshold = 0.7;
        }

        return optimizations;
    }

    /**
     * Initialize compatibility layer
     */
    initializeCompatibilityLayer() {
        this.setupPolyfills();
        this.setupBrowserSpecificFixes();
        this.setupPlatformSpecificHandling();
        this.setupFallbackMechanisms();
    }

    /**
     * Setup polyfills for missing features
     */
    setupPolyfills() {
        // getUserMedia polyfill
        if (!navigator.mediaDevices && navigator.getUserMedia) {
            navigator.mediaDevices = {
                getUserMedia: function(constraints) {
                    return new Promise((resolve, reject) => {
                        navigator.getUserMedia(constraints, resolve, reject);
                    });
                }
            };
        }

        // requestAnimationFrame polyfill
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                         window.mozRequestAnimationFrame ||
                                         function(callback) {
                                             return setTimeout(callback, 1000 / 60);
                                         };
        }

        // Performance.now polyfill
        if (!window.performance || !window.performance.now) {
            window.performance = window.performance || {};
            window.performance.now = function() {
                return Date.now();
            };
        }
    }

    /**
     * Setup browser-specific fixes
     */
    setupBrowserSpecificFixes() {
        // Safari fixes
        if (this.browser.name === 'Safari') {
            // Safari requires user interaction before camera access
            this.requireUserInteraction = true;
            
            // Safari has issues with certain MediaPipe features
            this.disableAdvancedFeatures = true;
        }

        // Firefox fixes
        if (this.browser.name === 'Firefox') {
            // Firefox may have different camera constraints handling
            this.useFirefoxCameraConstraints = true;
        }

        // Edge fixes
        if (this.browser.name === 'Edge') {
            // Edge may need specific handling for some features
            this.useEdgeCompatibilityMode = true;
        }
    }

    /**
     * Setup platform-specific handling
     */
    setupPlatformSpecificHandling() {
        // iOS handling
        if (this.platform.type === 'ios') {
            // iOS requires user gesture to start camera
            this.requireUserGesture = true;
            
            // iOS may have memory constraints
            this.enableMemoryOptimizations = true;
            
            // iOS Safari has specific camera handling
            this.useIOSCameraHandling = true;
        }

        // Android handling
        if (this.platform.type === 'android') {
            // Android may have various camera implementations
            this.useAndroidCameraFallbacks = true;
            
            // Some Android devices have performance issues
            this.enablePerformanceMonitoring = true;
        }

        // Desktop handling
        if (!this.platform.mobile) {
            // Desktop can handle higher quality
            this.enableHighQualityMode = true;
            
            // Desktop may have multiple cameras
            this.enableCameraSelection = true;
        }
    }

    /**
     * Setup fallback mechanisms
     */
    setupFallbackMechanisms() {
        // Camera access fallback
        this.cameraFallbacks = [
            () => this.tryStandardCamera(),
            () => this.tryLegacyCamera(),
            () => this.tryWebRTCCamera(),
            () => this.showCameraError()
        ];

        // MediaPipe fallback
        this.mediaPipeFallbacks = [
            () => this.tryMediaPipeHands(),
            () => this.tryTensorFlowJS(),
            () => this.tryBasicGestureDetection(),
            () => this.showGestureError()
        ];

        // Performance fallback
        this.performanceFallbacks = [
            () => this.reduceQuality(),
            () => this.reduceFrameRate(),
            () => this.disableAdvancedFeatures(),
            () => this.enableBasicMode()
        ];
    }

    /**
     * Apply optimizations to gesture controller
     */
    applyOptimizations(gestureController) {
        if (!gestureController) return;

        // Apply MediaPipe optimizations
        if (gestureController.hands) {
            gestureController.hands.setOptions({
                maxNumHands: this.optimizations.maxNumHands,
                modelComplexity: this.optimizations.modelComplexity,
                minDetectionConfidence: this.optimizations.minDetectionConfidence,
                minTrackingConfidence: this.optimizations.minTrackingConfidence
            });
        }

        // Apply camera optimizations
        if (gestureController.camera) {
            const cameraOptions = {
                width: this.optimizations.cameraWidth,
                height: this.optimizations.cameraHeight
            };

            // Platform-specific camera constraints
            if (this.platform.type === 'ios') {
                cameraOptions.facingMode = 'user';
                cameraOptions.frameRate = { ideal: 15, max: 20 };
            } else if (this.platform.type === 'android') {
                cameraOptions.facingMode = 'user';
                cameraOptions.frameRate = { ideal: 20, max: 30 };
            }

            gestureController.camera = new Camera(gestureController.videoElement, {
                onFrame: async () => {
                    if (gestureController.frameCounter % this.optimizations.processingInterval === 0) {
                        await gestureController.hands.send({ image: gestureController.videoElement });
                    }
                    gestureController.frameCounter++;
                },
                ...cameraOptions
            });
        }

        // Apply processing optimizations
        gestureController.smoothingFrames = this.optimizations.smoothingFrames;
        gestureController.confidenceThreshold = this.optimizations.confidenceThreshold;

        console.log('Applied platform optimizations:', this.optimizations);
    }

    /**
     * Check if camera is supported
     */
    async checkCameraSupport() {
        try {
            if (!this.capabilities.getUserMedia) {
                return { supported: false, reason: 'getUserMedia not available' };
            }

            // Check camera permissions
            if (this.capabilities.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                if (permission.state === 'denied') {
                    return { supported: false, reason: 'Camera permission denied' };
                }
            }

            // Try to enumerate devices
            if (navigator.mediaDevices.enumerateDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                if (cameras.length === 0) {
                    return { supported: false, reason: 'No camera devices found' };
                }
            }

            return { supported: true, reason: 'Camera support detected' };
        } catch (error) {
            return { supported: false, reason: error.message };
        }
    }

    /**
     * Get camera constraints for current platform
     */
    getCameraConstraints() {
        const constraints = {
            video: {
                width: { ideal: this.optimizations.cameraWidth },
                height: { ideal: this.optimizations.cameraHeight },
                facingMode: 'user'
            },
            audio: false
        };

        // Platform-specific constraints
        if (this.platform.type === 'ios') {
            constraints.video.frameRate = { ideal: 15, max: 20 };
            constraints.video.aspectRatio = { ideal: 4/3 };
        } else if (this.platform.type === 'android') {
            constraints.video.frameRate = { ideal: 20, max: 30 };
        } else {
            constraints.video.frameRate = { ideal: 30 };
        }

        return constraints;
    }

    /**
     * Handle platform-specific camera initialization
     */
    async initializeCamera(videoElement) {
        const constraints = this.getCameraConstraints();
        
        try {
            // Try standard approach first
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            return { success: true, stream };
        } catch (error) {
            console.warn('Standard camera initialization failed:', error);
            
            // Try fallback approaches
            for (const fallback of this.cameraFallbacks) {
                try {
                    const result = await fallback();
                    if (result.success) {
                        return result;
                    }
                } catch (fallbackError) {
                    console.warn('Camera fallback failed:', fallbackError);
                }
            }
            
            throw new Error('All camera initialization methods failed');
        }
    }

    /**
     * Monitor performance and apply fallbacks if needed
     */
    startPerformanceMonitoring(gestureController) {
        let frameCount = 0;
        let lastTime = performance.now();
        let lowPerformanceCount = 0;

        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Check for low performance
                if (fps < 15) {
                    lowPerformanceCount++;
                    
                    if (lowPerformanceCount >= 3) {
                        console.warn('Low performance detected, applying fallbacks');
                        this.applyPerformanceFallbacks(gestureController);
                        lowPerformanceCount = 0;
                    }
                } else {
                    lowPerformanceCount = 0;
                }
                
                // Dispatch performance event
                window.dispatchEvent(new CustomEvent('gesturePerformance', {
                    detail: { fps, platform: this.platform.type, browser: this.browser.name }
                }));
            }
            
            if (gestureController.isEnabled) {
                requestAnimationFrame(monitor);
            }
        };
        
        requestAnimationFrame(monitor);
    }

    /**
     * Apply performance fallbacks
     */
    applyPerformanceFallbacks(gestureController) {
        // Reduce model complexity
        if (this.optimizations.modelComplexity > 0) {
            this.optimizations.modelComplexity = 0;
            gestureController.hands.setOptions({ modelComplexity: 0 });
        }
        
        // Reduce max hands
        if (this.optimizations.maxNumHands > 1) {
            this.optimizations.maxNumHands = 1;
            gestureController.hands.setOptions({ maxNumHands: 1 });
        }
        
        // Increase processing interval
        this.optimizations.processingInterval = Math.min(this.optimizations.processingInterval * 2, 5);
        
        // Reduce camera resolution
        if (this.optimizations.cameraWidth > 240) {
            this.optimizations.cameraWidth = 240;
            this.optimizations.cameraHeight = 180;
        }
        
        console.log('Applied performance fallbacks:', this.optimizations);
    }

    /**
     * Get compatibility report
     */
    getCompatibilityReport() {
        return {
            platform: this.platform,
            browser: this.browser,
            capabilities: this.capabilities,
            optimizations: this.optimizations,
            recommendations: this.getRecommendations(),
            warnings: this.getWarnings()
        };
    }

    /**
     * Get recommendations for current platform
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.browser.gestureSupport === 'limited') {
            recommendations.push('Consider using Chrome or Firefox for better gesture support');
        }
        
        if (this.platform.type === 'ios') {
            recommendations.push('Ensure good lighting for better gesture detection on iOS');
            recommendations.push('Use landscape orientation for better camera view');
        }
        
        if (this.capabilities.deviceMemory < 4) {
            recommendations.push('Close other browser tabs to improve performance');
        }
        
        if (!this.capabilities.camera) {
            recommendations.push('Camera access is required for gesture control');
        }
        
        return recommendations;
    }

    /**
     * Get warnings for current platform
     */
    getWarnings() {
        const warnings = [];
        
        if (!this.capabilities.getUserMedia) {
            warnings.push('Camera access not supported in this browser');
        }
        
        if (this.browser.name === 'Safari' && this.platform.type === 'ios') {
            warnings.push('iOS Safari may require manual camera permission');
        }
        
        if (this.capabilities.deviceMemory < 2) {
            warnings.push('Low device memory may affect gesture recognition performance');
        }
        
        if (!window.isSecureContext) {
            warnings.push('HTTPS is required for camera access');
        }
        
        return warnings;
    }

    // Helper methods for version detection
    getIOSVersion(userAgent) {
        const match = userAgent.match(/OS (\d+)_(\d+)/);
        return match ? `${match[1]}.${match[2]}` : 'Unknown';
    }

    getAndroidVersion(userAgent) {
        const match = userAgent.match(/Android (\d+\.?\d*)/);
        return match ? match[1] : 'Unknown';
    }

    getChromeVersion(userAgent) {
        const match = userAgent.match(/Chrome\/(\d+)/);
        return match ? match[1] : 'Unknown';
    }

    getFirefoxVersion(userAgent) {
        const match = userAgent.match(/Firefox\/(\d+)/);
        return match ? match[1] : 'Unknown';
    }

    getSafariVersion(userAgent) {
        const match = userAgent.match(/Version\/(\d+)/);
        return match ? match[1] : 'Unknown';
    }

    getEdgeVersion(userAgent) {
        const match = userAgent.match(/Edge\/(\d+)/);
        return match ? match[1] : 'Unknown';
    }

    // Capability detection helpers
    hasCameraSupport() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    hasWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    hasWebAssemblySupport() {
        return typeof WebAssembly === 'object';
    }

    hasLocalStorageSupport() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Initialize compatibility layer
window.crossPlatformCompatibility = new CrossPlatformCompatibility();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossPlatformCompatibility;
}
