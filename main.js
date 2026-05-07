let pressTimer;
const gate = document.getElementById('secret-gate');

// SECRET TRIGGER: 5-Second Long Press
gate.addEventListener('mousedown', () => {
    pressTimer = window.setTimeout(() => {
        openVault(); // The magic happens here
    }, 5000);
});

gate.addEventListener('mouseup', () => clearTimeout(pressTimer));

function openVault() {
    // 1. Hide the Puzzle
    document.getElementById('puzzle-view').style.display = 'none';
    
    // 2. Show the Vault
    const vault = document.getElementById('vault-view');
    vault.classList.remove('hidden-screen');
    vault.style.display = 'flex';
    
    // 3. Initialize the Bot & 5TB Drive
    console.log("Vault Unlocked by Supreme Admin");
    initGoogleAuth(); // Starts your login popup
}