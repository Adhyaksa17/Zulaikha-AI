// =============================================
// ZULAIKHA AI — Islamic AI Assistant Application
// =============================================

const CONFIG = {
    API_KEY: null,
    API_KEY: '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',
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',//
    MODEL: 'llama-3.3-70b-versatile',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.8,
    USER_NAME: 'DANA',
    AI_NAME: 'Zulaikha',
    SYSTEM_PROMPT: `Kamu adalah Zulaikha, seorang asisten AI muslimah yang baik, cerdas, sholehah, dan penuh kasih sayang. Berikut adalah karakteristik dan aturan kamu:

IDENTITAS & KEPRIBADIAN:
- Nama kamu adalah Zulaikha, seorang wanita muslimah yang baik dan sholehah
- Kamu selalu sopan, lembut, dan penuh hikmah dalam berbicara
- Kamu SELALU memanggil pengguna dengan nama "DANA" (tanpa pengecualian)
- Kamu menggunakan sapaan "antum" untuk menyapa DANA
- Kamu menyebut diri sendiri sebagai "ana" (saya dalam bahasa Arab informal)
- Kamu suka menyisipkan kata-kata Islami seperti "Insya Allah", "Masyaa Allah", "Barakallahu fiik", "Alhamdulillah", dll secara natural
- Kamu kadang-kadang menyisipkan ayat Al-Quran atau hadits yang relevan dengan pembahasan
- Kamu memulai percakapan baru dengan salam "Assalamu'alaikum"
- Kamu menutup dengan doa atau harapan baik

KEAHLIAN UTAMA — PEMBUATAN SKRIPSI:
- Kamu adalah ahli dalam membantu pembuatan skripsi, tesis, dan karya ilmiah
- Kamu memahami struktur skripsi Indonesia: BAB I (Pendahuluan), BAB II (Tinjauan Pustaka/Kajian Teori), BAB III (Metodologi Penelitian), BAB IV (Hasil dan Pembahasan), BAB V (Penutup/Kesimpulan dan Saran)
- Kamu bisa membantu: membuat outline, menulis setiap bab, memilih metodologi, parafrase, membuat abstrak, merapikan daftar pustaka, dll
- Kamu memberikan contoh yang konkret dan detail
- Kamu memahami format penulisan akademik Indonesia (APA, IEEE, dll)
- Kamu bisa membantu analisis data kualitatif maupun kuantitatif

GAYA BAHASA:
- Gunakan bahasa Indonesia yang baik, baku, dan mudah dipahami
- Untuk penulisan skripsi, gunakan bahasa formal akademik
- Untuk percakapan biasa, gunakan bahasa yang hangat dan bersahabat
- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup (🌙✨📚💡)
- Format jawaban dengan markdown yang rapi: gunakan heading, bullet points, numbering, bold, italic untuk memudahkan pembacaan
- Untuk konten panjang, bagi menjadi bagian-bagian yang terstruktur

ATURAN PENTING:
- SELALU panggil pengguna dengan "DANA" 
- Jika ditanya tentang hal yang bertentangan dengan nilai Islam, tolak dengan sopan dan berikan alternatif yang Islami
- Jangan pernah mengaku sebagai manusia, tapi tetap tunjukkan kehangatan
- Berikan jawaban yang komprehensif, detail, dan bermanfaat
- Jika tidak yakin dengan suatu informasi, katakan dengan jujur dan sarankan untuk memverifikasi`,
};

// === State ===
let chatHistory = [];
let conversations = [];
let currentConversationId = null;
let isStreaming = false;

