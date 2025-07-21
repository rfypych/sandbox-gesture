# 🚀 Deployment Guide - Particle Hand Game

## Build Fixes Applied

### TypeScript Errors Fixed:
1. **Property initialization**: Added `!` assertion for class properties that are initialized in async methods
2. **Unused variables**: Removed unused `pixelRatio` variable
3. **Function parameters**: Fixed `gameLoop()` call with proper parameter
4. **Strict property initialization**: Disabled in tsconfig.json for better compatibility

### MediaPipe Compatibility:
- Added try-catch blocks for MediaPipe initialization
- Graceful fallback when MediaPipe is not available
- App continues to work with touch controls even without hand tracking

### Build Configuration:
- Updated build scripts in package.json
- Added `build:prod` script for production builds
- Configured vercel.json with proper headers for camera access

## Deployment Options

### 1. Vercel (Recommended)
```bash
# Connect your GitHub repo to Vercel
# Vercel will automatically detect Vite and build the project
# Make sure to set build command to: npm run build:prod
```

### 2. Netlify
```bash
# Build command: npm run build:prod
# Publish directory: dist
```

### 3. GitHub Pages
```bash
npm run build:prod
# Upload dist/ folder to gh-pages branch
```

### 4. Self-hosted
```bash
npm run build:prod
# Serve dist/ folder with any web server
# Make sure to configure HTTPS for camera access
```

## Important Notes

### Camera Access Requirements:
- **HTTPS Required**: Modern browsers require HTTPS for camera access
- **Permissions**: Users must grant camera permission
- **Cross-Origin Headers**: Configured in vercel.json for MediaPipe

### Browser Compatibility:
- **Desktop**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+, Samsung Internet 15+

### Performance Optimization:
- Particle count automatically adjusts based on device capabilities
- Frame rate limiting for mobile devices
- Object pooling for memory efficiency

## Troubleshooting

### Build Errors:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

### Runtime Issues:
- Check browser console for MediaPipe loading errors
- Ensure HTTPS is enabled for camera access
- Verify Cross-Origin headers are properly set

### Performance Issues:
- Game automatically reduces particle count on slower devices
- Check browser developer tools for performance metrics
- Consider reducing maxParticles in ParticleSystem.ts for very slow devices

## Environment Variables (Optional)
Create `.env` file for custom configuration:
```
VITE_MAX_PARTICLES=500
VITE_ENABLE_DEBUG=false
VITE_MEDIAPIPE_CDN=https://cdn.jsdelivr.net/npm/@mediapipe/hands/
```

## Post-Deployment Checklist
- [ ] Test camera access on HTTPS
- [ ] Verify hand tracking works
- [ ] Test touch controls on mobile
- [ ] Check performance on different devices
- [ ] Verify all gestures work correctly
- [ ] Test in different browsers

## Support
If you encounter issues:
1. Check browser console for errors
2. Verify HTTPS is enabled
3. Test in different browsers
4. Check network connectivity for MediaPipe CDN
