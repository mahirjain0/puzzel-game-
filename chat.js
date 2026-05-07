let isVaultConnected = false;

const LunaBot = {
    id: "BOT_001",
    name: "Luna Alpha (AI)",
    status: "Always Online",
    greet: () => "Vault connection stable. I am monitoring the 5TB bridge.",
    process: (msg) => {
        const query = msg.toLowerCase();
        if (query.includes("status")) return `System healthy. Version ${LUNA_CONFIG.VERSION} active.`;
        if (query.includes("admin")) return "Admin panel is restricted to the primary Gmail signature.";
        return "Message encrypted and relayed to the stealth buffer.";
    }
};

// Real-time Search Logic
document.getElementById('partner-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const contacts = document.querySelectorAll('.contact-item');
    contacts.forEach(c => {
        const name = c.querySelector('p').innerText.toLowerCase();
        c.style.display = name.includes(term) ? 'flex' : 'none';
    });
});

// The Online Pulse
function startConnectionPulse() {
    const dot = document.querySelector('.status-dot');
    setInterval(() => {
        dot.style.boxShadow = isVaultConnected ? "0 0 15px #34c759" : "0 0 5px #ff3b30";
    }, 2000);
}