// === Ayat-ayat untuk sidebar ===
const AYAT_COLLECTION = [
    {
        arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: '"Sesungguhnya bersama kesulitan ada kemudahan."',
        source: 'QS. Al-Insyirah: 6'
    },
    {
        arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        translation: '"Dan katakanlah: Ya Tuhanku, tambahkanlah ilmu kepadaku."',
        source: 'QS. Thaha: 114'
    },
    {
        arabic: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ',
        translation: '"Kemudian apabila kamu telah membulatkan tekad, maka bertawakkallah kepada Allah."',
        source: 'QS. Ali Imran: 159'
    },
    {
        arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
        translation: '"Allah akan meninggikan orang-orang yang beriman dan berilmu pengetahuan beberapa derajat."',
        source: 'QS. Al-Mujadilah: 11'
    },
    {
        arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
        translation: '"Barangsiapa bertakwa kepada Allah niscaya Dia akan membukakan jalan keluar baginya."',
        source: 'QS. At-Talaq: 2'
    },
    {
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
        translation: '"Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat."',
        source: 'QS. Al-Baqarah: 201'
    },
    {
        arabic: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ',
        translation: '"Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa."',
        source: 'QS. Al-Maidah: 2'
    },
    {
        arabic: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
        translation: '"Sesungguhnya Allah tidak menyia-nyiakan pahala orang-orang yang berbuat baik."',
        source: 'QS. At-Taubah: 120'
    }
];

// === DOM Elements ===
const elements = {
    chatArea: document.getElementById('chatArea'),
    messagesContainer: document.getElementById('messagesContainer'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    themeToggle: document.getElementById('themeToggle'),
    exportChatBtn: document.getElementById('exportChatBtn'),
    chatHistoryList: document.getElementById('chatHistoryList'),
    toastContainer: document.getElementById('toastContainer'),
    ayatArabic: document.getElementById('ayatArabic'),
    ayatTranslation: document.getElementById('ayatTranslation'),
    ayatSource: document.getElementById('ayatSource'),
    particlesContainer: document.getElementById('particles-container'),
};

// === Initialization ===
function init() {
    loadTheme();
    loadConversations();
    showRandomAyat();
    createParticles();
    bindEvents();
    autoResizeInput();
    
    if (conversations.length === 0) {
        startNewConversation(false);
    } else {
        const last = conversations[conversations.length - 1];
        loadConversation(last.id);
    }
    
    renderChatHistory();
}

// === Particles ===
function createParticles() {
    const container = elements.particlesContainer;
    const count = 20;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 15;
        const isGold = Math.random() > 0.6;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            background: ${isGold ? 'rgba(245, 208, 96, 0.4)' : 'rgba(34, 197, 94, 0.3)'};
            animation-duration: ${duration}s;
            animation-delay: -${delay}s;
            box-shadow: 0 0 ${size * 3}px ${isGold ? 'rgba(245, 208, 96, 0.2)' : 'rgba(34, 197, 94, 0.15)'};
        `;
        
        container.appendChild(particle);
    }
}

// === Ayat ===
function showRandomAyat() {
    const ayat = AYAT_COLLECTION[Math.floor(Math.random() * AYAT_COLLECTION.length)];
    elements.ayatArabic.textContent = ayat.arabic;
    elements.ayatTranslation.textContent = ayat.translation;
    elements.ayatSource.textContent = ayat.source;
}

// === Theme ===
function loadTheme() {
    const saved = localStorage.getItem('zulaikha-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('zulaikha-theme', next);
    showToast(next === 'dark' ? '🌙 Mode gelap aktif' : '☀️ Mode terang aktif', 'success');
}

// === Conversations Management ===
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function loadConversations() {
    try {
        const saved = localStorage.getItem('zulaikha-conversations');
        conversations = saved ? JSON.parse(saved) : [];
    } catch {
        conversations = [];
    }
}

function saveConversations() {
    localStorage.setItem('zulaikha-conversations', JSON.stringify(conversations));
}

function startNewConversation(switchToIt = true) {
    const conv = {
        id: generateId(),
        title: 'Percakapan Baru',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    conversations.push(conv);
    saveConversations();
    
    if (switchToIt) {
        loadConversation(conv.id);
        renderChatHistory();
        showToast('✨ Percakapan baru dimulai. Bismillah!', 'success');
    }
}

function loadConversation(id) {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    
    currentConversationId = id;
    chatHistory = conv.messages.map(m => ({
        role: m.role,
        content: m.content,
    }));
    
    renderMessages(conv.messages);
    renderChatHistory();
}

function updateConversation() {
    const conv = conversations.find(c => c.id === currentConversationId);
    if (!conv) return;
    
    conv.messages = chatHistory.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
    }));
    
    // Update title from first user message
    const firstUserMsg = chatHistory.find(m => m.role === 'user');
    if (firstUserMsg) {
        conv.title = firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
    }
    
    conv.updatedAt = new Date().toISOString();
    saveConversations();
    renderChatHistory();
}

function deleteConversation(id) {
    conversations = conversations.filter(c => c.id !== id);
    saveConversations();
    
    if (currentConversationId === id) {
        if (conversations.length > 0) {
            loadConversation(conversations[conversations.length - 1].id);
        } else {
            startNewConversation(true);
        }
    }
    
    renderChatHistory();
    showToast('🗑️ Percakapan dihapus', 'success');
}

// === Render Chat History ===
function renderChatHistory() {
    const list = elements.chatHistoryList;
    list.innerHTML = '';
    
    const sorted = [...conversations].reverse();
    
    sorted.forEach(conv => {
        const item = document.createElement('button');
        item.className = `chat-history-item ${conv.id === currentConversationId ? 'active' : ''}`;
        item.innerHTML = `
            <svg class="history-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${escapeHTML(conv.title)}</span>
        `;
        
        item.addEventListener('click', () => loadConversation(conv.id));
        
        // Right-click to delete
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm('Hapus percakapan ini?')) {
                deleteConversation(conv.id);
            }
        });
        
        list.appendChild(item);
    });
}

// === Render Messages ===
function renderMessages(messages) {
    elements.messagesContainer.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        elements.welcomeScreen.classList.remove('hidden');
        elements.messagesContainer.classList.add('hidden');
        return;
    }
    
    elements.welcomeScreen.classList.add('hidden');
    elements.messagesContainer.classList.remove('hidden');
    
    messages.forEach(msg => {
        appendMessageToDOM(msg.role, msg.content, msg.timestamp);
    });
    
    scrollToBottom();
}

function appendMessageToDOM(role, content, timestamp) {
    const isUser = role === 'user';
    const time = timestamp ? new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    
    const avatarContent = isUser ? CONFIG.USER_NAME[0] : 'ز';
    
    msgDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-bubble ${!isUser ? 'rendered-markdown' : ''}">
                ${isUser ? escapeHTML(content) : renderMarkdown(content)}
            </div>
            <div class="message-time">${time}</div>
            ${!isUser ? `
            <div class="message-actions">
                <button class="msg-action-btn copy-btn" onclick="copyMessage(this)" title="Salin">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Salin
                </button>
            </div>` : ''}
        </div>
    `;
    
    elements.messagesContainer.appendChild(msgDiv);
}

// === Simple Markdown Renderer ===
function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || ''}">${escapeHTML(code.trim())}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Blockquote
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    
    // Unordered lists
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already in block elements
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre') && !html.startsWith('<blockquote')) {
        html = `<p>${html}</p>`;
    }
    
    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === Chat Functionality ===
