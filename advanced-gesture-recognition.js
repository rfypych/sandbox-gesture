/**
 * Advanced Gesture Recognition System
 * Enhanced gesture detection with machine learning and custom gesture training
 */

class AdvancedGestureRecognition {
    constructor() {
        this.gestureDatabase = new Map();
        this.customGestures = new Map();
        this.trainingData = [];
        this.isTraining = false;
        this.currentTrainingGesture = null;
        this.trainingFrames = [];
        this.minTrainingFrames = 30;
        this.maxTrainingFrames = 60;
        
        // Advanced recognition parameters
        this.temporalWindow = 10; // frames to consider for temporal gestures
        this.gestureHistory = [];
        this.confidenceThreshold = 0.7;
        this.stabilityThreshold = 0.8;
        
        // Feature extraction parameters
        this.landmarkFeatures = [];
        this.velocityFeatures = [];
        this.accelerationFeatures = [];
        
        this.initializeBuiltInGestures();
    }

    /**
     * Initialize built-in gesture patterns
     */
    initializeBuiltInGestures() {
        // Static gestures
        this.gestureDatabase.set('point', {
            type: 'static',
            features: this.createStaticGestureTemplate('point'),
            confidence: 0.8,
            description: 'Index finger pointing'
        });

        this.gestureDatabase.set('peace', {
            type: 'static',
            features: this.createStaticGestureTemplate('peace'),
            confidence: 0.8,
            description: 'Peace sign (V)'
        });

        this.gestureDatabase.set('thumbs_up', {
            type: 'static',
            features: this.createStaticGestureTemplate('thumbs_up'),
            confidence: 0.8,
            description: 'Thumbs up'
        });

        this.gestureDatabase.set('open_palm', {
            type: 'static',
            features: this.createStaticGestureTemplate('open_palm'),
            confidence: 0.8,
            description: 'Open palm'
        });

        this.gestureDatabase.set('fist', {
            type: 'static',
            features: this.createStaticGestureTemplate('fist'),
            confidence: 0.8,
            description: 'Closed fist'
        });

        this.gestureDatabase.set('pinch', {
            type: 'static',
            features: this.createStaticGestureTemplate('pinch'),
            confidence: 0.7,
            description: 'Pinch gesture'
        });

        // Dynamic gestures
        this.gestureDatabase.set('swipe_left', {
            type: 'dynamic',
            features: this.createDynamicGestureTemplate('swipe_left'),
            confidence: 0.7,
            description: 'Swipe left motion'
        });

        this.gestureDatabase.set('swipe_right', {
            type: 'dynamic',
            features: this.createDynamicGestureTemplate('swipe_right'),
            confidence: 0.7,
            description: 'Swipe right motion'
        });

        this.gestureDatabase.set('circle_clockwise', {
            type: 'dynamic',
            features: this.createDynamicGestureTemplate('circle_clockwise'),
            confidence: 0.6,
            description: 'Circular motion clockwise'
        });

        this.gestureDatabase.set('zoom_in', {
            type: 'two_hand',
            features: this.createTwoHandGestureTemplate('zoom_in'),
            confidence: 0.7,
            description: 'Two hands moving apart'
        });

        this.gestureDatabase.set('zoom_out', {
            type: 'two_hand',
            features: this.createTwoHandGestureTemplate('zoom_out'),
            confidence: 0.7,
            description: 'Two hands moving together'
        });
    }

