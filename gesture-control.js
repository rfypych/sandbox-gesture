/**
 * Sandboxels Gesture Control System
 * Menggunakan MediaPipe Hands untuk deteksi gesture real-time
 * Author: Enhanced by AI Assistant
 * Version: 1.0.0
 */

class GestureController {
    constructor() {
        this.isEnabled = false;
        this.isInitialized = false;
        this.camera = null;
        this.hands = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        
        // Gesture state tracking
        this.currentGesture = null;
        this.gestureConfidence = 0;
        this.gestureHistory = [];
        this.smoothingFrames = 5;
        
        // Game integration
        this.lastMousePosition = { x: 0, y: 0 };
        this.isDrawing = false;
        this.gestureCallbacks = {};
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = Date.now();
        this.currentFPS = 0;
        
        this.initializeGestureCallbacks();
    }

    /**
     * Initialize MediaPipe Hands
     */
    async initialize() {
        try {
            // Check if MediaPipe is available
            if (typeof Hands === 'undefined') {
                throw new Error('MediaPipe Hands library not loaded');
            }

            // Setup video element for camera feed
            this.videoElement = document.createElement('video');
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            // Setup canvas for hand landmarks visualization (optional)
            this.canvasElement = document.createElement('canvas');
            this.canvasElement.id = 'gesture-overlay';
            this.canvasElement.style.position = 'absolute';
            this.canvasElement.style.top = '0';
            this.canvasElement.style.left = '0';
            this.canvasElement.style.pointerEvents = 'none';
            this.canvasElement.style.zIndex = '1000';
            this.canvasElement.style.display = 'none';
            document.body.appendChild(this.canvasElement);
            
            this.canvasCtx = this.canvasElement.getContext('2d');

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.8,
                minTrackingConfidence: 0.8,
                staticImageMode: false,
                selfieMode: true
            });