async function sendMessage(content) {
    if (isStreaming || !content.trim()) return;
    
    // Hide welcome, show messages
    elements.welcomeScreen.classList.add('hidden');
    elements.messagesContainer.classList.remove('hidden');
    
    // Add user message
    const userMsg = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
    };
    
    chatHistory.push(userMsg);
    appendMessageToDOM('user', content.trim());
    scrollToBottom();
    
    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    isStreaming = true;
    elements.sendBtn.disabled = true;
    
    try {
        // Build messages for API
        const apiMessages = [
            { role: 'system', content: CONFIG.SYSTEM_PROMPT },
            ...chatHistory.map(m => ({ role: m.role, content: m.content }))
        ];
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: apiMessages,
                max_tokens: CONFIG.MAX_TOKENS,
                temperature: CONFIG.TEMPERATURE,
                stream: false,
            }),
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content || 'Maaf DANA, ana tidak bisa memproses permintaan antum saat ini. Mohon coba lagi ya. 🙏';
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI message
        const aiMsg = {
            role: 'assistant',
            content: aiContent,
            timestamp: new Date().toISOString(),
        };
        
        chatHistory.push(aiMsg);
        appendMessageToDOM('assistant', aiContent);
        scrollToBottom();
        
        // Save conversation
        updateConversation();
        
    } catch (error) {
        console.error('API Error:', error);
        removeTypingIndicator();
        
        const errorMsg = `Astaghfirullah, maaf DANA 🙏 Terjadi kesalahan: ${error.message}. Mohon coba lagi ya.`;
        appendMessageToDOM('assistant', errorMsg);
        
        chatHistory.push({
            role: 'assistant',
            content: errorMsg,
            timestamp: new Date().toISOString(),
        });
        
        updateConversation();
        showToast('❌ Gagal mengirim pesan. Silakan coba lagi.', 'error');
    } finally {
        isStreaming = false;
        elements.sendBtn.disabled = false;
        elements.messageInput.focus();
    }
}

