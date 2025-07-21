#!/usr/bin/env node

/**
 * Custom build script for Particle Hand Game
 * Handles MediaPipe dependencies and build optimization
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎮 Building Particle Hand Game...');

try {
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Run Vite build
  console.log('🔨 Building with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Check if dist folder was created
  if (fs.existsSync('dist')) {
    console.log('✅ Build completed successfully!');
    console.log('📁 Output directory: dist/');
    
    // List files in dist
    const distFiles = fs.readdirSync('dist');
    console.log('📄 Generated files:');
    distFiles.forEach(file => {
      const filePath = path.join('dist', file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`   ${file} (${size} KB)`);
    });
  } else {
    throw new Error('Build output directory not found');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
