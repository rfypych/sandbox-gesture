/**
 * Gesture UI Module for Sandboxels
 * Provides enhanced visual feedback and UI components for gesture control
 */

class GestureUI {
    constructor() {
        this.handSkeletonCanvas = null;
        this.handSkeletonCtx = null;
        this.gestureIndicatorCanvas = null;
        this.gestureIndicatorCtx = null;
        this.isShowingHandSkeleton = false;
        this.isShowingGestureIndicators = true;
        
        // Visual settings
        this.colors = {
            handSkeleton: '#00FF00',
            landmarks: '#FF0000',
            connections: '#00FF00',
            pinchIndicator: '#FFD700',
            cursorIndicator: '#FF4444'
        };
        
        // MediaPipe hand connections for drawing skeleton
        this.handConnections = [
            [0, 1], [1, 2], [2, 3], [3, 4],        // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],        // Index finger
            [0, 9], [9, 10], [10, 11], [11, 12],   // Middle finger
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17]              // Palm connections
        ];
    }

    /**
     * Initialize gesture UI components
     */
    initialize() {
        this.createHandSkeletonCanvas();
        this.createGestureIndicatorCanvas();
        this.addSettingsToUI();
        console.log('Gesture UI initialized');
    }

    /**
     * Create canvas for hand skeleton visualization
     */
    createHandSkeletonCanvas() {
        this.handSkeletonCanvas = document.createElement('canvas');
        this.handSkeletonCanvas.id = 'gesture-hand-skeleton';
        this.handSkeletonCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 200px;
            height: 150px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #333;
            z-index: 999;
            display: none;
            pointer-events: none;
        `;
        this.handSkeletonCanvas.width = 200;
        this.handSkeletonCanvas.height = 150;
        this.handSkeletonCtx = this.handSkeletonCanvas.getContext('2d');
        
        document.body.appendChild(this.handSkeletonCanvas);
    }

    /**
     * Create canvas for gesture indicators
     */
    createGestureIndicatorCanvas() {
        this.gestureIndicatorCanvas = document.createElement('canvas');
        this.gestureIndicatorCanvas.id = 'gesture-indicators';
        this.gestureIndicatorCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 998;
        `;
        
        // Match game canvas size
        const gameCanvas = document.getElementById('game');
        if (gameCanvas) {
            this.gestureIndicatorCanvas.width = gameCanvas.width;
            this.gestureIndicatorCanvas.height = gameCanvas.height;
            this.gestureIndicatorCanvas.style.width = gameCanvas.style.width;
            this.gestureIndicatorCanvas.style.height = gameCanvas.style.height;
        }
        
        this.gestureIndicatorCtx = this.gestureIndicatorCanvas.getContext('2d');
        document.body.appendChild(this.gestureIndicatorCanvas);
    }

    /**
     * Update hand skeleton visualization
     */
    updateHandSkeleton(landmarks) {
        if (!this.isShowingHandSkeleton || !landmarks || !this.handSkeletonCtx) {
            return;
        }

        // Clear canvas
        this.handSkeletonCtx.clearRect(0, 0, this.handSkeletonCanvas.width, this.handSkeletonCanvas.height);

        // Scale landmarks to canvas size
        const scaledLandmarks = landmarks.map(landmark => ({
            x: landmark.x * this.handSkeletonCanvas.width,
            y: landmark.y * this.handSkeletonCanvas.height
        }));

        // Draw connections
        this.handSkeletonCtx.strokeStyle = this.colors.connections;
        this.handSkeletonCtx.lineWidth = 2;
        this.handSkeletonCtx.beginPath();

        for (const connection of this.handConnections) {
            const start = scaledLandmarks[connection[0]];
            const end = scaledLandmarks[connection[1]];
            
            this.handSkeletonCtx.moveTo(start.x, start.y);
            this.handSkeletonCtx.lineTo(end.x, end.y);
        }
        
        this.handSkeletonCtx.stroke();

        // Draw landmarks
        this.handSkeletonCtx.fillStyle = this.colors.landmarks;
        for (const landmark of scaledLandmarks) {
            this.handSkeletonCtx.beginPath();
            this.handSkeletonCtx.arc(landmark.x, landmark.y, 3, 0, 2 * Math.PI);
            this.handSkeletonCtx.fill();
        }
    }

    /**
     * Update gesture indicators on game canvas
     */
    updateGestureIndicators(gestureState, landmarks) {
        if (!this.isShowingGestureIndicators || !this.gestureIndicatorCtx) {
            return;
        }

        // Clear canvas
        this.gestureIndicatorCtx.clearRect(0, 0, this.gestureIndicatorCanvas.width, this.gestureIndicatorCanvas.height);

        // Draw cursor indicator
        this.drawCursorIndicator(gestureState.cursorPosition);

        // Draw pinch indicator
        if (gestureState.isPinching) {
            this.drawPinchIndicator(gestureState.cursorPosition);
        }

        // Draw gesture status
        this.drawGestureStatus(gestureState);
    }

    /**
     * Draw cursor indicator
     */
    drawCursorIndicator(position) {
        const ctx = this.gestureIndicatorCtx;
        const gameCanvas = document.getElementById('game');
        if (!gameCanvas) return;

        // Convert game coordinates to canvas coordinates
        const pixelSize = parseInt(gameCanvas.style.width) / width;
        const canvasX = position.x * pixelSize;
        const canvasY = position.y * pixelSize;

        // Draw crosshair cursor
        ctx.strokeStyle = this.colors.cursorIndicator;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Horizontal line
        ctx.moveTo(canvasX - 10, canvasY);
        ctx.lineTo(canvasX + 10, canvasY);
        
        // Vertical line
        ctx.moveTo(canvasX, canvasY - 10);
        ctx.lineTo(canvasX, canvasY + 10);
        
        ctx.stroke();

        // Draw center dot
        ctx.fillStyle = this.colors.cursorIndicator;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Draw pinch indicator
     */
    drawPinchIndicator(position) {
        const ctx = this.gestureIndicatorCtx;
        const gameCanvas = document.getElementById('game');
        if (!gameCanvas) return;

        const pixelSize = parseInt(gameCanvas.style.width) / width;
        const canvasX = position.x * pixelSize;
        const canvasY = position.y * pixelSize;

        // Draw pulsing circle for pinch
        const time = Date.now() / 200;
        const radius = 15 + Math.sin(time) * 5;
        
        ctx.strokeStyle = this.colors.pinchIndicator;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    /**
     * Draw gesture status text
     */
    drawGestureStatus(gestureState) {
        const ctx = this.gestureIndicatorCtx;
        
        // Status text
        const statusText = [];
        if (gestureState.isPinching) statusText.push('PINCH');
        if (gestureState.isTwoFingerPinch) statusText.push('TWO-FINGER');
        if (gestureState.isOpenPalm) statusText.push('OPEN PALM');
        if (gestureState.isClosedFist) statusText.push('CLOSED FIST');
        
        if (statusText.length > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 10, 200, 30);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px Arial';
            ctx.fillText(statusText.join(' | '), 15, 30);
        }
    }

    /**
     * Show hand skeleton visualization
     */
    showHandSkeleton() {
        this.isShowingHandSkeleton = true;
        if (this.handSkeletonCanvas) {
            this.handSkeletonCanvas.style.display = 'block';
        }
    }

    /**
     * Hide hand skeleton visualization
     */
    hideHandSkeleton() {
        this.isShowingHandSkeleton = false;
        if (this.handSkeletonCanvas) {
            this.handSkeletonCanvas.style.display = 'none';
        }
    }

    /**
     * Show gesture indicators
     */
    showGestureIndicators() {
        this.isShowingGestureIndicators = true;
        if (this.gestureIndicatorCanvas) {
            this.gestureIndicatorCanvas.style.display = 'block';
        }
    }

    /**
     * Hide gesture indicators
     */
    hideGestureIndicators() {
        this.isShowingGestureIndicators = false;
        if (this.gestureIndicatorCanvas) {
            this.gestureIndicatorCanvas.style.display = 'none';
            // Clear the canvas
            this.gestureIndicatorCtx.clearRect(0, 0, this.gestureIndicatorCanvas.width, this.gestureIndicatorCanvas.height);
        }
    }

    /**
     * Add gesture settings to the main settings UI
     */
    addSettingsToUI() {
        // This would integrate with the existing settings system
        // For now, we'll add a simple toggle in the gesture overlay
        const settingsHTML = `
            <div style="margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;">
                <label><input type="checkbox" id="gesture-show-skeleton" onchange="gestureUI.toggleHandSkeleton(this.checked)"> Hand Skeleton</label><br>
                <label><input type="checkbox" id="gesture-show-indicators" checked onchange="gestureUI.toggleGestureIndicators(this.checked)"> Gesture Indicators</label>
            </div>
        `;
        
        // Add to gesture overlay if it exists
        setTimeout(() => {
            const overlay = document.getElementById('gesture-overlay');
            if (overlay) {
                overlay.insertAdjacentHTML('beforeend', settingsHTML);
            }
        }, 1000);
    }

    /**
     * Toggle hand skeleton display
     */
    toggleHandSkeleton(show) {
        if (show) {
            this.showHandSkeleton();
        } else {
            this.hideHandSkeleton();
        }
    }

    /**
     * Toggle gesture indicators display
     */
    toggleGestureIndicators(show) {
        if (show) {
            this.showGestureIndicators();
        } else {
            this.hideGestureIndicators();
        }
    }

    /**
     * Update canvas sizes when game canvas changes
     */
    updateCanvasSizes() {
        const gameCanvas = document.getElementById('game');
        if (gameCanvas && this.gestureIndicatorCanvas) {
            this.gestureIndicatorCanvas.width = gameCanvas.width;
            this.gestureIndicatorCanvas.height = gameCanvas.height;
            this.gestureIndicatorCanvas.style.width = gameCanvas.style.width;
            this.gestureIndicatorCanvas.style.height = gameCanvas.style.height;
        }
    }

    /**
     * Cleanup UI elements
     */
    destroy() {
        if (this.handSkeletonCanvas) {
            this.handSkeletonCanvas.remove();
        }
        
        if (this.gestureIndicatorCanvas) {
            this.gestureIndicatorCanvas.remove();
        }
    }
}

// Create global instance
window.gestureUI = new GestureUI();