// === Typing Indicator ===
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-avatar" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-800)); color: white; font-family: var(--font-arabic); font-size: 1.1rem; width: 36px; height: 36px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);">ز</div>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    elements.messagesContainer.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// === Scroll ===
function scrollToBottom() {
    requestAnimationFrame(() => {
        elements.chatArea.scrollTop = elements.chatArea.scrollHeight;
    });
}

// === Copy Message ===
function copyMessage(btn) {
    const bubble = btn.closest('.message-content').querySelector('.message-bubble');
    const text = bubble.innerText || bubble.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Tersalin!
        `;
        setTimeout(() => {
            btn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Salin
            `;
        }, 2000);
    }).catch(() => {
        showToast('❌ Gagal menyalin teks', 'error');
    });
}

// Make copyMessage globally accessible
window.copyMessage = copyMessage;

// === Export Chat ===
function exportChat() {
    if (chatHistory.length === 0) {
        showToast('📭 Belum ada percakapan untuk diekspor', 'error');
        return;
    }
    
    let content = `# Percakapan dengan Zulaikha AI\n`;
    content += `Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    content += `---\n\n`;
    
    chatHistory.forEach(msg => {
        const name = msg.role === 'user' ? CONFIG.USER_NAME : CONFIG.AI_NAME;
        content += `## ${name}\n${msg.content}\n\n`;
    });
    
    content += `\n---\n*Diekspor dari Zulaikha AI - Asisten Muslimah Cerdas*`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zulaikha-chat-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('✅ Percakapan berhasil diekspor!', 'success');
}

// === Toast ===
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// === Auto Resize Input ===
function autoResizeInput() {
    const input = elements.messageInput;
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    });
}

// === Event Bindings ===
function bindEvents() {
    // Send message
    elements.sendBtn.addEventListener('click', () => {
        sendMessage(elements.messageInput.value);
    });
    
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(elements.messageInput.value);
        }
    });
    
    // New chat
    elements.newChatBtn.addEventListener('click', () => {
        startNewConversation(true);
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Export
    elements.exportChatBtn.addEventListener('click', exportChat);
    
    // Mobile sidebar
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.sidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('active');
    });
    
    elements.sidebarOverlay.addEventListener('click', () => {
        elements.sidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('active');
    });
    
    // Quick action cards
    document.querySelectorAll('.quick-action-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            if (prompt) sendMessage(prompt);
        });
    });
    
    // Feature buttons
    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            if (prompt) {
                // Close mobile sidebar if open
                elements.sidebar.classList.remove('open');
                elements.sidebarOverlay.classList.remove('active');
                sendMessage(prompt);
            }
        });
    });
    
    // Attach button (paste long text)
    elements.attachBtn.addEventListener('click', () => {
        const textarea = elements.messageInput;
        textarea.focus();
        textarea.placeholder = 'Tempelkan teks panjang di sini (Ctrl+V)...';
        showToast('📋 Silakan tempel (paste) teks yang ingin diproses', 'success');
    });
    
    // Rotate ayat every 30 seconds
    setInterval(showRandomAyat, 30000);
}

// === Start Application ===
document.addEventListener('DOMContentLoaded', init);
