/**
 * Gesture Recognition Module for Sandboxels
 * Analyzes hand landmarks to detect specific gestures
 */

class GestureRecognizer {
    constructor() {
        this.smoothingBuffer = [];
        this.smoothingBufferSize = 5;
        this.gestureState = {
            isPinching: false,
            isOpenPalm: false,
            isClosedFist: false,
            isTwoFingerPinch: false,
            cursorPosition: { x: 0, y: 0 },
            confidence: 0
        };
        
        // Gesture thresholds (configurable)
        this.thresholds = {
            pinchDistance: 0.05,        // Distance between thumb and index finger
            pinchHysteresis: 0.02,      // Hysteresis to prevent flickering
            twoFingerPinchDistance: 0.06, // Distance between thumb and middle finger
            palmOpenness: 0.8,          // Threshold for open palm detection
            fistCloseness: 0.3,         // Threshold for closed fist detection
            confidenceMin: 0.7          // Minimum confidence for gesture detection
        };
        
        // MediaPipe hand landmark indices
        this.landmarks = {
            THUMB_TIP: 4,
            THUMB_IP: 3,
            THUMB_MCP: 2,
            INDEX_TIP: 8,
            INDEX_PIP: 6,
            INDEX_MCP: 5,
            MIDDLE_TIP: 12,
            MIDDLE_PIP: 10,
            MIDDLE_MCP: 9,
            RING_TIP: 16,
            RING_PIP: 14,
            RING_MCP: 13,
            PINKY_TIP: 20,
            PINKY_PIP: 18,
            PINKY_MCP: 17,
            WRIST: 0
        };
    }

    /**
     * Process hand landmarks and detect gestures
     */
    processLandmarks(landmarks, canvasWidth, canvasHeight) {
        if (!landmarks || landmarks.length === 0) {
            this.resetGestureState();
            return this.gestureState;
        }

        // Get cursor position from index finger tip
        const indexTip = landmarks[this.landmarks.INDEX_TIP];
        const cursorPos = this.getCursorPosition(indexTip, canvasWidth, canvasHeight);
        
        // Apply smoothing to cursor position
        const smoothedPos = this.applySmoothingToPosition(cursorPos);
        this.gestureState.cursorPosition = smoothedPos;

        // Detect pinch gesture (thumb + index finger)
        this.detectPinchGesture(landmarks);

        // Detect two-finger pinch (thumb + middle finger)
        this.detectTwoFingerPinch(landmarks);

        // Detect open palm gesture
        this.detectOpenPalm(landmarks);

        // Detect closed fist gesture
        this.detectClosedFist(landmarks);

        return this.gestureState;
    }

    /**
     * Convert normalized landmark coordinates to canvas coordinates
     */
    getCursorPosition(landmark, canvasWidth, canvasHeight) {
        // MediaPipe coordinates are normalized (0-1)
        // Flip X coordinate for mirror effect (more intuitive)
        const x = (1 - landmark.x) * canvasWidth;
        const y = landmark.y * canvasHeight;
        
        return { x: Math.round(x), y: Math.round(y) };
    }

    /**
     * Apply smoothing to reduce cursor jitter
     */
    applySmoothingToPosition(newPos) {
        // Add new position to buffer
        this.smoothingBuffer.push(newPos);
        
        // Keep buffer size limited
        if (this.smoothingBuffer.length > this.smoothingBufferSize) {
            this.smoothingBuffer.shift();
        }
        
        // Calculate moving average
        const avgX = this.smoothingBuffer.reduce((sum, pos) => sum + pos.x, 0) / this.smoothingBuffer.length;
        const avgY = this.smoothingBuffer.reduce((sum, pos) => sum + pos.y, 0) / this.smoothingBuffer.length;
        
        return { x: Math.round(avgX), y: Math.round(avgY) };
    }

    /**
     * Detect pinch gesture between thumb and index finger
     */
    detectPinchGesture(landmarks) {
        const thumbTip = landmarks[this.landmarks.THUMB_TIP];
        const indexTip = landmarks[this.landmarks.INDEX_TIP];
        
        const distance = this.calculateDistance(thumbTip, indexTip);
        
        // Apply hysteresis to prevent flickering
        const threshold = this.gestureState.isPinching ? 
            this.thresholds.pinchDistance + this.thresholds.pinchHysteresis :
            this.thresholds.pinchDistance;
        
        this.gestureState.isPinching = distance < threshold;
    }

