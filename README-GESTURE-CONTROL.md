# 🎮 Sandboxels Gesture Control

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-blue.svg)](https://developer.mozilla.org/en-US/docs/Web)
[![Camera: Required](https://img.shields.io/badge/Camera-Required-red.svg)](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
[![HTTPS: Required](https://img.shields.io/badge/HTTPS-Required-green.svg)](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)

Revolutionary gesture control system for Sandboxels - control the falling sand simulation with hand gestures using advanced computer vision and machine learning.

## ✨ Features

### 🎯 Core Gesture Controls
- **👆 Point**: Draw with current element
- **✌️ Peace Sign**: Erase pixels  
- **🤏 Pinch**: Select element from canvas
- **✋ Open Palm**: Pause/play simulation
- **✊ Fist**: Reset canvas
- **👍 Thumbs Up**: Increase brush size
- **👎 Thumbs Down**: Decrease brush size
- **👈👉 Swipe**: Change element categories

### 🚀 Advanced Features
- **Real-time hand tracking** with MediaPipe
- **Cross-platform compatibility** (Desktop, Mobile, Tablet)
- **Adaptive performance optimization**
- **Privacy-first design** (local processing only)
- **Custom gesture training**
- **Multi-language support**
- **Accessibility features**

### 🔒 Privacy & Security
- ✅ **Local processing only** - no data sent to servers
- ✅ **No video recording** or storage
- ✅ **HTTPS required** for secure camera access
- ✅ **Automatic data deletion** when page closes
- ✅ **User consent management**
- ✅ **Transparent privacy controls**

## 🎯 Quick Start

### 1. **Download Files**
```bash
# Core gesture system
gesture-control.js
gesture-ui.js
sandboxels-gesture-integration.js

# Advanced features (optional)
advanced-gesture-recognition.js
performance-optimizer.js
cross-platform-compatibility.js
security-privacy.js
```

### 2. **Add to Your Sandboxels**
Add these script tags to your `index.html` before closing `</body>`:

```html
<!-- MediaPipe Dependencies -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>

<!-- Gesture Control System -->
<script src="gesture-control.js"></script>
<script src="sandboxels-gesture-integration.js"></script>
<script src="gesture-ui.js"></script>

<!-- Optional Advanced Features -->
<script src="advanced-gesture-recognition.js"></script>
<script src="performance-optimizer.js"></script>
<script src="cross-platform-compatibility.js"></script>
<script src="security-privacy.js"></script>
```

### 3. **Deploy with HTTPS**
Choose a hosting service that supports HTTPS:
- **Netlify** (Recommended) - Free with automatic HTTPS
- **Vercel** - Excellent performance
- **GitHub Pages** - Free for public repos
- **Firebase Hosting** - Google's infrastructure

### 4. **Test & Launch**
1. Open your site with HTTPS
2. Allow camera permissions
3. Try gesture controls
4. Enjoy hands-free Sandboxels!

## 📱 Platform Support

| Platform | Browser | Support Level | Notes |
|----------|---------|---------------|-------|
| **Windows** | Chrome | ✅ Excellent | Best performance |
| **Windows** | Firefox | ✅ Good | Full features |
| **Windows** | Edge | ✅ Good | Full features |
| **macOS** | Chrome | ✅ Excellent | Best performance |
| **macOS** | Safari | ⚠️ Limited | Requires user interaction |
| **macOS** | Firefox | ✅ Good | Full features |
| **Android** | Chrome | ✅ Good | Optimized for mobile |
| **Android** | Firefox | ✅ Good | Full features |
| **iOS** | Safari | ⚠️ Limited | Manual permission required |
| **iOS** | Chrome | ⚠️ Limited | Uses Safari engine |

## 🎮 Gesture Guide

### Basic Gestures
| Gesture | Action | Description |
|---------|--------|-------------|
| 👆 **Point** | Draw | Extend index finger to draw |
| ✌️ **Peace** | Erase | V-sign with index and middle finger |
| 🤏 **Pinch** | Select | Touch thumb and index finger |
| ✋ **Open Palm** | Pause/Play | All fingers extended |
| ✊ **Fist** | Reset | All fingers closed |

### Advanced Gestures
| Gesture | Action | Description |
|---------|--------|-------------|
| 👍 **Thumbs Up** | Brush Size + | Thumb up, other fingers down |
| 👎 **Thumbs Down** | Brush Size - | Thumb down, other fingers down |
| 👈 **Swipe Left** | Previous Category | Hand moving left |
| 👉 **Swipe Right** | Next Category | Hand moving right |
| 🙌 **Two Hands Apart** | Zoom In | Both hands moving apart |
| 🤲 **Two Hands Together** | Zoom Out | Both hands moving together |

## ⚙️ Configuration

### Basic Setup
```javascript
// Initialize with default settings
window.addEventListener('load', function() {
    if (window.gestureController) {
        // Start gesture control
        gestureController.start();
    }
});
```

### Advanced Configuration
```javascript
// Custom gesture sensitivity
gestureController.hands.setOptions({
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
    modelComplexity: 1
});

// Performance optimization
performanceOptimizer.setOptimizationLevel(2); // 0=Ultra, 4=Minimal
performanceOptimizer.setAutoOptimization(true);

// Custom gesture mapping
sandboxelsGestureIntegration.addGestureMapping('ok_sign', 'customAction', {
    cooldown: 500,
    holdRequired: true,
    description: 'Custom OK gesture'
});
```

## 🔧 Customization

### Adding Custom Gestures
```javascript
// Train a new gesture
gestureController.startGestureTraining('my_gesture');
// Perform gesture 30+ times
gestureController.completeGestureTraining();

// Map to game action
sandboxelsGestureIntegration.addGestureMapping('my_gesture', 'myAction');
```

### Platform-Specific Optimizations
```javascript
// Mobile optimizations
if (crossPlatformCompatibility.platform.mobile) {
    gestureController.hands.setOptions({
        modelComplexity: 0,
        maxNumHands: 1
    });
}

// iOS-specific handling
if (crossPlatformCompatibility.platform.type === 'ios') {
    // Require user interaction before starting camera
    gestureController.requireUserInteraction = true;
}
```

## 📊 Performance

### Recommended Specifications
- **CPU**: Modern dual-core processor
- **RAM**: 4GB+ available
- **Camera**: 720p webcam or better
- **Browser**: Chrome 88+, Firefox 85+, Safari 14+
- **Connection**: HTTPS required

### Performance Modes
- **Ultra**: Best quality, high resource usage
- **High**: Balanced quality and performance (default)
- **Medium**: Good performance, reduced quality
- **Low**: Best performance, basic features
- **Minimal**: Emergency mode for low-end devices

## 🛡️ Privacy & Security

### Data Protection
- **No server communication** for gesture data
- **Local processing only** using MediaPipe
- **Automatic data deletion** on page close
- **No biometric identification** - only gesture recognition
- **Transparent privacy controls**

### Security Features
- **HTTPS enforcement** for camera access
- **Content Security Policy** protection
- **Permissions Policy** restrictions
- **No third-party tracking**
- **Secure camera handling**

### User Controls
- **Revoke camera access** anytime
- **Clear all data** instantly  
- **View privacy status**
- **Consent management**

## 🚀 Deployment

### Netlify (Recommended)
1. Upload files to repository
2. Connect to Netlify
3. Deploy automatically
4. HTTPS enabled by default

### Manual Deployment
1. Ensure HTTPS is configured
2. Set proper headers for camera permissions
3. Test camera access
4. Monitor performance

### Required Headers
```
Permissions-Policy: camera=self
Content-Security-Policy: media-src 'self' blob:
```

## 🐛 Troubleshooting

### Common Issues

**Camera not working:**
- ✅ Check HTTPS connection
- ✅ Allow camera permissions
- ✅ Try different browser
- ✅ Check camera hardware

**Poor gesture detection:**
- ✅ Improve lighting
- ✅ Position hand 2 feet from camera
- ✅ Adjust sensitivity settings
- ✅ Try different gestures

**Low performance:**
- ✅ Close other browser tabs
- ✅ Enable performance mode
- ✅ Check device specifications
- ✅ Update browser

### Debug Mode
```javascript
// Enable debug logging
gestureController.showGestureOverlay(true);
performanceOptimizer.startMonitoring(gestureController);

// Check compatibility
console.log(crossPlatformCompatibility.getCompatibilityReport());
```

## 📚 API Reference

### Core Classes
- `GestureController` - Main gesture recognition
- `GestureUI` - User interface components
- `SandboxelsGestureIntegration` - Game integration
- `AdvancedGestureRecognition` - ML-based recognition
- `PerformanceOptimizer` - Performance management
- `CrossPlatformCompatibility` - Platform handling
- `SecurityPrivacyManager` - Privacy protection

### Events
```javascript
// Gesture events
window.addEventListener('gestureControlStarted', handler);
window.addEventListener('gestureControlStopped', handler);
window.addEventListener('gestureDetected', handler);
window.addEventListener('gesturePerformanceUpdate', handler);
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/your-repo/sandboxels-gesture-control
cd sandboxels-gesture-control
# Open gesture-test.html for testing
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** by Google for hand tracking technology
- **Sandboxels** by R74n for the amazing falling sand game
- **Open source community** for inspiration and support

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@your-domain.com

---

**Made with ❤️ for the Sandboxels community**

*Transform your Sandboxels experience with the magic of gesture control!*
