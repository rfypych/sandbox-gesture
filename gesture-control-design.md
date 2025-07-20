# Sandboxels Gesture Control Architecture Design

## Overview
This document outlines the architecture for integrating webcam-based hand gesture control into Sandboxels as an alternative input method alongside existing mouse/keyboard controls.

## Core Architecture

### 1. Input Mode System
- **Dual Mode Operation**: Mouse Mode (default) and Gesture Mode
- **Mode Toggle**: UI button + keyboard shortcut (G key)
- **State Management**: Global `inputMode` variable ("mouse" | "gesture")
- **Seamless Switching**: Both modes can coexist, gesture mode overlays mouse functionality

### 2. Hand Tracking Integration
- **Library**: MediaPipe Hands (@mediapipe/hands)
- **Performance Target**: 30fps minimum, <50ms processing latency
- **Camera Resolution**: 640x480 for optimal performance/accuracy balance
- **Hand Detection**: Single hand tracking (primary hand)

### 3. Gesture Recognition System

#### Core Gestures:
1. **Index Finger Position**: Maps to cursor/pointer position
   - Uses index finger tip landmark (landmark 8)
   - Normalized coordinates mapped to canvas dimensions
   - Smoothing applied to reduce jitter

2. **Pinch Gesture**: Triggers click/tap actions
   - Distance between thumb tip (landmark 4) and index finger tip (landmark 8)
   - Threshold-based detection with hysteresis
   - Maps to mouse1Action (left click equivalent)

#### Optional Gestures:
3. **Open Palm**: Pause/unpause game
   - Detects all fingers extended
   - Uses finger landmark positions relative to palm

4. **Closed Fist**: Clear current selection
   - Detects all fingers closed
   - Triggers selectElement("unknown")

5. **Two-Finger Pinch**: Secondary action (right-click equivalent)
   - Distance between thumb and middle finger
   - Maps to mouse2Action

### 4. Integration Points

#### Existing System Integration:
- **No Core Modifications**: Preserve all existing mouse/keyboard functionality
- **Function Reuse**: Leverage existing mouseAction, mouse1Action, mouse2Action
- **Variable Mapping**: 
  - Gesture position → mousePos
  - Pinch state → mouseIsDown
  - Gesture type → mouseType

#### Event Simulation:
```javascript
// Gesture events simulate mouse events
function simulateMouseAction(gestureType, x, y) {
    if (inputMode !== "gesture") return;
    
    // Update mouse position from gesture
    mousePos = {x: x, y: y};
    
    // Simulate appropriate mouse action
    if (gestureType === "pinch") {
        mouseType = "left";
        mouseIsDown = true;
        mouseAction(null, x, y);
    }
}
```

### 5. Performance Optimization

#### Gesture Smoothing:
- **Moving Average Filter**: Smooth position data over 3-5 frames
- **Velocity-based Smoothing**: Reduce jitter during slow movements
- **Confidence Thresholding**: Only process high-confidence detections

#### Performance Monitoring:
- **FPS Counter**: Track hand tracking performance
- **Latency Measurement**: Monitor processing delays
- **Quality Adjustment**: Dynamic quality settings based on performance

### 6. User Interface Components

#### Camera Status Indicator:
- **Location**: Top-right corner of game canvas
- **States**: Active (green), Inactive (gray), Error (red)
- **Icon**: Camera symbol with status color

#### Gesture Feedback Overlay:
- **Hand Skeleton**: Optional visual overlay showing detected hand
- **Gesture Indicators**: Visual feedback for detected gestures
- **Confidence Meters**: Show detection confidence levels

#### Settings Panel:
- **Sensitivity Sliders**: Adjust gesture detection thresholds
- **Calibration Tools**: Fine-tune gesture recognition
- **Performance Options**: Quality vs. speed trade-offs

### 7. Error Handling & Fallback

#### Camera Access:
- **Permission Handling**: Clear prompts for camera access
- **Fallback Mode**: Graceful degradation to mouse-only mode
- **Error Messages**: User-friendly error reporting

#### Detection Failures:
- **Timeout Handling**: Auto-disable gesture mode if no hand detected
- **Recovery Mechanisms**: Automatic re-initialization attempts
- **Manual Override**: Always allow switching back to mouse mode

### 8. File Organization

#### New Files:
- `gesture-control.js`: Main gesture control system
- `hand-tracking.js`: MediaPipe integration and hand detection
- `gesture-recognition.js`: Gesture detection algorithms
- `gesture-ui.js`: UI components and visual feedback

#### Integration Points:
- `index.html`: Add script includes and UI elements
- Existing mouse event handlers: Add gesture mode checks

### 9. Configuration Options

#### User Settings:
```javascript
gestureSettings = {
    enabled: false,
    sensitivity: 0.7,
    smoothing: 0.3,
    pinchThreshold: 0.05,
    palmThreshold: 0.8,
    showHandSkeleton: false,
    showGestureIndicators: true,
    cameraResolution: "640x480"
}
```

### 10. Testing Strategy

#### Browser Compatibility:
- Chrome (primary target)
- Firefox
- Safari (limited MediaPipe support)
- Edge

#### Performance Testing:
- Various lighting conditions
- Different hand sizes and orientations
- Multi-user scenarios
- Mobile device compatibility

## Implementation Phases

1. **Phase 1**: Basic hand tracking and cursor control
2. **Phase 2**: Pinch gesture for clicking
3. **Phase 3**: UI components and visual feedback
4. **Phase 4**: Advanced gestures and calibration
5. **Phase 5**: Performance optimization and testing

This architecture ensures non-destructive integration while providing a robust gesture control system that enhances the Sandboxels experience.
