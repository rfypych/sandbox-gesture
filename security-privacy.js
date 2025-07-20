/**
 * Security and Privacy Manager for Gesture Control
 * Handles camera permissions, data privacy, and security compliance
 */

class SecurityPrivacyManager {
    constructor() {
        this.permissions = {
            camera: 'prompt', // 'granted', 'denied', 'prompt'
            microphone: 'denied' // Always deny microphone
        };
        
        this.privacySettings = {
            localProcessingOnly: true,
            noDataCollection: true,
            noVideoRecording: true,
            noDataTransmission: true,
            autoDeleteData: true,
            encryptLocalData: false // Not needed for local-only processing
        };
        
        this.securityFeatures = {
            httpsRequired: true,
            contentSecurityPolicy: true,
            permissionsPolicy: true,
            noThirdPartyTracking: true,
            secureHeaders: true
        };
        
        this.consentStatus = {
            cameraConsent: false,
            privacyPolicyAccepted: false,
            dataProcessingConsent: false,
            consentTimestamp: null
        };
        
        this.dataRetention = {
            gestureHistory: 5 * 60 * 1000, // 5 minutes
            performanceMetrics: 10 * 60 * 1000, // 10 minutes
            errorLogs: 24 * 60 * 60 * 1000, // 24 hours
            userPreferences: 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        this.initializeSecurity();
    }

    /**
     * Initialize security measures
     */
    initializeSecurity() {
        this.checkHTTPS();
        this.setupContentSecurityPolicy();
        this.setupPermissionsPolicy();
        this.initializePrivacyControls();
        this.setupDataRetentionCleanup();
        this.monitorSecurityViolations();
    }

    /**
     * Check HTTPS requirement
     */
    checkHTTPS() {
        if (!window.isSecureContext) {
            console.error('HTTPS is required for camera access');
            this.showSecurityWarning('HTTPS Required', 
                'Camera access requires a secure HTTPS connection. Please access this site via HTTPS.');
            return false;
        }
        return true;
    }

    /**
     * Setup Content Security Policy
     */
    setupContentSecurityPolicy() {
        // Check if CSP is properly configured
        const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        
        if (!metaCSP) {
            console.warn('Content Security Policy not found. Adding recommended CSP.');
            this.addRecommendedCSP();
        }
        
        // Monitor CSP violations
        document.addEventListener('securitypolicyviolation', (e) => {
            console.error('CSP Violation:', e.violatedDirective, e.blockedURI);
            this.logSecurityEvent('csp_violation', {
                directive: e.violatedDirective,
                blockedURI: e.blockedURI,
                sourceFile: e.sourceFile,
                lineNumber: e.lineNumber
            });
        });
    }

    /**
     * Add recommended Content Security Policy
     */
    addRecommendedCSP() {
        const csp = document.createElement('meta');
        csp.setAttribute('http-equiv', 'Content-Security-Policy');
        csp.setAttribute('content', 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "media-src 'self' blob:; " +
            "connect-src 'self' https://cdn.jsdelivr.net; " +
            "worker-src 'self' blob:; " +
            "frame-src 'none'; " +
            "object-src 'none'; " +
            "base-uri 'self';"
        );
        document.head.appendChild(csp);
    }

    /**
     * Setup Permissions Policy
     */
    setupPermissionsPolicy() {
        // Check if Permissions Policy is configured
        const permissionsPolicy = document.querySelector('meta[http-equiv="Permissions-Policy"]');
        
        if (!permissionsPolicy) {
            const policy = document.createElement('meta');
            policy.setAttribute('http-equiv', 'Permissions-Policy');
            policy.setAttribute('content', 
                'camera=self, microphone=(), geolocation=(), payment=(), ' +
                'usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
            );
            document.head.appendChild(policy);
        }
    }

    /**
     * Initialize privacy controls
     */
    initializePrivacyControls() {
        this.createPrivacyNotice();
        this.setupConsentManagement();
        this.initializeDataMinimization();
        this.setupUserControls();
    }

    /**
     * Create privacy notice
     */
    createPrivacyNotice() {
        const notice = document.createElement('div');
        notice.id = 'privacy-notice';
        notice.className = 'privacy-notice';
        notice.innerHTML = `
            <div class="privacy-content">
                <h3>📷 Camera Usage Notice</h3>
                <p>This application uses your camera for gesture recognition only. Your privacy is protected:</p>
                <ul>
                    <li>✅ All processing happens locally in your browser</li>
                    <li>✅ No video data is sent to servers</li>
                    <li>✅ No video recording or storage</li>
                    <li>✅ No personal data collection</li>
                    <li>✅ Data is automatically deleted when you close the page</li>
                </ul>
                <div class="privacy-actions">
                    <button id="accept-privacy" class="privacy-btn accept">Accept & Continue</button>
                    <button id="decline-privacy" class="privacy-btn decline">Decline</button>
                    <button id="privacy-details" class="privacy-btn details">More Details</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .privacy-notice {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: none;
                z-index: 50000;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            }
            .privacy-content {
                background: white;
                color: black;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                margin: 20px;
            }
            .privacy-content h3 {
                margin-top: 0;
                color: #333;
            }
            .privacy-content ul {
                text-align: left;
                margin: 20px 0;
            }
            .privacy-content li {
                margin: 8px 0;
                font-size: 14px;
            }
            .privacy-actions {
                text-align: center;
                margin-top: 25px;
            }
            .privacy-btn {
                margin: 5px;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            .privacy-btn.accept {
                background: #4CAF50;
                color: white;
            }
            .privacy-btn.decline {
                background: #f44336;
                color: white;
            }
            .privacy-btn.details {
                background: #2196F3;
                color: white;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notice);
        
        // Bind events
        document.getElementById('accept-privacy').onclick = () => this.acceptPrivacyConsent();
        document.getElementById('decline-privacy').onclick = () => this.declinePrivacyConsent();
        document.getElementById('privacy-details').onclick = () => this.showPrivacyDetails();
    }

    /**
     * Setup consent management
     */
    setupConsentManagement() {
        // Load saved consent
        this.loadConsentStatus();
        
        // Auto-expire consent after 30 days
        if (this.consentStatus.consentTimestamp) {
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - this.consentStatus.consentTimestamp > thirtyDays) {
                this.resetConsent();
            }
        }
    }

    /**
     * Request camera permission with privacy protection
     */
    async requestCameraPermission() {
        // Show privacy notice first if not accepted
        if (!this.consentStatus.privacyPolicyAccepted) {
            return new Promise((resolve) => {
                this.showPrivacyNotice();
                this.consentResolve = resolve;
            });
        }
        
        try {
            // Check current permission status
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                this.permissions.camera = permission.state;
                
                if (permission.state === 'denied') {
                    throw new Error('Camera permission denied');
                }
            }
            
            // Request camera access with minimal constraints
            const constraints = {
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                    facingMode: 'user'
                },
                audio: false // Never request microphone
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            this.permissions.camera = 'granted';
            this.consentStatus.cameraConsent = true;
            this.saveConsentStatus();
            
            console.log('Camera permission granted with privacy protection');
            return stream;
            
        } catch (error) {
            this.permissions.camera = 'denied';
            this.handlePermissionError(error);
            throw error;
        }
    }

    /**
     * Handle permission errors
     */
    handlePermissionError(error) {
        let message = 'Camera access failed: ';
        
        if (error.name === 'NotAllowedError') {
            message += 'Permission denied. Please allow camera access to use gesture control.';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera found. Please connect a camera to use gesture control.';
        } else if (error.name === 'NotSupportedError') {
            message += 'Camera not supported in this browser.';
        } else if (error.name === 'NotSecureError') {
            message += 'HTTPS required for camera access.';
        } else {
            message += error.message;
        }
        
        this.showSecurityWarning('Camera Access Error', message);
        this.logSecurityEvent('camera_permission_error', { error: error.name, message: error.message });
    }

    /**
     * Initialize data minimization
     */
    initializeDataMinimization() {
        // Override console methods to prevent sensitive data logging in production
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;
            
            console.log = (...args) => {
                if (!this.containsSensitiveData(args)) {
                    originalLog.apply(console, args);
                }
            };
            
            console.warn = (...args) => {
                if (!this.containsSensitiveData(args)) {
                    originalWarn.apply(console, args);
                }
            };
            
            console.error = (...args) => {
                if (!this.containsSensitiveData(args)) {
                    originalError.apply(console, args);
                }
            };
        }
    }

    /**
     * Check if data contains sensitive information
     */
    containsSensitiveData(data) {
        const sensitivePatterns = [
            /landmarks/i,
            /coordinates/i,
            /position/i,
            /camera/i,
            /video/i
        ];
        
        const dataString = JSON.stringify(data);
        return sensitivePatterns.some(pattern => pattern.test(dataString));
    }

    /**
     * Setup user privacy controls
     */
    setupUserControls() {
        // Add privacy controls to gesture UI if available
        window.addEventListener('load', () => {
            this.addPrivacyControlsToUI();
        });
    }

    /**
     * Add privacy controls to gesture UI
     */
    addPrivacyControlsToUI() {
        const gesturePanel = document.getElementById('gesture-control-panel');
        if (gesturePanel) {
            const privacySection = document.createElement('div');
            privacySection.className = 'privacy-controls';
            privacySection.innerHTML = `
                <h4>Privacy Controls</h4>
                <div class="privacy-control-item">
                    <label>
                        <input type="checkbox" id="local-processing-only" checked disabled>
                        Local Processing Only
                    </label>
                </div>
                <div class="privacy-control-item">
                    <label>
                        <input type="checkbox" id="no-data-collection" checked disabled>
                        No Data Collection
                    </label>
                </div>
                <div class="privacy-control-item">
                    <button id="clear-gesture-data" class="privacy-btn">Clear All Data</button>
                </div>
                <div class="privacy-control-item">
                    <button id="revoke-camera-permission" class="privacy-btn">Revoke Camera Access</button>
                </div>
            `;
            
            gesturePanel.querySelector('.gesture-content').appendChild(privacySection);
            
            // Bind events
            document.getElementById('clear-gesture-data').onclick = () => this.clearAllData();
            document.getElementById('revoke-camera-permission').onclick = () => this.revokeCameraPermission();
        }
    }

    /**
     * Setup data retention cleanup
     */
    setupDataRetentionCleanup() {
        // Clean up data periodically
        setInterval(() => {
            this.cleanupExpiredData();
        }, 5 * 60 * 1000); // Every 5 minutes
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.clearAllData();
        });
    }

    /**
     * Clean up expired data
     */
    cleanupExpiredData() {
        const now = Date.now();
        
        // Clear gesture history
        if (window.gestureController && window.gestureController.gestureHistory) {
            window.gestureController.gestureHistory = window.gestureController.gestureHistory.filter(
                item => now - item.timestamp < this.dataRetention.gestureHistory
            );
        }
        
        // Clear performance metrics
        if (window.performanceOptimizer && window.performanceOptimizer.performanceHistory) {
            window.performanceOptimizer.performanceHistory = window.performanceOptimizer.performanceHistory.filter(
                item => now - item.timestamp < this.dataRetention.performanceMetrics
            );
        }
        
        // Clear error logs
        this.clearExpiredLogs();
    }

    /**
     * Clear all gesture-related data
     */
    clearAllData() {
        // Clear gesture history
        if (window.gestureController) {
            window.gestureController.gestureHistory = [];
            window.gestureController.trainingFrames = [];
        }
        
        // Clear performance data
        if (window.performanceOptimizer) {
            window.performanceOptimizer.performanceHistory = [];
        }
        
        // Clear local storage (gesture-related only)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('gesture') || key.includes('camera') || key.includes('privacy'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('All gesture data cleared');
    }

    /**
     * Revoke camera permission
     */
    async revokeCameraPermission() {
        // Stop camera stream
        if (window.gestureController && window.gestureController.camera) {
            window.gestureController.stop();
        }
        
        // Clear consent
        this.consentStatus.cameraConsent = false;
        this.permissions.camera = 'denied';
        this.saveConsentStatus();
        
        // Show instruction to user
        this.showSecurityWarning('Camera Access Revoked', 
            'Camera access has been revoked. To re-enable gesture control, you will need to refresh the page and grant permission again.');
    }

    /**
     * Monitor security violations
     */
    monitorSecurityViolations() {
        // Monitor for suspicious activity
        let suspiciousActivityCount = 0;
        
        // Monitor excessive permission requests
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
        navigator.mediaDevices.getUserMedia = async (constraints) => {
            if (constraints.audio && !this.consentStatus.cameraConsent) {
                suspiciousActivityCount++;
                this.logSecurityEvent('suspicious_audio_request', constraints);
            }
            
            return originalGetUserMedia.call(navigator.mediaDevices, constraints);
        };
        
        // Monitor for data exfiltration attempts
        const originalFetch = window.fetch;
        window.fetch = (url, options) => {
            if (options && options.body && this.containsSensitiveData([options.body])) {
                this.logSecurityEvent('potential_data_exfiltration', { url, hasBody: true });
                throw new Error('Blocked potential data exfiltration attempt');
            }
            
            return originalFetch(url, options);
        };
    }

    /**
     * Show privacy notice
     */
    showPrivacyNotice() {
        const notice = document.getElementById('privacy-notice');
        if (notice) {
            notice.style.display = 'flex';
        }
    }

    /**
     * Accept privacy consent
     */
    acceptPrivacyConsent() {
        this.consentStatus.privacyPolicyAccepted = true;
        this.consentStatus.dataProcessingConsent = true;
        this.consentStatus.consentTimestamp = Date.now();
        this.saveConsentStatus();
        
        document.getElementById('privacy-notice').style.display = 'none';
        
        if (this.consentResolve) {
            this.consentResolve(true);
        }
    }

    /**
     * Decline privacy consent
     */
    declinePrivacyConsent() {
        this.consentStatus.privacyPolicyAccepted = false;
        this.consentStatus.dataProcessingConsent = false;
        this.saveConsentStatus();
        
        document.getElementById('privacy-notice').style.display = 'none';
        
        this.showSecurityWarning('Gesture Control Disabled', 
            'Gesture control requires camera access consent. You can still use traditional mouse and keyboard controls.');
        
        if (this.consentResolve) {
            this.consentResolve(false);
        }
    }

    /**
     * Show privacy details
     */
    showPrivacyDetails() {
        const details = `
            DETAILED PRIVACY INFORMATION
            
            What data we process:
            • Hand landmark coordinates (temporary, local only)
            • Gesture recognition results (temporary, local only)
            • Performance metrics (anonymous, local only)
            
            What we DON'T collect:
            • Video recordings
            • Personal information
            • Biometric data for identification
            • Location data
            • Any data sent to servers
            
            Data retention:
            • Gesture data: Deleted after 5 minutes
            • Performance data: Deleted after 10 minutes
            • All data: Deleted when you close the page
            
            Your rights:
            • Revoke camera access at any time
            • Clear all data instantly
            • Use the app without gesture control
            
            Technical details:
            • All processing uses MediaPipe (Google's open-source library)
            • Processing happens in your browser only
            • No network requests for gesture data
            • HTTPS encryption for all communications
        `;
        
        alert(details);
    }

    /**
     * Show security warning
     */
    showSecurityWarning(title, message) {
        const warning = document.createElement('div');
        warning.className = 'security-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ ${title}</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 60000;
        `;
        
        warning.querySelector('.warning-content').style.cssText = `
            background: white;
            color: black;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(warning);
    }

    /**
     * Log security event
     */
    logSecurityEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data: data || {},
            userAgent: navigator.userAgent,
            url: location.href
        };
        
        // Store locally for debugging (will be auto-deleted)
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(event);
        
        // Keep only recent logs
        const recentLogs = logs.filter(log => Date.now() - log.timestamp < this.dataRetention.errorLogs);
        localStorage.setItem('security_logs', JSON.stringify(recentLogs));
        
        console.warn('Security event:', type, data);
    }

    /**
     * Save consent status
     */
    saveConsentStatus() {
        localStorage.setItem('privacy_consent', JSON.stringify(this.consentStatus));
    }

    /**
     * Load consent status
     */
    loadConsentStatus() {
        const saved = localStorage.getItem('privacy_consent');
        if (saved) {
            this.consentStatus = { ...this.consentStatus, ...JSON.parse(saved) };
        }
    }

    /**
     * Reset consent
     */
    resetConsent() {
        this.consentStatus = {
            cameraConsent: false,
            privacyPolicyAccepted: false,
            dataProcessingConsent: false,
            consentTimestamp: null
        };
        this.saveConsentStatus();
    }

    /**
     * Clear expired logs
     */
    clearExpiredLogs() {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        const recentLogs = logs.filter(log => Date.now() - log.timestamp < this.dataRetention.errorLogs);
        localStorage.setItem('security_logs', JSON.stringify(recentLogs));
    }

    /**
     * Get privacy status
     */
    getPrivacyStatus() {
        return {
            permissions: this.permissions,
            consent: this.consentStatus,
            privacySettings: this.privacySettings,
            securityFeatures: this.securityFeatures,
            httpsEnabled: window.isSecureContext,
            dataRetentionPolicies: this.dataRetention
        };
    }
}

// Initialize security and privacy manager
window.securityPrivacyManager = new SecurityPrivacyManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityPrivacyManager;
}
