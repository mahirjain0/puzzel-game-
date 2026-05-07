// LUNA OMNI-VAULT (MULTI-GAME STEALTH SYSTEM) - Dynamic Configuration

// Dynamic Origin Detection (Port-Agnostic)
const LUNA_ORIGIN = window.location.origin;

// Core Configuration
const LUNA_CONFIG = {
    // Google Drive API Configuration
    CLIENT_ID: '820644599677-450s9p3a9sltp50ld7ls7i5dhukibi2p.apps.googleusercontent.com',
    API_KEY: 'AIzaSyAsWL4HRoyVotvt9g5733KXBTSTwxf7LW4',
    FOLDER_ID: '1bWbWnv4-DxRZlqPwaSbxaq5BX60BbWkR',
    
    // Supreme Admin Configuration
    ADMIN: 'jainmahir2010@gmail.com',
    
    // System Configuration
    VERSION: 'OMNI-VAULT-1.0',
    BOT_NAME: 'Luna Alpha',
    ENCRYPTION_KEY: 'luna-omni-vault-2024',
    
    // Dynamic Origin Configuration
    ORIGIN: LUNA_ORIGIN,
    REDIRECT_URI: `${LUNA_ORIGIN}/auth/callback`,
    
    // UI Configuration
    SYNC_INTERVAL: 3000, // 3 seconds for real-time sync
    MAX_MESSAGE_LENGTH: 1000,
    
    // PWA Configuration
    APP_NAME: 'Luna Omni-Vault',
    APP_SHORT_NAME: 'Omni',
    THEME_COLOR: '#00d2ff',
    
    // Game Configuration
    GAMES: {
        SLIDING_TILE: {
            GRID_SIZE: 4,
            MOVE_ANIMATION: 300,
            SHUFFLE_MOVES: 100
        },
        MEMORY_MATCH: {
            PAIRS: 8,
            CARD_FLIP_ANIMATION: 400,
            ICONS: ['◆', '●', '■', '▲', '★', '♦', '♥', '♠']
        },
        MATH_CHALLENGE: {
            SECRET_CODE: '9999999999',
            DIFFICULTY: 'medium',
            TIME_LIMIT: 60
        }
    },
    
    // Bot Commands
    BOT_COMMANDS: {
        STATUS: '/status',
        TEST: '/test', 
        HELP: '/help',
        CLEAR: '/clear',
        WHO: '/who',
        TIME: '/time',
        ENCRYPT: '/encrypt',
        DECRYPT: '/decrypt'
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LUNA_CONFIG;
}