    /**
     * Create static gesture template
     */
    createStaticGestureTemplate(gestureName) {
        const templates = {
            'point': {
                fingerStates: [false, true, false, false, false], // thumb, index, middle, ring, pinky
                handShape: 'extended_index',
                palmDirection: 'forward',
                thumbPosition: 'side'
            },
            'peace': {
                fingerStates: [false, true, true, false, false],
                handShape: 'v_sign',
                palmDirection: 'forward',
                thumbPosition: 'folded'
            },
            'thumbs_up': {
                fingerStates: [true, false, false, false, false],
                handShape: 'thumb_up',
                palmDirection: 'side',
                thumbPosition: 'up'
            },
            'open_palm': {
                fingerStates: [true, true, true, true, true],
                handShape: 'open',
                palmDirection: 'forward',
                thumbPosition: 'extended'
            },
            'fist': {
                fingerStates: [false, false, false, false, false],
                handShape: 'closed',
                palmDirection: 'any',
                thumbPosition: 'wrapped'
            },
            'pinch': {
                fingerStates: [true, true, false, false, false],
                handShape: 'pinch',
                palmDirection: 'any',
                thumbPosition: 'touching_index',
                specialCondition: 'thumb_index_distance_small'
            }
        };
        
        return templates[gestureName] || null;
    }

    /**
     * Create dynamic gesture template
     */
    createDynamicGestureTemplate(gestureName) {
        const templates = {
            'swipe_left': {
                motionPattern: 'horizontal_left',
                minVelocity: 0.1,
                direction: [-1, 0],
                duration: [10, 30], // frames
                handShape: 'any'
            },
            'swipe_right': {
                motionPattern: 'horizontal_right',
                minVelocity: 0.1,
                direction: [1, 0],
                duration: [10, 30],
                handShape: 'any'
            },
            'circle_clockwise': {
                motionPattern: 'circular',
                direction: 'clockwise',
                minRadius: 0.05,
                duration: [20, 60],
                handShape: 'point'
            }
        };
        
        return templates[gestureName] || null;
    }

    /**
     * Create two-hand gesture template
     */
    createTwoHandGestureTemplate(gestureName) {
        const templates = {
            'zoom_in': {
                handCount: 2,
                motionPattern: 'diverging',
                minDistance: 0.1,
                handShape: 'any',
                synchronization: 'opposite'
            },
            'zoom_out': {
                handCount: 2,
                motionPattern: 'converging',
                maxDistance: 0.3,
                handShape: 'any',
                synchronization: 'opposite'
            }
        };
        
        return templates[gestureName] || null;
    }

    /**
     * Extract comprehensive features from hand landmarks
     */
    extractFeatures(landmarks, previousLandmarks = null) {
        const features = {
            static: this.extractStaticFeatures(landmarks),
            dynamic: previousLandmarks ? this.extractDynamicFeatures(landmarks, previousLandmarks) : null,
            geometric: this.extractGeometricFeatures(landmarks),
            temporal: this.extractTemporalFeatures(landmarks)
        };
        
        return features;
    }

    /**
     * Extract static features (finger positions, hand shape)
     */
    extractStaticFeatures(landmarks) {
        const features = {
            fingerStates: this.getFingerStates(landmarks),
            fingerAngles: this.getFingerAngles(landmarks),
            palmNormal: this.getPalmNormal(landmarks),
            handBoundingBox: this.getHandBoundingBox(landmarks),
            fingerDistances: this.getFingerDistances(landmarks)
        };
        
        return features;
    }

    /**
     * Extract dynamic features (motion, velocity, acceleration)
     */
    extractDynamicFeatures(landmarks, previousLandmarks) {
        const features = {
            velocity: this.calculateVelocity(landmarks, previousLandmarks),
            acceleration: this.calculateAcceleration(landmarks, previousLandmarks),
            motionDirection: this.getMotionDirection(landmarks, previousLandmarks),
            motionMagnitude: this.getMotionMagnitude(landmarks, previousLandmarks)
        };
        
        return features;
    }

    /**
     * Extract geometric features (distances, angles, ratios)
     */
    extractGeometricFeatures(landmarks) {
        const features = {
            fingerLengths: this.getFingerLengths(landmarks),
            palmSize: this.getPalmSize(landmarks),
            aspectRatio: this.getHandAspectRatio(landmarks),
            centroid: this.getHandCentroid(landmarks),
            orientation: this.getHandOrientation(landmarks)
        };
        
        return features;
    }