    /**
     * Detect two-finger pinch between thumb and middle finger
     */
    detectTwoFingerPinch(landmarks) {
        const thumbTip = landmarks[this.landmarks.THUMB_TIP];
        const middleTip = landmarks[this.landmarks.MIDDLE_TIP];
        
        const distance = this.calculateDistance(thumbTip, middleTip);
        
        // Apply hysteresis
        const threshold = this.gestureState.isTwoFingerPinch ? 
            this.thresholds.twoFingerPinchDistance + this.thresholds.pinchHysteresis :
            this.thresholds.twoFingerPinchDistance;
        
        this.gestureState.isTwoFingerPinch = distance < threshold;
    }

    /**
     * Detect open palm gesture
     */
    detectOpenPalm(landmarks) {
        // Check if all fingers are extended
        const fingersExtended = [
            this.isFingerExtended(landmarks, 'thumb'),
            this.isFingerExtended(landmarks, 'index'),
            this.isFingerExtended(landmarks, 'middle'),
            this.isFingerExtended(landmarks, 'ring'),
            this.isFingerExtended(landmarks, 'pinky')
        ];
        
        const extendedCount = fingersExtended.filter(extended => extended).length;
        this.gestureState.isOpenPalm = extendedCount >= 4; // At least 4 fingers extended
    }

    /**
     * Detect closed fist gesture
     */
    detectClosedFist(landmarks) {
        // Check if all fingers are closed
        const fingersExtended = [
            this.isFingerExtended(landmarks, 'index'),
            this.isFingerExtended(landmarks, 'middle'),
            this.isFingerExtended(landmarks, 'ring'),
            this.isFingerExtended(landmarks, 'pinky')
        ];
        
        const extendedCount = fingersExtended.filter(extended => extended).length;
        this.gestureState.isClosedFist = extendedCount === 0; // No fingers extended
    }

    /**
     * Check if a specific finger is extended
     */
    isFingerExtended(landmarks, finger) {
        let tipIndex, pipIndex, mcpIndex;
        
        switch (finger) {
            case 'thumb':
                tipIndex = this.landmarks.THUMB_TIP;
                pipIndex = this.landmarks.THUMB_IP;
                mcpIndex = this.landmarks.THUMB_MCP;
                // For thumb, check if tip is further from wrist than IP joint
                return this.calculateDistance(landmarks[tipIndex], landmarks[this.landmarks.WRIST]) >
                       this.calculateDistance(landmarks[pipIndex], landmarks[this.landmarks.WRIST]);
            
            case 'index':
                tipIndex = this.landmarks.INDEX_TIP;
                pipIndex = this.landmarks.INDEX_PIP;
                mcpIndex = this.landmarks.INDEX_MCP;
                break;
            
            case 'middle':
                tipIndex = this.landmarks.MIDDLE_TIP;
                pipIndex = this.landmarks.MIDDLE_PIP;
                mcpIndex = this.landmarks.MIDDLE_MCP;
                break;
            
            case 'ring':
                tipIndex = this.landmarks.RING_TIP;
                pipIndex = this.landmarks.RING_PIP;
                mcpIndex = this.landmarks.RING_MCP;
                break;
            
            case 'pinky':
                tipIndex = this.landmarks.PINKY_TIP;
                pipIndex = this.landmarks.PINKY_PIP;
                mcpIndex = this.landmarks.PINKY_MCP;
                break;
            
            default:
                return false;
        }
        
        // Check if tip is above PIP joint (finger extended)
        return landmarks[tipIndex].y < landmarks[pipIndex].y;
    }

    /**
     * Calculate Euclidean distance between two landmarks
     */
    calculateDistance(landmark1, landmark2) {
        const dx = landmark1.x - landmark2.x;
        const dy = landmark1.y - landmark2.y;
        const dz = (landmark1.z || 0) - (landmark2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Reset gesture state when no hand is detected
     */
    resetGestureState() {
        this.gestureState = {
            isPinching: false,
            isOpenPalm: false,
            isClosedFist: false,
            isTwoFingerPinch: false,
            cursorPosition: this.gestureState.cursorPosition, // Keep last position
            confidence: 0
        };
        
        // Clear smoothing buffer
        this.smoothingBuffer = [];
    }

    /**
     * Update gesture detection thresholds
     */
    updateThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    /**
     * Get current gesture state
     */
    getGestureState() {
        return { ...this.gestureState };
    }

    /**
     * Get gesture detection thresholds
     */
    getThresholds() {
        return { ...this.thresholds };
    }

    /**
     * Set smoothing buffer size
     */
    setSmoothingBufferSize(size) {
        this.smoothingBufferSize = Math.max(1, Math.min(10, size));
        
        // Trim buffer if necessary
        while (this.smoothingBuffer.length > this.smoothingBufferSize) {
            this.smoothingBuffer.shift();
        }
    }
}

// Export for use in other modules
window.GestureRecognizer = GestureRecognizer;
