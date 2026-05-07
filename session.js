// Session Manager - Persistent Login & Profile Storage

class SessionManager {
    constructor() {
        this.STORAGE_KEY = 'mirage_vault_session';
        this.PROFILE_KEY = 'mirage_user_profile';
        this.currentSession = null;
        this.currentProfile = null;
    }
    
    // Save session after successful Google login
    saveSession(accessToken, userInfo) {
        const session = {
            accessToken: accessToken,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            loginTime: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this.currentSession = session;
        
        // Also update authManager
        if (window.authManager) {
            window.authManager.accessToken = accessToken;
            window.authManager.currentUser = userInfo;
            window.authManager.isAuthenticated = true;
        }
        
        return session;
    }
    
    // Check if valid session exists
    hasValidSession() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return false;
        
        try {
            const session = JSON.parse(stored);
            // Check if session is less than 7 days old
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
            
            return daysDiff < 7 && session.accessToken;
        } catch (error) {
            return false;
        }
    }
    
    // Restore session from localStorage
    restoreSession() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return null;
        
        try {
            const session = JSON.parse(stored);
            this.currentSession = session;
            
            // Restore authManager state
            if (window.authManager) {
                window.authManager.accessToken = session.accessToken;
                window.authManager.currentUser = {
                    email: session.email,
                    name: session.name,
                    picture: session.picture
                };
                window.authManager.isAuthenticated = true;
            }
            
            // Update last active
            this.updateLastActive();
            
            return session;
        } catch (error) {
            console.error('Failed to restore session:', error);
            return null;
        }
    }
    
    // Update last active timestamp
    updateLastActive() {
        if (this.currentSession) {
            this.currentSession.lastActive = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSession));
        }
    }
    
    // Save user profile (display name, etc.)
    saveProfile(profile) {
        const profileData = {
            ...profile,
            email: this.currentSession?.email,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profileData));
        this.currentProfile = profileData;
        return profileData;
    }
    
    // Load user profile
    loadProfile() {
        const stored = localStorage.getItem(this.PROFILE_KEY);
        if (stored) {
            this.currentProfile = JSON.parse(stored);
            return this.currentProfile;
        }
        return null;
    }
    
    // Check if profile is complete
    hasCompleteProfile() {
        const profile = this.loadProfile();
        return profile && profile.displayName && profile.displayName.length >= 2;
    }
    
    // Clear session (logout)
    clearSession() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.PROFILE_KEY);
        this.currentSession = null;
        this.currentProfile = null;
        
        if (window.authManager) {
            window.authManager.signOut();
        }
    }
    
    // Get current session info
    getCurrentUser() {
        return this.currentSession || this.restoreSession();
    }
    
    // Get access token
    getAccessToken() {
        return this.currentSession?.accessToken || null;
    }
}

// Initialize session manager
window.sessionManager = new SessionManager();
window.SessionManager = SessionManager;
