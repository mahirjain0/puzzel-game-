// Authentication Module - Google OAuth 2.0 Flow

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.accessToken = null;
        this.isAuthenticated = false;
        this.adminEmail = LUNA_CONFIG.ADMIN;
        
        this.initializeAuth();
    }
    
    initializeAuth() {
        // Initialize Google Identity Services
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: LUNA_CONFIG.CLIENT_ID,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: false
            });
        }
        
        // Initialize OAuth2 token client for Drive access
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: LUNA_CONFIG.CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
                callback: this.handleTokenResponse.bind(this)
            });
        }
    }
    
    handleCredentialResponse(response) {
        if (response.credential) {
            try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                
                this.currentUser = {
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    email_verified: payload.email_verified
                };
                
                this.isAuthenticated = true;
                
                // Store user data
                localStorage.setItem('mirage_user', JSON.stringify(this.currentUser));
                
                console.log('User authenticated:', this.currentUser.email);
                
                // Trigger success callback if exists
                if (this.onAuthSuccess) {
                    this.onAuthSuccess(this.currentUser);
                }
                
                return this.currentUser;
            } catch (error) {
                console.error('Failed to parse credential:', error);
                return null;
            }
        }
    }
    
    handleTokenResponse(tokenResponse) {
        if (tokenResponse && tokenResponse.access_token) {
            this.accessToken = tokenResponse.access_token;
            
            // Trigger callback
            if (this.onTokenAcquired) {
                this.onTokenAcquired(this.accessToken);
            }
            
            return this.accessToken;
        }
    }
    
    requestAccessToken() {
        if (this.tokenClient) {
            try {
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (error) {
                // If popup blocked, try with user interaction
                this.showManualSignIn();
            }
        } else {
            console.warn('Token client not initialized');
        }
    }
    
    showManualSignIn() {
        // Create a visible button for user to click (bypasses popup blockers)
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <h2 style="margin-bottom: 20px;">🔐 Secure Access Required</h2>
                <p style="margin-bottom: 30px; opacity: 0.8;">Click below to connect to 5TB storage</p>
                <button id="manual-auth-btn" style="
                    background: linear-gradient(135deg, #00d2ff, #3a7bd5);
                    color: white;
                    border: none;
                    padding: 16px 40px;
                    border-radius: 30px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0, 210, 255, 0.4);
                ">Connect to Google Drive</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        document.getElementById('manual-auth-btn').addEventListener('click', () => {
            if (this.tokenClient) {
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            }
            overlay.remove();
        });
    }
    
    signInWithPopup() {
        return new Promise((resolve, reject) => {
            if (!window.google || !window.google.accounts) {
                reject(new Error('Google Identity Services not loaded'));
                return;
            }
            
            this.onAuthSuccess = (user) => {
                resolve(user);
            };
            
            // Prompt for sign in
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Show explicit sign-in button fallback
                    this.showSignInButton(resolve, reject);
                }
            });
        });
    }
    
    showSignInButton(resolve, reject) {
        // Create sign-in button container
        const container = document.createElement('div');
        container.id = 'gsi-container';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: var(--glass-heavy);
            backdrop-filter: blur(50px);
            padding: 40px;
            border-radius: 24px;
            border: 1px solid var(--glass-border);
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.9);
        `;
        
        container.innerHTML = `
            <h3 style="color: white; margin-bottom: 20px; text-align: center;">Secure Access Required</h3>
            <div id="gsi-button"></div>
        `;
        
        document.body.appendChild(container);
        
        // Render Google Sign-In button
        window.google.accounts.id.renderButton(
            document.getElementById('gsi-button'),
            {
                type: 'standard',
                theme: 'filled_black',
                size: 'large',
                text: 'signin_with',
                shape: 'pill',
                width: 250
            }
        );
        
        // Update callback to remove button
        const originalCallback = this.onAuthSuccess;
        this.onAuthSuccess = (user) => {
            container.remove();
            if (originalCallback) originalCallback(user);
            resolve(user);
        };
    }
    
    isAdmin() {
        return this.currentUser && this.currentUser.email === this.adminEmail;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getAccessToken() {
        return this.accessToken;
    }
    
    signOut() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
        
        this.currentUser = null;
        this.accessToken = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('mirage_user');
        
        console.log('User signed out');
    }
    
    checkStoredAuth() {
        const stored = localStorage.getItem('mirage_user');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                this.isAuthenticated = true;
                return true;
            } catch (error) {
                console.error('Failed to parse stored auth:', error);
            }
        }
        return false;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();

// Export for global access
window.AuthManager = AuthManager;