    /**
     * Extract temporal features (gesture stability over time)
     */
    extractTemporalFeatures(landmarks) {
        // Add current landmarks to history
        this.gestureHistory.push(landmarks);
        
        // Keep only recent history
        if (this.gestureHistory.length > this.temporalWindow) {
            this.gestureHistory.shift();
        }
        
        if (this.gestureHistory.length < 3) {
            return null;
        }
        
        const features = {
            stability: this.calculateGestureStability(),
            consistency: this.calculateGestureConsistency(),
            trend: this.calculateGestureTrend()
        };
        
        return features;
    }

    /**
     * Advanced gesture recognition with multiple algorithms
     */
    recognizeGesture(landmarks, previousLandmarks = null, handedness = 'Right') {
        const features = this.extractFeatures(landmarks, previousLandmarks);
        
        // Try different recognition approaches
        const staticResult = this.recognizeStaticGesture(features.static);
        const dynamicResult = features.dynamic ? this.recognizeDynamicGesture(features.dynamic) : null;
        const customResult = this.recognizeCustomGesture(features);
        
        // Combine results with confidence weighting
        const results = [staticResult, dynamicResult, customResult].filter(r => r !== null);
        
        if (results.length === 0) {
            return { gesture: 'unknown', confidence: 0, features };
        }
        
        // Select best result based on confidence
        const bestResult = results.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );
        
        // Apply temporal smoothing
        const smoothedResult = this.applyTemporalSmoothing(bestResult, features.temporal);
        
