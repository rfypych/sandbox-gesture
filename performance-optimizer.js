/**
 * Performance Optimizer for Gesture Control
 * Monitors and optimizes performance to maintain smooth gameplay
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            gestureLatency: 0,
            cameraLatency: 0
        };
        
        this.thresholds = {
            minFPS: 20,
            maxFrameTime: 50, // ms
            maxCPUUsage: 70, // %
            maxMemoryUsage: 200, // MB
            maxGestureLatency: 100, // ms
            maxCameraLatency: 50 // ms
        };
        
        this.optimizationLevels = {
            ULTRA: 0,
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3,
            MINIMAL: 4
        };
        
        this.currentLevel = this.optimizationLevels.HIGH;
        this.isMonitoring = false;
        this.performanceHistory = [];
        this.maxHistoryLength = 100;
        
        this.optimizationStrategies = this.initializeStrategies();
        this.adaptiveSettings = this.initializeAdaptiveSettings();
        
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFrameTime = this.startTime;
        
        this.initializePerformanceAPI();
    }

    /**
     * Initialize optimization strategies
     */
    initializeStrategies() {
        return {
            [this.optimizationLevels.ULTRA]: {
                name: 'Ultra Quality',
                modelComplexity: 1,
                maxNumHands: 2,
                cameraWidth: 640,
                cameraHeight: 480,
                processingInterval: 1,
                smoothingFrames: 7,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
                enableAdvancedFeatures: true,
                enableHandLandmarkDrawing: true,
                enableGestureHistory: true
            },
            [this.optimizationLevels.HIGH]: {
                name: 'High Quality',
                modelComplexity: 1,
                maxNumHands: 2,
                cameraWidth: 480,
                cameraHeight: 360,
                processingInterval: 1,
                smoothingFrames: 5,
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.6,
                enableAdvancedFeatures: true,
                enableHandLandmarkDrawing: true,
                enableGestureHistory: true
            },
            [this.optimizationLevels.MEDIUM]: {
                name: 'Balanced',
                modelComplexity: 1,
                maxNumHands: 1,
                cameraWidth: 320,
                cameraHeight: 240,
                processingInterval: 2,
                smoothingFrames: 4,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7,
                enableAdvancedFeatures: false,
                enableHandLandmarkDrawing: false,
                enableGestureHistory: true
            },
            [this.optimizationLevels.LOW]: {
                name: 'Performance',
                modelComplexity: 0,
                maxNumHands: 1,
                cameraWidth: 240,
                cameraHeight: 180,
                processingInterval: 3,
                smoothingFrames: 3,
                minDetectionConfidence: 0.8,
                minTrackingConfidence: 0.8,
                enableAdvancedFeatures: false,
                enableHandLandmarkDrawing: false,
                enableGestureHistory: false
            },
            [this.optimizationLevels.MINIMAL]: {
                name: 'Minimal',
                modelComplexity: 0,
                maxNumHands: 1,
                cameraWidth: 160,
                cameraHeight: 120,
                processingInterval: 5,
                smoothingFrames: 2,
                minDetectionConfidence: 0.9,
                minTrackingConfidence: 0.9,
                enableAdvancedFeatures: false,
                enableHandLandmarkDrawing: false,
                enableGestureHistory: false
            }
        };
    }

    /**
     * Initialize adaptive settings
     */
    initializeAdaptiveSettings() {
        return {
            autoOptimize: true,
            adaptiveFrameRate: true,
            adaptiveResolution: true,
            adaptiveModelComplexity: true,
            performanceTarget: 'balanced', // 'performance', 'balanced', 'quality'
            batteryOptimization: this.isBatteryPowered(),
            thermalThrottling: true
        };
    }

    /**
     * Initialize Performance API if available
     */
    initializePerformanceAPI() {
        // Performance Observer for detailed metrics
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'measure') {
                            this.updatePerformanceMetric(entry.name, entry.duration);
                        }
                    }
                });
                
                this.performanceObserver.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('PerformanceObserver not supported:', error);
            }
        }

        // Memory API if available
        if ('memory' in performance) {
            this.memoryAPI = performance.memory;
        }

        // Battery API if available
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                this.batteryAPI = battery;
                this.setupBatteryOptimization(battery);
            });
        }
    }

    /**
     * Start performance monitoring
     */
    startMonitoring(gestureController) {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.gestureController = gestureController;
        
        // Apply initial optimizations
        this.applyOptimizationLevel(this.currentLevel);
        
        // Start monitoring loop
        this.monitoringLoop();
        
        console.log('Performance monitoring started');
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        console.log('Performance monitoring stopped');
    }

    /**
     * Main monitoring loop
     */
    monitoringLoop() {
        if (!this.isMonitoring) return;
        
        const now = performance.now();
        this.frameCount++;
        
        // Calculate FPS
        if (now - this.lastFrameTime >= 1000) {
            this.metrics.fps = this.frameCount;
            this.metrics.frameTime = (now - this.lastFrameTime) / this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = now;
            
            // Update other metrics
            this.updateMetrics();
            
            // Check if optimization is needed
            if (this.adaptiveSettings.autoOptimize) {
                this.checkAndOptimize();
            }
            
            // Store performance history
            this.storePerformanceData();
            
            // Dispatch performance event
            this.dispatchPerformanceEvent();
        }
        
        requestAnimationFrame(() => this.monitoringLoop());
    }

    /**
     * Update performance metrics
     */
    updateMetrics() {
        // Memory usage
        if (this.memoryAPI) {
            this.metrics.memoryUsage = this.memoryAPI.usedJSHeapSize / (1024 * 1024); // MB
        }
        
        // CPU usage estimation (simplified)
        this.metrics.cpuUsage = this.estimateCPUUsage();
        
        // Gesture latency (if available)
        if (this.gestureController && this.gestureController.lastGestureTime) {
            this.metrics.gestureLatency = now - this.gestureController.lastGestureTime;
        }
    }

    /**
     * Estimate CPU usage based on frame timing
     */
    estimateCPUUsage() {
        const targetFrameTime = 1000 / 60; // 60 FPS target
        const actualFrameTime = this.metrics.frameTime;
        
        if (actualFrameTime <= targetFrameTime) {
            return Math.min(50, (actualFrameTime / targetFrameTime) * 50);
        } else {
            return Math.min(100, 50 + ((actualFrameTime - targetFrameTime) / targetFrameTime) * 50);
        }
    }

    /**
     * Check performance and optimize if needed
     */
    checkAndOptimize() {
        const needsOptimization = this.needsOptimization();
        
        if (needsOptimization.reduce && this.currentLevel < this.optimizationLevels.MINIMAL) {
            this.reduceQuality();
        } else if (needsOptimization.increase && this.currentLevel > this.optimizationLevels.ULTRA) {
            this.increaseQuality();
        }
        
        // Apply specific optimizations
        this.applySpecificOptimizations(needsOptimization);
    }

    /**
     * Determine if optimization is needed
     */
    needsOptimization() {
        return {
            reduce: this.metrics.fps < this.thresholds.minFPS ||
                   this.metrics.frameTime > this.thresholds.maxFrameTime ||
                   this.metrics.cpuUsage > this.thresholds.maxCPUUsage ||
                   this.metrics.memoryUsage > this.thresholds.maxMemoryUsage,
            
            increase: this.metrics.fps > this.thresholds.minFPS * 1.5 &&
                     this.metrics.frameTime < this.thresholds.maxFrameTime * 0.7 &&
                     this.metrics.cpuUsage < this.thresholds.maxCPUUsage * 0.7,
            
            memory: this.metrics.memoryUsage > this.thresholds.maxMemoryUsage,
            latency: this.metrics.gestureLatency > this.thresholds.maxGestureLatency
        };
    }

    /**
     * Reduce quality for better performance
     */
    reduceQuality() {
        if (this.currentLevel < this.optimizationLevels.MINIMAL) {
            this.currentLevel++;
            this.applyOptimizationLevel(this.currentLevel);
            console.log(`Reduced quality to: ${this.optimizationStrategies[this.currentLevel].name}`);
        }
    }

    /**
     * Increase quality if performance allows
     */
    increaseQuality() {
        if (this.currentLevel > this.optimizationLevels.ULTRA) {
            this.currentLevel--;
            this.applyOptimizationLevel(this.currentLevel);
            console.log(`Increased quality to: ${this.optimizationStrategies[this.currentLevel].name}`);
        }
    }

    /**
     * Apply optimization level
     */
    applyOptimizationLevel(level) {
        if (!this.gestureController) return;
        
        const strategy = this.optimizationStrategies[level];
        
        // Apply MediaPipe settings
        if (this.gestureController.hands) {
            this.gestureController.hands.setOptions({
                modelComplexity: strategy.modelComplexity,
                maxNumHands: strategy.maxNumHands,
                minDetectionConfidence: strategy.minDetectionConfidence,
                minTrackingConfidence: strategy.minTrackingConfidence
            });
        }
        
        // Apply camera settings
        if (this.gestureController.camera) {
            this.updateCameraSettings(strategy);
        }
        
        // Apply processing settings
        this.gestureController.processingInterval = strategy.processingInterval;
        this.gestureController.smoothingFrames = strategy.smoothingFrames;
        
        // Apply feature toggles
        this.gestureController.enableAdvancedFeatures = strategy.enableAdvancedFeatures;
        this.gestureController.enableHandLandmarkDrawing = strategy.enableHandLandmarkDrawing;
        this.gestureController.enableGestureHistory = strategy.enableGestureHistory;
        
        this.currentLevel = level;
    }

    /**
     * Update camera settings
     */
    updateCameraSettings(strategy) {
        // Note: Changing camera resolution requires restarting the camera
        // This is a simplified approach - in practice, you might want to
        // restart the camera with new constraints
        
        if (this.gestureController.videoElement) {
            const video = this.gestureController.videoElement;
            
            // Try to update video constraints if supported
            if (video.srcObject && video.srcObject.getVideoTracks) {
                const tracks = video.srcObject.getVideoTracks();
                if (tracks.length > 0) {
                    const track = tracks[0];
                    const constraints = {
                        width: { ideal: strategy.cameraWidth },
                        height: { ideal: strategy.cameraHeight }
                    };
                    
                    track.applyConstraints(constraints).catch(error => {
                        console.warn('Failed to apply camera constraints:', error);
                    });
                }
            }
        }
    }

    /**
     * Apply specific optimizations
     */
    applySpecificOptimizations(needs) {
        // Memory optimization
        if (needs.memory) {
            this.optimizeMemoryUsage();
        }
        
        // Latency optimization
        if (needs.latency) {
            this.optimizeLatency();
        }
        
        // Battery optimization
        if (this.adaptiveSettings.batteryOptimization && this.isBatteryLow()) {
            this.applyBatteryOptimizations();
        }
    }

    /**
     * Optimize memory usage
     */
    optimizeMemoryUsage() {
        // Clear performance history
        if (this.performanceHistory.length > 50) {
            this.performanceHistory = this.performanceHistory.slice(-50);
        }
        
        // Reduce gesture history
        if (this.gestureController && this.gestureController.gestureHistory) {
            this.gestureController.gestureHistory = this.gestureController.gestureHistory.slice(-10);
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        console.log('Applied memory optimizations');
    }

    /**
     * Optimize latency
     */
    optimizeLatency() {
        // Reduce processing interval
        if (this.gestureController.processingInterval > 1) {
            this.gestureController.processingInterval = Math.max(1, this.gestureController.processingInterval - 1);
        }
        
        // Reduce smoothing frames
        if (this.gestureController.smoothingFrames > 2) {
            this.gestureController.smoothingFrames = Math.max(2, this.gestureController.smoothingFrames - 1);
        }
        
        console.log('Applied latency optimizations');
    }

    /**
     * Apply battery optimizations
     */
    applyBatteryOptimizations() {
        // Reduce frame rate
        this.gestureController.processingInterval = Math.max(this.gestureController.processingInterval, 3);
        
        // Reduce camera resolution
        const strategy = this.optimizationStrategies[this.optimizationLevels.LOW];
        this.updateCameraSettings(strategy);
        
        // Disable advanced features
        this.gestureController.enableAdvancedFeatures = false;
        this.gestureController.enableHandLandmarkDrawing = false;
        
        console.log('Applied battery optimizations');
    }

    /**
     * Store performance data for analysis
     */
    storePerformanceData() {
        const data = {
            timestamp: Date.now(),
            metrics: { ...this.metrics },
            level: this.currentLevel,
            strategy: this.optimizationStrategies[this.currentLevel].name
        };
        
        this.performanceHistory.push(data);
        
        if (this.performanceHistory.length > this.maxHistoryLength) {
            this.performanceHistory.shift();
        }
    }

    /**
     * Dispatch performance event
     */
    dispatchPerformanceEvent() {
        const event = new CustomEvent('gesturePerformanceUpdate', {
            detail: {
                metrics: this.metrics,
                level: this.currentLevel,
                strategy: this.optimizationStrategies[this.currentLevel].name,
                recommendations: this.getPerformanceRecommendations()
            }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * Get performance recommendations
     */
    getPerformanceRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fps < this.thresholds.minFPS) {
            recommendations.push('Consider reducing gesture recognition quality for better performance');
        }
        
        if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
            recommendations.push('High memory usage detected - close other browser tabs');
        }
        
        if (this.metrics.cpuUsage > this.thresholds.maxCPUUsage) {
            recommendations.push('High CPU usage - consider enabling battery optimization mode');
        }
        
        if (this.isBatteryLow()) {
            recommendations.push('Low battery detected - enable power saving mode');
        }
        
        return recommendations;
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const avgMetrics = this.calculateAverageMetrics();
        
        return {
            current: this.metrics,
            average: avgMetrics,
            level: this.currentLevel,
            strategy: this.optimizationStrategies[this.currentLevel],
            history: this.performanceHistory.slice(-20),
            recommendations: this.getPerformanceRecommendations(),
            thresholds: this.thresholds
        };
    }

    /**
     * Calculate average metrics from history
     */
    calculateAverageMetrics() {
        if (this.performanceHistory.length === 0) return this.metrics;
        
        const recent = this.performanceHistory.slice(-10);
        const avg = {
            fps: 0,
            frameTime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            gestureLatency: 0
        };
        
        for (const data of recent) {
            avg.fps += data.metrics.fps;
            avg.frameTime += data.metrics.frameTime;
            avg.cpuUsage += data.metrics.cpuUsage;
            avg.memoryUsage += data.metrics.memoryUsage;
            avg.gestureLatency += data.metrics.gestureLatency;
        }
        
        const count = recent.length;
        for (const key in avg) {
            avg[key] = avg[key] / count;
        }
        
        return avg;
    }

    /**
     * Setup battery optimization
     */
    setupBatteryOptimization(battery) {
        battery.addEventListener('levelchange', () => {
            if (this.adaptiveSettings.batteryOptimization && battery.level < 0.2) {
                this.applyBatteryOptimizations();
            }
        });
        
        battery.addEventListener('chargingchange', () => {
            if (battery.charging && this.currentLevel > this.optimizationLevels.HIGH) {
                // Restore quality when charging
                this.increaseQuality();
            }
        });
    }

    /**
     * Check if device is battery powered
     */
    isBatteryPowered() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Check if battery is low
     */
    isBatteryLow() {
        return this.batteryAPI && this.batteryAPI.level < 0.2 && !this.batteryAPI.charging;
    }

    /**
     * Update performance metric
     */
    updatePerformanceMetric(name, value) {
        if (name.includes('gesture')) {
            this.metrics.gestureLatency = value;
        } else if (name.includes('camera')) {
            this.metrics.cameraLatency = value;
        }
    }

    /**
     * Set optimization level manually
     */
    setOptimizationLevel(level) {
        if (level >= this.optimizationLevels.ULTRA && level <= this.optimizationLevels.MINIMAL) {
            this.applyOptimizationLevel(level);
            console.log(`Manually set optimization level to: ${this.optimizationStrategies[level].name}`);
        }
    }

    /**
     * Enable/disable auto optimization
     */
    setAutoOptimization(enabled) {
        this.adaptiveSettings.autoOptimize = enabled;
        console.log(`Auto optimization ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Initialize performance optimizer
window.performanceOptimizer = new PerformanceOptimizer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