            this.hands.onResults(this.onResults.bind(this));

            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.isEnabled) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            this.isInitialized = true;
            console.log('Gesture Control initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Gesture Control:', error);
            throw error;
        }
    }

    /**
     * Start gesture recognition
     */
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            await this.camera.start();
            this.isEnabled = true;
            this.showGestureOverlay(true);
            console.log('Gesture Control started');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('gestureControlStarted'));
            
        } catch (error) {
            console.error('Failed to start Gesture Control:', error);
            throw error;
        }
    }

    /**
     * Stop gesture recognition
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        this.isEnabled = false;
        this.showGestureOverlay(false);
        console.log('Gesture Control stopped');
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('gestureControlStopped'));
    }

    /**
     * Toggle gesture control on/off
     */
    toggle() {
        if (this.isEnabled) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Show/hide gesture overlay canvas
     */
    showGestureOverlay(show) {
        if (this.canvasElement) {
            this.canvasElement.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Process MediaPipe results
     */
    onResults(results) {
        if (!this.isEnabled) return;

        // Update canvas size to match game canvas
        const gameCanvas = document.getElementById('gameCanvas') || document.querySelector('canvas');
        if (gameCanvas && this.canvasElement) {
            const rect = gameCanvas.getBoundingClientRect();
            this.canvasElement.width = rect.width;
            this.canvasElement.height = rect.height;
            this.canvasElement.style.width = rect.width + 'px';
            this.canvasElement.style.height = rect.height + 'px';
            this.canvasElement.style.left = rect.left + 'px';
            this.canvasElement.style.top = rect.top + 'px';
        }

        // Clear canvas
        if (this.canvasCtx) {
            this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }

        // Process hand landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];
                
                // Draw hand landmarks (optional visualization)
                this.drawHandLandmarks(landmarks);
                
                // Recognize gesture
                const gesture = this.recognizeGesture(landmarks, handedness);
                if (gesture) {
                    this.processGesture(gesture, landmarks);
                }
            }
        }

        // Update FPS counter
        this.updateFPS();
    }

    /**
     * Draw hand landmarks on overlay canvas
     */
    drawHandLandmarks(landmarks) {
        if (!this.canvasCtx) return;

        this.canvasCtx.fillStyle = '#00FF00';
        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 2;

        // Draw landmarks
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvasElement.width;
            const y = landmark.y * this.canvasElement.height;
            
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        }

        // Draw connections (simplified)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        ];

        this.canvasCtx.beginPath();
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.canvasCtx.moveTo(
                startPoint.x * this.canvasElement.width,
                startPoint.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                endPoint.x * this.canvasElement.width,
                endPoint.y * this.canvasElement.height
            );
        }
        this.canvasCtx.stroke();
    }

    /**
     * Recognize gesture from hand landmarks
     */
    recognizeGesture(landmarks, handedness) {
        if (!landmarks || landmarks.length < 21) {
            return {
                type: 'unknown',
                confidence: 0,
                landmarks: landmarks,
                handedness: handedness ? handedness.label : 'Unknown',
                position: { x: 0, y: 0 }
            };
        }

        // Implement gesture recognition logic with debug
        const gesture = this.classifyHandGesture(landmarks);

        // Debug logging for gesture detection
        if (typeof window !== 'undefined' && window.gestureDebugger && window.gestureDebugger.isDebugMode) {
            console.log(`Raw gesture detected: ${gesture}`);
        }

        // Add to history for smoothing
        this.gestureHistory.push(gesture);
        if (this.gestureHistory.length > this.smoothingFrames) {
            this.gestureHistory.shift();
        }

        // Get most common gesture in recent history
        const smoothedGesture = this.getMostCommonGesture();
        const confidence = this.calculateGestureConfidence();

        // Debug logging for final result
        if (typeof window !== 'undefined' && window.gestureDebugger && window.gestureDebugger.isDebugMode) {
            console.log(`Final gesture: ${smoothedGesture}, Confidence: ${confidence.toFixed(2)}`);
        }

        return {
            type: smoothedGesture,
            confidence: confidence,
            landmarks: landmarks,
            handedness: handedness ? handedness.label : 'Unknown',
            position: this.getHandPosition(landmarks)
        };
    }

    /**
     * Classify hand gesture based on landmarks with improved accuracy
     */
    classifyHandGesture(landmarks) {
        // Get finger states with improved detection
        const fingers = this.getFingerStates(landmarks);
        const angles = this.getFingerAngles(landmarks);
        const distances = this.getFingerDistances(landmarks);

        // Debug finger states
        if (typeof window !== 'undefined' && window.gestureDebugger && window.gestureDebugger.isDebugMode) {
            console.log('Finger states:', fingers);
        }

        // Simple gesture detection first (lower thresholds for better detection)
        const simpleGesture = this.detectSimpleGestures(fingers, landmarks);
        if (simpleGesture !== 'unknown') {
            return simpleGesture;
        }

        // Enhanced pinch detection (lower threshold)
        const pinchData = this.getAdvancedPinchData(landmarks);
        if (pinchData.isPinching && pinchData.confidence > 0.6) {
            return 'pinch';
        }

        // Enhanced gesture classification with multiple criteria (lower thresholds)
        const gestureScores = {
            'thumbs_up': this.calculateThumbsUpScore(fingers, angles, landmarks),
            'point': this.calculatePointScore(fingers, angles, landmarks),
            'peace': this.calculatePeaceScore(fingers, angles, landmarks),
            'open_palm': this.calculateOpenPalmScore(fingers, angles, landmarks),
            'fist': this.calculateFistScore(fingers, angles, landmarks)
        };

        // Debug gesture scores
        if (typeof window !== 'undefined' && window.gestureDebugger && window.gestureDebugger.isDebugMode) {
            console.log('Gesture scores:', gestureScores);
        }

        // Find gesture with highest confidence score (lower threshold)
        let bestGesture = 'unknown';
        let bestScore = 0.4; // Lowered minimum confidence threshold

        for (const [gesture, score] of Object.entries(gestureScores)) {
            if (score > bestScore) {
                bestGesture = gesture;
                bestScore = score;
            }
        }

        return bestGesture;
    }

    /**
     * Detect simple gestures with basic finger counting
     */
    detectSimpleGestures(fingers, landmarks) {
        // Count extended fingers
        const extendedFingers = Object.values(fingers).filter(Boolean).length;

        // Simple gesture patterns
        if (extendedFingers === 0) {
            return 'fist';
        } else if (extendedFingers === 5) {
            return 'open_palm';
        } else if (extendedFingers === 1) {
            if (fingers.thumb) return 'thumbs_up';
            if (fingers.index) return 'point';
        } else if (extendedFingers === 2) {
            if (fingers.index && fingers.middle && !fingers.thumb && !fingers.ring && !fingers.pinky) {
                return 'peace';
            }
        }

        // Check for pinch with simple distance
        if (this.isSimplePinch(landmarks)) {
            return 'pinch';
        }

        return 'unknown';
    }

    /**
     * Simple pinch detection
     */
    isSimplePinch(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        return distance < 0.06; // Increased threshold for easier detection
    }

    /**
     * Calculate thumbs up gesture score
     */
    calculateThumbsUpScore(fingers, angles, landmarks) {
        let score = 0;

        // Thumb must be extended upward
        if (fingers.thumb && landmarks[4].y < landmarks[3].y) score += 0.3;

        // Other fingers should be folded
        if (!fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) score += 0.4;

        // Check thumb angle (should point upward)
        const thumbAngle = this.calculateThumbAngle(landmarks);
        if (thumbAngle > -45 && thumbAngle < 45) score += 0.3;

        return score;
    }

    /**
     * Calculate pointing gesture score
     */
    calculatePointScore(fingers, angles, landmarks) {
        let score = 0;

        // Index finger must be extended
        if (fingers.index) score += 0.3;

        // Other fingers should be folded (except thumb can be either)
        if (!fingers.middle && !fingers.ring && !fingers.pinky) score += 0.3;

        // Index finger should be straight
        const indexStraightness = this.calculateFingerStraightness(landmarks, [5, 6, 7, 8]);
        score += indexStraightness * 0.2;

        // Hand orientation should be forward-pointing
        const handOrientation = this.getHandOrientation(landmarks);
        if (handOrientation.isPointingForward) score += 0.2;

        return score;
    }

    /**
     * Calculate peace sign score
     */
    calculatePeaceScore(fingers, angles, landmarks) {
        let score = 0;

        // Index and middle fingers must be extended
        if (fingers.index && fingers.middle) score += 0.4;

        // Ring and pinky should be folded
        if (!fingers.ring && !fingers.pinky) score += 0.3;

        // Check V-shape angle between index and middle
        const vAngle = this.calculateVAngle(landmarks);
        if (vAngle > 20 && vAngle < 60) score += 0.3;

        return score;
    }

    /**
     * Calculate open palm score
     */
    calculateOpenPalmScore(fingers, angles, landmarks) {
        let score = 0;

        // All fingers should be extended
        const extendedCount = Object.values(fingers).filter(Boolean).length;
        score += (extendedCount / 5) * 0.5;

        // Fingers should be spread apart
        const spreadScore = this.calculateFingerSpread(landmarks);
        score += spreadScore * 0.3;

        // Palm should be facing forward
        const palmDirection = this.getPalmDirection(landmarks);
        if (palmDirection.isFacingForward) score += 0.2;

        return score;
    }

    /**
     * Calculate fist score
     */
    calculateFistScore(fingers, angles, landmarks) {
        let score = 0;

        // All fingers should be folded
        const foldedCount = Object.values(fingers).filter(f => !f).length;
        score += (foldedCount / 5) * 0.6;

        // Hand should be compact
        const compactness = this.calculateHandCompactness(landmarks);
        score += compactness * 0.4;

        return score;
    }

    /**
     * Get advanced pinch detection data
     */
    getAdvancedPinchData(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const thumbIP = landmarks[3];
        const indexPIP = landmarks[6];

        // Calculate tip distance
        const tipDistance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // Calculate joint distance for context
        const jointDistance = Math.sqrt(
            Math.pow(thumbIP.x - indexPIP.x, 2) +
            Math.pow(thumbIP.y - indexPIP.y, 2)
        );

        // Pinch ratio (tips closer than joints indicates pinch)
        const pinchRatio = tipDistance / (jointDistance + 0.001);

        // Check if other fingers are not interfering
        const middleTip = landmarks[12];
        const middleDistance = Math.sqrt(
            Math.pow(thumbTip.x - middleTip.x, 2) +
            Math.pow(thumbTip.y - middleTip.y, 2)
        );

        const isPinching = tipDistance < 0.04 && pinchRatio < 0.6 && middleDistance > tipDistance * 1.5;
        const confidence = isPinching ? Math.max(0, 1 - (tipDistance / 0.04)) : 0;

        return {
            isPinching,
            confidence,
            distance: tipDistance,
            ratio: pinchRatio
        };
    }

    /**
     * Get finger extension states with improved accuracy
     */
    getFingerStates(landmarks) {
        // Use both advanced and simple detection methods
        const advancedStates = {
            thumb: this.isThumbExtended(landmarks),
            index: this.isFingerExtended(landmarks, [5, 6, 7, 8]),
            middle: this.isFingerExtended(landmarks, [9, 10, 11, 12]),
            ring: this.isFingerExtended(landmarks, [13, 14, 15, 16]),
            pinky: this.isFingerExtended(landmarks, [17, 18, 19, 20])
        };

        // Fallback to simple Y-coordinate comparison if advanced method fails
        const simpleStates = {
            thumb: landmarks[4].y < landmarks[3].y,
            index: landmarks[8].y < landmarks[6].y,
            middle: landmarks[12].y < landmarks[10].y,
            ring: landmarks[16].y < landmarks[14].y,
            pinky: landmarks[20].y < landmarks[18].y
        };

        // Use advanced states, but fallback to simple if all fingers appear folded
        const advancedCount = Object.values(advancedStates).filter(Boolean).length;
        const simpleCount = Object.values(simpleStates).filter(Boolean).length;

        // If advanced detection shows no fingers extended but simple shows some, use simple
        if (advancedCount === 0 && simpleCount > 0) {
            return simpleStates;
        }

        return advancedStates;
    }

    /**
     * Check if thumb is extended (special case due to thumb anatomy)
     */
    isThumbExtended(landmarks) {
        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3];
        const thumbMCP = landmarks[2];
        const wrist = landmarks[0];

        // Calculate thumb extension based on distance from palm
        const palmCenter = this.getPalmCenter(landmarks);
        const thumbDistance = Math.sqrt(
            Math.pow(thumbTip.x - palmCenter.x, 2) +
            Math.pow(thumbTip.y - palmCenter.y, 2)
        );

        // Compare with folded position
        const foldedDistance = Math.sqrt(
            Math.pow(thumbMCP.x - palmCenter.x, 2) +
            Math.pow(thumbMCP.y - palmCenter.y, 2)
        );

        return thumbDistance > foldedDistance * 1.3;
    }

    /**
     * Check if finger is extended based on joint positions
     */
    isFingerExtended(landmarks, jointIndices) {
        const [mcp, pip, dip, tip] = jointIndices.map(i => landmarks[i]);

        // Calculate distances between consecutive joints
        const mcpToPip = this.calculateDistance(mcp, pip);
        const pipToDip = this.calculateDistance(pip, dip);
        const dipToTip = this.calculateDistance(dip, tip);

        // Calculate total finger length
        const totalLength = mcpToPip + pipToDip + dipToTip;

        // Calculate straight-line distance from MCP to tip
        const straightDistance = this.calculateDistance(mcp, tip);

        // Finger is extended if straight distance is close to total length
        const extensionRatio = straightDistance / totalLength;
        return extensionRatio > 0.8;
    }

    /**
     * Calculate distance between two points
     */
    calculateDistance(point1, point2) {
        return Math.sqrt(
            Math.pow(point1.x - point2.x, 2) +
            Math.pow(point1.y - point2.y, 2)
        );
    }

    /**
     * Get palm center point
     */
    getPalmCenter(landmarks) {
        const wrist = landmarks[0];
        const indexMCP = landmarks[5];
        const pinkyMCP = landmarks[17];

        return {
            x: (wrist.x + indexMCP.x + pinkyMCP.x) / 3,
            y: (wrist.y + indexMCP.y + pinkyMCP.y) / 3
        };
    }

    /**
     * Calculate thumb angle relative to hand
     */
    calculateThumbAngle(landmarks) {
        const thumbTip = landmarks[4];
        const thumbMCP = landmarks[2];
        const wrist = landmarks[0];

        // Vector from wrist to thumb MCP
        const baseVector = {
            x: thumbMCP.x - wrist.x,
            y: thumbMCP.y - wrist.y
        };

        // Vector from thumb MCP to tip
        const thumbVector = {
            x: thumbTip.x - thumbMCP.x,
            y: thumbTip.y - thumbMCP.y
        };

        // Calculate angle between vectors
        const dot = baseVector.x * thumbVector.x + baseVector.y * thumbVector.y;
        const mag1 = Math.sqrt(baseVector.x * baseVector.x + baseVector.y * baseVector.y);
        const mag2 = Math.sqrt(thumbVector.x * thumbVector.x + thumbVector.y * thumbVector.y);

        const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
        return angle;
    }

    /**
     * Calculate finger straightness (0 = bent, 1 = straight)
     */
    calculateFingerStraightness(landmarks, jointIndices) {
        const [mcp, pip, dip, tip] = jointIndices.map(i => landmarks[i]);

        // Calculate total joint distance
        const totalDistance = this.calculateDistance(mcp, pip) +
                             this.calculateDistance(pip, dip) +
                             this.calculateDistance(dip, tip);

        // Calculate straight-line distance
        const straightDistance = this.calculateDistance(mcp, tip);

        // Return straightness ratio
        return straightDistance / totalDistance;
    }

    /**
     * Get hand orientation information
     */
    getHandOrientation(landmarks) {
        const wrist = landmarks[0];
        const middleMCP = landmarks[9];
        const indexTip = landmarks[8];

        // Calculate hand direction vector
        const handVector = {
            x: middleMCP.x - wrist.x,
            y: middleMCP.y - wrist.y
        };

        // Calculate pointing direction
        const pointVector = {
            x: indexTip.x - landmarks[5].x,
            y: indexTip.y - landmarks[5].y
        };

        // Determine if pointing forward (away from wrist)
        const dot = handVector.x * pointVector.x + handVector.y * pointVector.y;
        const isPointingForward = dot > 0;

        return {
            isPointingForward,
            handAngle: Math.atan2(handVector.y, handVector.x) * (180 / Math.PI)
        };
    }

    /**
     * Calculate V-angle between index and middle fingers
     */
    calculateVAngle(landmarks) {
        const indexTip = landmarks[8];
        const indexMCP = landmarks[5];
        const middleTip = landmarks[12];
        const middleMCP = landmarks[9];

        // Vectors for each finger
        const indexVector = {
            x: indexTip.x - indexMCP.x,
            y: indexTip.y - indexMCP.y
        };

        const middleVector = {
            x: middleTip.x - middleMCP.x,
            y: middleTip.y - middleMCP.y
        };

        // Calculate angle between vectors
        const dot = indexVector.x * middleVector.x + indexVector.y * middleVector.y;
        const mag1 = Math.sqrt(indexVector.x * indexVector.x + indexVector.y * indexVector.y);
        const mag2 = Math.sqrt(middleVector.x * middleVector.x + middleVector.y * middleVector.y);

        const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
        return angle;
    }

    /**
     * Calculate finger spread (how far apart fingers are)
     */
    calculateFingerSpread(landmarks) {
        const fingerTips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
        let totalSpread = 0;
        let pairCount = 0;

        // Calculate average distance between adjacent finger tips
        for (let i = 0; i < fingerTips.length - 1; i++) {
            const distance = this.calculateDistance(fingerTips[i], fingerTips[i + 1]);
            totalSpread += distance;
            pairCount++;
        }

        const averageSpread = totalSpread / pairCount;

        // Normalize spread (typical spread range is 0.05 to 0.15)
        return Math.min(1, Math.max(0, (averageSpread - 0.05) / 0.1));
    }

    /**
     * Get palm direction information
     */
    getPalmDirection(landmarks) {
        const wrist = landmarks[0];
        const indexMCP = landmarks[5];
        const pinkyMCP = landmarks[17];

        // Calculate palm normal vector using cross product
        const v1 = {
            x: indexMCP.x - wrist.x,
            y: indexMCP.y - wrist.y,
            z: indexMCP.z - wrist.z || 0
        };

        const v2 = {
            x: pinkyMCP.x - wrist.x,
            y: pinkyMCP.y - wrist.y,
            z: pinkyMCP.z - wrist.z || 0
        };

        // Cross product to get normal
        const normal = {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };

        // Check if palm is facing forward (positive z direction)
        const isFacingForward = normal.z > 0;

        return {
            isFacingForward,
            normal
        };
    }

    /**
     * Calculate hand compactness (for fist detection)
     */
    calculateHandCompactness(landmarks) {
        const palmCenter = this.getPalmCenter(landmarks);
        const fingerTips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

        let totalDistance = 0;
        for (const tip of fingerTips) {
            totalDistance += this.calculateDistance(palmCenter, tip);
        }

        const averageDistance = totalDistance / fingerTips.length;

        // Normalize compactness (typical range 0.05 to 0.2)
        return Math.max(0, 1 - ((averageDistance - 0.05) / 0.15));
    }

    /**
     * Check if current gesture is a pinch
     */
    isPinchGesture(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        return distance < 0.05; // Threshold for pinch detection
    }

    /**
     * Get hand center position
     */
    getHandPosition(landmarks) {
        const wrist = landmarks[0];
        return {
            x: wrist.x * this.canvasElement.width,
            y: wrist.y * this.canvasElement.height
        };
    }

    /**
     * Get most common gesture from history
     */
    getMostCommonGesture() {
        const counts = {};
        for (const gesture of this.gestureHistory) {
            counts[gesture] = (counts[gesture] || 0) + 1;
        }
        
        let maxCount = 0;
        let mostCommon = 'unknown';
        for (const [gesture, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = gesture;
            }
        }
        
        return mostCommon;
    }

    /**
     * Calculate gesture confidence
     */
    calculateGestureConfidence() {
        if (this.gestureHistory.length === 0) return 0;

        const mostCommon = this.getMostCommonGesture();
        const count = this.gestureHistory.filter(g => g === mostCommon).length;
        const confidence = count / this.gestureHistory.length;

        // Boost confidence for simple gestures that are clearly detected
        if (mostCommon !== 'unknown' && confidence > 0.3) {
            return Math.min(1.0, confidence + 0.2);
        }

        return confidence;
    }

    /**
     * Process recognized gesture
     */
    processGesture(gesture, landmarks) {
        if (gesture.confidence < 0.6) return; // Confidence threshold

        // Update current gesture
        this.currentGesture = gesture;
        
        // Execute gesture callback
        if (this.gestureCallbacks[gesture.type]) {
            this.gestureCallbacks[gesture.type](gesture);
        }

        // Update mouse position for drawing
        this.updateMousePosition(gesture.position);
    }

    /**
     * Initialize gesture callbacks for Sandboxels integration
     */
    initializeGestureCallbacks() {
        this.gestureCallbacks = {
            'point': (gesture) => this.handleDrawGesture(gesture),
            'peace': (gesture) => this.handleEraseGesture(gesture),
            'pinch': (gesture) => this.handleSelectGesture(gesture),
            'open_palm': (gesture) => this.handlePauseGesture(gesture),
            'fist': (gesture) => this.handleResetGesture(gesture),
            'thumbs_up': (gesture) => this.handleBrushSizeUp(gesture),
            'thumbs_down': (gesture) => this.handleBrushSizeDown(gesture)
        };
    }

    /**
     * Handle drawing gesture
     */
    handleDrawGesture(gesture) {
        // Simulate mouse down and move for drawing
        this.simulateMouseEvent('mousedown', gesture.position);
        this.isDrawing = true;
    }

    /**
     * Handle erase gesture
     */
    handleEraseGesture(gesture) {
        // Switch to erase mode and simulate right click
        this.simulateMouseEvent('contextmenu', gesture.position);
    }

    /**
     * Handle element selection gesture
     */
    handleSelectGesture(gesture) {
        // Simulate middle click for element picking
        this.simulateMouseEvent('mousedown', gesture.position, 1); // Middle button
    }

    /**
     * Handle pause gesture
     */
    handlePauseGesture(gesture) {
        // Trigger pause/play toggle
        if (typeof togglePause === 'function') {
            togglePause();
        }
    }

    /**
     * Handle reset gesture
     */
    handleResetGesture(gesture) {
        // Trigger reset function
        if (typeof resetPrompt === 'function') {
            resetPrompt();
        }
    }

    /**
     * Handle brush size increase
     */
    handleBrushSizeUp(gesture) {
        if (typeof mouseSize !== 'undefined') {
            mouseSize += 2;
            if (typeof checkMouseSize === 'function') {
                checkMouseSize(true);
            }
        }
    }

    /**
     * Handle brush size decrease
     */
    handleBrushSizeDown(gesture) {
        if (typeof mouseSize !== 'undefined') {
            mouseSize = Math.max(1, mouseSize - 2);
            if (typeof checkMouseSize === 'function') {
                checkMouseSize(true);
            }
        }
    }

    /**
     * Update mouse position for game integration
     */
    updateMousePosition(position) {
        this.lastMousePosition = position;
        
        // Update global mouse coordinates if they exist
        if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
            mouseX = position.x;
            mouseY = position.y;
        }
    }

    /**
     * Simulate mouse events for game integration
     */
    simulateMouseEvent(type, position, button = 0) {
        const gameCanvas = document.getElementById('gameCanvas') || document.querySelector('canvas');
        if (!gameCanvas) return;

        const event = new MouseEvent(type, {
            clientX: position.x,
            clientY: position.y,
            button: button,
            buttons: button === 0 ? 1 : (button === 1 ? 4 : 2),
            bubbles: true,
            cancelable: true
        });

        gameCanvas.dispatchEvent(event);
    }

    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isInitialized: this.isInitialized,
            currentGesture: this.currentGesture,
            fps: this.currentFPS,
            confidence: this.gestureConfidence
        };
    }
}

// Global instance
window.gestureController = new GestureController();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureController;
}