        return {
            gesture: smoothedResult.gesture,
            confidence: smoothedResult.confidence,
            type: smoothedResult.type || 'static',
            features,
            handedness,
            timestamp: Date.now()
        };
    }

    /**
     * Recognize static gestures
     */
    recognizeStaticGesture(staticFeatures) {
        let bestMatch = null;
        let bestConfidence = 0;
        
        for (const [gestureName, gestureData] of this.gestureDatabase) {
            if (gestureData.type !== 'static') continue;
            
            const confidence = this.calculateStaticGestureConfidence(
                staticFeatures, 
                gestureData.features
            );
            
            if (confidence > bestConfidence && confidence > this.confidenceThreshold) {
                bestMatch = gestureName;
                bestConfidence = confidence;
            }
        }
        
        return bestMatch ? { gesture: bestMatch, confidence: bestConfidence, type: 'static' } : null;
    }

    /**
     * Recognize dynamic gestures
     */
    recognizeDynamicGesture(dynamicFeatures) {
        let bestMatch = null;
        let bestConfidence = 0;
        
        for (const [gestureName, gestureData] of this.gestureDatabase) {
            if (gestureData.type !== 'dynamic') continue;
            
            const confidence = this.calculateDynamicGestureConfidence(
                dynamicFeatures, 
                gestureData.features
            );
            
            if (confidence > bestConfidence && confidence > this.confidenceThreshold) {
                bestMatch = gestureName;
                bestConfidence = confidence;
            }
        }
        
        return bestMatch ? { gesture: bestMatch, confidence: bestConfidence, type: 'dynamic' } : null;
    }

    /**
     * Recognize custom trained gestures
     */
    recognizeCustomGesture(features) {
        let bestMatch = null;
        let bestConfidence = 0;
        
        for (const [gestureName, gestureData] of this.customGestures) {
            const confidence = this.calculateCustomGestureConfidence(features, gestureData);
            
            if (confidence > bestConfidence && confidence > this.confidenceThreshold) {
                bestMatch = gestureName;
                bestConfidence = confidence;
            }
        }
        
        return bestMatch ? { gesture: bestMatch, confidence: bestConfidence, type: 'custom' } : null;
    }

    /**
     * Calculate confidence for static gestures
     */
    calculateStaticGestureConfidence(features, template) {
        let totalScore = 0;
        let maxScore = 0;
        
        // Compare finger states
        if (template.fingerStates && features.fingerStates) {
            const fingerScore = this.compareFingerStates(features.fingerStates, template.fingerStates);
            totalScore += fingerScore * 0.4;
            maxScore += 0.4;
        }
        
        // Compare hand shape
        if (template.handShape && features.handBoundingBox) {
            const shapeScore = this.compareHandShape(features, template.handShape);
            totalScore += shapeScore * 0.3;
            maxScore += 0.3;
        }
        
        // Compare special conditions
        if (template.specialCondition) {
            const specialScore = this.checkSpecialCondition(features, template.specialCondition);
            totalScore += specialScore * 0.3;
            maxScore += 0.3;
        }
        
        return maxScore > 0 ? totalScore / maxScore : 0;
    }

    /**
     * Calculate confidence for dynamic gestures
     */
    calculateDynamicGestureConfidence(features, template) {
        let totalScore = 0;
        let maxScore = 0;
        
        // Compare motion pattern
        if (template.motionPattern && features.motionDirection) {
            const motionScore = this.compareMotionPattern(features, template);
            totalScore += motionScore * 0.5;
            maxScore += 0.5;
        }
        
        // Compare velocity
        if (template.minVelocity && features.motionMagnitude) {
            const velocityScore = features.motionMagnitude >= template.minVelocity ? 1 : 0;
            totalScore += velocityScore * 0.3;
            maxScore += 0.3;
        }
        
        // Compare direction
        if (template.direction && features.motionDirection) {
            const directionScore = this.compareDirection(features.motionDirection, template.direction);
            totalScore += directionScore * 0.2;
            maxScore += 0.2;
        }
        
        return maxScore > 0 ? totalScore / maxScore : 0;
    }

    /**
     * Apply temporal smoothing to reduce noise
     */
    applyTemporalSmoothing(result, temporalFeatures) {
        if (!temporalFeatures || temporalFeatures.stability < this.stabilityThreshold) {
            return result;
        }
        
        // Boost confidence for stable gestures
        const stabilityBoost = temporalFeatures.stability * 0.1;
        const smoothedConfidence = Math.min(1.0, result.confidence + stabilityBoost);
        
        return {
            ...result,
            confidence: smoothedConfidence
        };
    }

    /**
     * Start training a custom gesture
     */
    startGestureTraining(gestureName) {
        this.isTraining = true;
        this.currentTrainingGesture = gestureName;
        this.trainingFrames = [];
        
        console.log(`Started training gesture: ${gestureName}`);
        return true;
    }

    /**
     * Add training frame
     */
    addTrainingFrame(landmarks) {
        if (!this.isTraining) return false;
        
        const features = this.extractFeatures(landmarks);
        this.trainingFrames.push({
            landmarks,
            features,
            timestamp: Date.now()
        });
        
        return this.trainingFrames.length;
    }

    /**
     * Complete gesture training
     */
    completeGestureTraining() {
        if (!this.isTraining || this.trainingFrames.length < this.minTrainingFrames) {
            return false;
        }
        
        // Create gesture template from training data
        const gestureTemplate = this.createGestureTemplate(this.trainingFrames);
        
        // Store custom gesture
        this.customGestures.set(this.currentTrainingGesture, {
            template: gestureTemplate,
            trainingFrames: this.trainingFrames.length,
            created: Date.now(),
            confidence: 0.8
        });
        
        // Reset training state
        this.isTraining = false;
        this.currentTrainingGesture = null;
        this.trainingFrames = [];
        
        console.log(`Completed training for gesture: ${this.currentTrainingGesture}`);
        return true;
    }

    /**
     * Create gesture template from training frames
     */
    createGestureTemplate(frames) {
        // Analyze training frames to create a robust template
        const template = {
            staticFeatures: this.analyzeStaticFeatures(frames),
            dynamicFeatures: this.analyzeDynamicFeatures(frames),
            variability: this.calculateFeatureVariability(frames),
            keyFrames: this.extractKeyFrames(frames)
        };
        
        return template;
    }

    // Helper methods for feature extraction and comparison
    getFingerStates(landmarks) {
        return {
            thumb: landmarks[4].y < landmarks[3].y,
            index: landmarks[8].y < landmarks[6].y,
            middle: landmarks[12].y < landmarks[10].y,
            ring: landmarks[16].y < landmarks[14].y,
            pinky: landmarks[20].y < landmarks[18].y
        };
    }

    getFingerAngles(landmarks) {
        // Calculate angles between finger segments
        const angles = {};
        const fingerIndices = {
            thumb: [1, 2, 3, 4],
            index: [5, 6, 7, 8],
            middle: [9, 10, 11, 12],
            ring: [13, 14, 15, 16],
            pinky: [17, 18, 19, 20]
        };
        
        for (const [finger, indices] of Object.entries(fingerIndices)) {
            angles[finger] = [];
            for (let i = 0; i < indices.length - 2; i++) {
                const angle = this.calculateAngle(
                    landmarks[indices[i]],
                    landmarks[indices[i + 1]],
                    landmarks[indices[i + 2]]
                );
                angles[finger].push(angle);
            }
        }
        
        return angles;
    }

    calculateAngle(p1, p2, p3) {
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        return Math.acos(dot / (mag1 * mag2));
    }

    calculateVelocity(landmarks, previousLandmarks) {
        const velocity = [];
        for (let i = 0; i < landmarks.length; i++) {
            const vx = landmarks[i].x - previousLandmarks[i].x;
            const vy = landmarks[i].y - previousLandmarks[i].y;
            velocity.push({ x: vx, y: vy, magnitude: Math.sqrt(vx * vx + vy * vy) });
        }
        return velocity;
    }

    calculateGestureStability() {
        if (this.gestureHistory.length < 3) return 0;
        
        // Calculate variance in landmark positions over time
        let totalVariance = 0;
        const recentFrames = this.gestureHistory.slice(-5);
        
        for (let i = 0; i < 21; i++) { // 21 landmarks
            let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
            
            for (const frame of recentFrames) {
                sumX += frame[i].x;
                sumY += frame[i].y;
                sumX2 += frame[i].x * frame[i].x;
                sumY2 += frame[i].y * frame[i].y;
            }
            
            const meanX = sumX / recentFrames.length;
            const meanY = sumY / recentFrames.length;
            const varX = (sumX2 / recentFrames.length) - (meanX * meanX);
            const varY = (sumY2 / recentFrames.length) - (meanY * meanY);
            
            totalVariance += varX + varY;
        }
        
        // Convert variance to stability score (lower variance = higher stability)
        return Math.max(0, 1 - (totalVariance * 100));
    }

    /**
     * Export custom gestures for sharing
     */
    exportCustomGestures() {
        const exportData = {
            version: '1.0',
            timestamp: Date.now(),
            gestures: Object.fromEntries(this.customGestures)
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import custom gestures
     */
    importCustomGestures(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.version && data.gestures) {
                for (const [name, gestureData] of Object.entries(data.gestures)) {
                    this.customGestures.set(name, gestureData);
                }
                return true;
            }
        } catch (error) {
            console.error('Failed to import custom gestures:', error);
        }
        
        return false;
    }

    /**
     * Get recognition statistics
     */
    getStatistics() {
        return {
            builtInGestures: this.gestureDatabase.size,
            customGestures: this.customGestures.size,
            isTraining: this.isTraining,
            currentTrainingGesture: this.currentTrainingGesture,
            trainingProgress: this.isTraining ? this.trainingFrames.length : 0,
            confidenceThreshold: this.confidenceThreshold,
            stabilityThreshold: this.stabilityThreshold
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedGestureRecognition;
} else {
    window.AdvancedGestureRecognition = AdvancedGestureRecognition;
}
