const LunaBot = {
    name: "Luna Alpha (AI)",
    status: "Always Online",
    responses: {
        "hello": "Vault connection verified. Secure bridge active.",
        "status": "All systems operational. 5TB buffer ready.",
        "admin": "Admin privileges detected. Panel unlocked for Mahir."
    }
};

function injectBot() {
    const contactList = document.getElementById('contact-list');
    const botItem = document.createElement('div');
    botItem.className = 'contact-item active';
    botItem.innerHTML = `
        <div class="pulse-dot online"></div>
        <div class="contact-info">
            <p>${LunaBot.name}</p>
            <span>${LunaBot.status}</span>
        </div>
    `;
    contactList.appendChild(botItem);
}

// Search Logic
document.getElementById('search-trigger').onclick = () => {
    document.getElementById('partner-search').classList.toggle('active');
};