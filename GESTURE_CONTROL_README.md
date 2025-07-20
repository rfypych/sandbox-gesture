# Sandboxels Gesture Control

This document provides comprehensive information about the webcam-based hand gesture control system integrated into Sandboxels.

## Overview

The gesture control system allows you to interact with Sandboxels using hand gestures detected through your webcam, providing an alternative input method alongside traditional mouse and keyboard controls.

## Features

- **Real-time hand tracking** using MediaPipe Hands
- **Index finger cursor control** for precise positioning
- **Pinch gestures** for clicking and placing elements
- **Advanced gestures** for game control (pause, clear selection)
- **Visual feedback** with gesture indicators and hand skeleton display
- **Customizable settings** for sensitivity and smoothing
- **Non-destructive integration** - all existing controls remain functional

## Setup Instructions

### 1. Camera Permissions

1. **Enable camera access** when prompted by your browser
2. If you denied access previously:
   - **Chrome**: Click the camera icon in the address bar → Allow
   - **Firefox**: Click the shield icon → Permissions → Camera → Allow
   - **Safari**: Safari menu → Preferences → Websites → Camera → Allow

### 2. Browser Compatibility

**Fully Supported:**
- Chrome 88+ (recommended)
- Edge 88+

**Partially Supported:**
- Firefox 85+ (may have performance limitations)

**Not Supported:**
- Safari (MediaPipe limitations)
- Internet Explorer

### 3. Hardware Requirements

- **Webcam**: Any USB or built-in camera
- **Lighting**: Good lighting conditions for optimal hand detection
- **Performance**: Modern computer (2015+) for smooth 30fps tracking

## How to Use

### Enabling Gesture Control

1. **Click the gesture button** (👋) in the toolbar, or
2. **Press the 'G' key** to toggle gesture mode, or
3. **Use Settings**: Settings → Gesture Control → Enable

### Basic Gestures

#### Index Finger Cursor
- **Point with your index finger** to control the cursor position
- The cursor follows your fingertip movement
- Works across the entire game canvas

#### Pinch to Click
- **Bring thumb and index finger together** to simulate left-click
- Use for placing elements, using tools, and interacting with UI
- Visual indicator shows when pinch is detected

#### Two-Finger Pinch (Optional)
- **Bring thumb and middle finger together** for right-click equivalent
- Use for erasing elements

#### Advanced Gestures (Optional)
- **Open Palm**: Pause/unpause the simulation
- **Closed Fist**: Clear current element selection

### Visual Feedback

#### Status Indicator
- **Green circle**: Gesture control active
- **Gray circle**: Gesture control disabled
- **Red circle**: Error (camera access denied, etc.)

#### Gesture Overlay
- Shows real-time gesture detection status
- Displays FPS and hand detection confidence
- Can be toggled in settings

#### Hand Skeleton (Optional)
- Visual overlay showing detected hand landmarks
- Useful for debugging and calibration
- Enable in Settings → Gesture Control

## Settings and Calibration

### Accessing Settings
Settings → Gesture Control section

### Available Settings

#### Gesture Sensitivity (0.1 - 1.0)
- **Lower values**: Require closer finger proximity for pinch detection
- **Higher values**: More sensitive, may trigger false positives
- **Default**: 0.7

#### Gesture Smoothing (0.1 - 1.0)
- **Lower values**: More responsive but jittery cursor movement
- **Higher values**: Smoother but less responsive cursor
- **Default**: 0.3

#### Visual Options
- **Show Hand Skeleton**: Display hand landmark visualization
- **Show Gesture Indicators**: Display gesture status and cursor indicators

## Troubleshooting

### Common Issues

#### "Camera access denied"
**Solution**: 
1. Refresh the page
2. Allow camera permissions when prompted
3. Check browser settings for camera permissions

#### "No camera found"
**Solution**:
1. Ensure camera is connected and working
2. Close other applications using the camera
3. Try a different browser

#### "Hand not detected"
**Solutions**:
1. **Improve lighting** - face a light source
2. **Position hand properly** - 1-2 feet from camera
3. **Clean camera lens**
4. **Adjust sensitivity** in settings

#### Poor performance/lag
**Solutions**:
1. **Close other browser tabs**
2. **Reduce gesture smoothing** in settings
3. **Disable hand skeleton display**
4. **Use Chrome browser** for best performance

#### Gestures not working properly
**Solutions**:
1. **Calibrate sensitivity** in settings
2. **Ensure good lighting conditions**
3. **Keep hand within camera view**
4. **Make clear, deliberate gestures**

### Performance Optimization

#### For Better Performance:
- Use Chrome browser
- Close unnecessary browser tabs
- Disable hand skeleton visualization
- Reduce gesture smoothing
- Ensure good lighting (reduces processing load)

#### For Better Accuracy:
- Increase gesture sensitivity
- Use consistent lighting
- Keep hand 1-2 feet from camera
- Make deliberate, clear gestures

## Technical Details

### Architecture
- **Hand Tracking**: MediaPipe Hands library
- **Gesture Recognition**: Custom algorithms for pinch detection
- **Integration**: Non-destructive overlay on existing input system
- **Performance**: Optimized for 30fps with <50ms latency

### Files Added
- `hand-tracking.js`: MediaPipe integration and camera handling
- `gesture-recognition.js`: Gesture detection algorithms
- `gesture-control.js`: Main controller and game integration
- `gesture-ui.js`: Visual feedback and UI components

### Browser APIs Used
- MediaDevices.getUserMedia() for camera access
- Canvas API for visual feedback
- RequestAnimationFrame for smooth performance

## Privacy and Security

- **Local Processing**: All hand tracking is done locally in your browser
- **No Data Transmission**: No video or gesture data is sent to external servers
- **Camera Control**: You have full control over camera access
- **No Storage**: No gesture or video data is stored locally

## Keyboard Shortcuts

- **G**: Toggle gesture control on/off
- **All existing shortcuts**: Remain functional in gesture mode

## Tips for Best Experience

1. **Lighting**: Ensure good, even lighting on your hand
2. **Background**: Plain backgrounds work better than busy ones
3. **Distance**: Keep hand 1-2 feet from camera
4. **Gestures**: Make clear, deliberate movements
5. **Calibration**: Adjust sensitivity settings for your setup
6. **Practice**: Spend a few minutes getting familiar with the gestures

## Known Limitations

- Single hand tracking only
- Requires good lighting conditions
- Performance varies by hardware
- Not supported in all browsers
- May not work well with very dark or very light skin tones (MediaPipe limitation)

## Future Enhancements

Potential future improvements:
- Multi-hand support
- Additional gesture types
- Improved low-light performance
- Mobile device support
- Custom gesture training

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify browser compatibility
3. Test camera with other applications
4. Try different lighting conditions
5. Report persistent issues on the project's GitHub page

## Credits

- **MediaPipe Hands**: Google's hand tracking solution
- **Integration**: Custom implementation for Sandboxels
- **Testing**: Community feedback and testing

---

*This gesture control system enhances the Sandboxels experience while maintaining full compatibility with traditional input methods.*
