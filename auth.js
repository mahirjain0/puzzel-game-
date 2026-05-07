// LUNA STEALTH CHAT v3.0 (ULTRA-PRO) - Google Authentication System

class LunaAuthSystem {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.tokenClient = null;
        
        this.initializeAuth();
    }

    // Initialize Google authentication
    initializeAuth() {
        // Wait for Google Identity Services to load
        window.onload = () => {
            this.setupGoogleAuth();
        };

        // Handle credential response
        window.handleCredentialResponse = (response) => {
            this.handleSignIn(response);
        };
    }

    // Setup Google authentication
    setupGoogleAuth() {
        if (window.google && window.google.accounts) {
            // Initialize the token client
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: LUNA_CONFIG.CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        this.handleTokenSuccess(tokenResponse);
                    }
                },
            });

            // Initialize sign-in button
            window.google.accounts.id.initialize({
                client_id: LUNA_CONFIG.CLIENT_ID,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
            });
        }
    }

    // Handle Google Sign-In credential response
    handleCredentialResponse(response) {
        if (response.credential) {
            // Decode JWT token (basic parsing)
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            
            this.currentUser = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                email_verified: payload.email_verified
            };

            this.isSignedIn = true;
            this.onSignInSuccess();
        }
    }

    // Handle token success
    handleTokenSuccess(tokenResponse) {
        console.log('Access token received:', tokenResponse.access_token);
        // Store token for Google Drive API calls
        this.accessToken = tokenResponse.access_token;
    }

    // Handle successful sign-in
    onSignInSuccess() {
        console.log('User signed in:', this.currentUser);
        
        // Show welcome notification
        this.showNotification(`🎉 Welcome ${this.currentUser.name}!`);
        
        // Check if admin
        if (this.currentUser.email === LUNA_CONFIG.ADMIN) {
            this.showNotification('👑 Supreme Admin access granted');
        }
        
        // Transition to vault
        this.transitionToVault();
    }

    // Transition to vault layer
    transitionToVault() {
        const gameLayer = document.getElementById('game-layer');
        const vaultLayer = document.getElementById('vault-layer');
        
        if (gameLayer && vaultLayer) {
            gameLayer.classList.add('hidden-layer');
            gameLayer.classList.remove('active-layer');
            vaultLayer.classList.remove('hidden-layer');
            vaultLayer.classList.add('active-layer');
            
            // Initialize vault system
            if (typeof window.initializeVault === 'function') {
                window.initializeVault();
            }
        }
    }

    // Show notification
    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            background: linear-gradient(135deg, var(--primary-neon), var(--secondary-neon));
            color: var(--deep-charcoal);
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 8px;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.email === LUNA_CONFIG.ADMIN;
    }

    // Sign out
    signOut() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
        
        this.isSignedIn = false;
        this.currentUser = null;
        this.accessToken = null;
        
        // Return to game layer
        const vaultLayer = document.getElementById('vault-layer');
        const gameLayer = document.getElementById('game-layer');
        
        if (vaultLayer && gameLayer) {
            vaultLayer.classList.add('hidden-layer');
            vaultLayer.classList.remove('active-layer');
            gameLayer.classList.remove('hidden-layer');
            gameLayer.classList.add('active-layer');
        }
        
        this.showNotification('👋 Signed out successfully');
    }
}

// Initialize auth system
window.lunaAuth = new LunaAuthSystem();

// Export for global access
window.LunaAuthSystem = LunaAuthSystem;
