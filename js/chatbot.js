(function () {
  // 1. Inject Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .hmb-chatbot-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6B0000 0%, #a82323 100%);
      color: #D4AF37;
      border: 2px solid #D4AF37;
      box-shadow: 0 5px 25px rgba(107, 0, 0, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .hmb-chatbot-btn:hover {
      transform: scale(1.08) translateY(-3px);
      box-shadow: 0 8px 30px rgba(107, 0, 0, 0.6);
    }
    .hmb-chatbot-container {
      position: fixed;
      bottom: 105px;
      right: 30px;
      width: 370px;
      height: 520px;
      border-radius: 20px;
      background: #ffffff;
      border: 1px solid rgba(212, 175, 55, 0.2);
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      z-index: 10000;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .hmb-chatbot-container.active {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    .hmb-chatbot-header {
      background: linear-gradient(135deg, #1A0000 0%, #4A0000 100%);
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #D4AF37;
    }
    .hmb-chatbot-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hmb-chatbot-logo {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: 1px solid #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #6B0000;
      font-weight: bold;
      color: #D4AF37;
      font-size: 0.8rem;
    }
    .hmb-chatbot-title h4 {
      margin: 0;
      font-size: 0.95rem;
      color: #ffffff;
      font-family: 'Cinzel', serif;
    }
    .hmb-chatbot-title span {
      font-size: 0.7rem;
      color: #25D366;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .hmb-chatbot-title span::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #25D366;
      border-radius: 50%;
    }
    .hmb-chatbot-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      font-size: 1.2rem;
      transition: var(--transition);
    }
    .hmb-chatbot-close:hover {
      color: #D4AF37;
    }
    .hmb-chatbot-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background: #FAF8F5;
    }
    .hmb-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.88rem;
      line-height: 1.45;
    }
    .hmb-message.bot {
      background: #ffffff;
      color: #333333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.03);
    }
    .hmb-message.user {
      background: #6B0000;
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .hmb-chatbot-tags {
      padding: 10px 15px;
      background: #FAF8F5;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      white-space: nowrap;
      border-top: 1px solid rgba(0, 0, 0, 0.03);
    }
    .hmb-chatbot-tags::-webkit-scrollbar {
      height: 4px;
    }
    .hmb-chatbot-tags::-webkit-scrollbar-thumb {
      background: rgba(212, 175, 55, 0.2);
      border-radius: 2px;
    }
    .hmb-tag {
      background: #ffffff;
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      color: #6B0000;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .hmb-tag:hover {
      background: #6B0000;
      color: #ffffff;
      border-color: #6B0000;
    }
    .hmb-chatbot-input-container {
      padding: 15px;
      background: #ffffff;
      border-top: 1px solid rgba(212, 175, 55, 0.15);
      display: flex;
      gap: 10px;
    }
    .hmb-chatbot-input {
      flex: 1;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 30px;
      padding: 10px 18px;
      font-size: 0.88rem;
      outline: none;
      transition: var(--transition);
    }
    .hmb-chatbot-input:focus {
      border-color: #6B0000;
      box-shadow: 0 0 8px rgba(107,0,0,0.1);
    }
    .hmb-chatbot-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #6B0000;
      color: #D4AF37;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }
    .hmb-chatbot-send:hover {
      background: #D4AF37;
      color: #1A0000;
    }
    .chat-whatsapp-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #25D366;
      color: white;
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-top: 10px;
      box-shadow: 0 3px 10px rgba(37, 211, 102, 0.3);
      transition: all 0.2s ease;
    }
    .chat-whatsapp-btn:hover {
      background-color: #20ba5a;
      transform: translateY(-1px);
    }
    @media (max-width: 480px) {
      .hmb-chatbot-container {
        width: calc(100% - 40px);
        height: 480px;
        bottom: 90px;
        right: 20px;
      }
      .hmb-chatbot-btn {
        bottom: 20px;
        right: 20px;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // 2. Inject Markup
  const chatbotWrapper = document.createElement('div');
  chatbotWrapper.innerHTML = `
    <button class="hmb-chatbot-btn" id="chatbot-toggle" aria-label="Toggle AI Chatbot">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div class="hmb-chatbot-container" id="chatbot-box">
      <div class="hmb-chatbot-header">
        <div class="hmb-chatbot-header-info">
          <div class="hmb-chatbot-logo">AI</div>
          <div class="hmb-chatbot-title">
            <h4>HMB Matchmaker</h4>
            <span>Online | AI Assistant</span>
          </div>
        </div>
        <button class="hmb-chatbot-close" id="chatbot-close">&times;</button>
      </div>
      
      <div class="hmb-chatbot-messages" id="chatbot-messages">
        <div class="hmb-message bot">
          Assalam-o-Alaikum! Welcome to Heaven Marriage Bureau's AI Assistant. How can I help you find your life partner today?
          <br><br>
          Feel free to write in <strong>Roman Urdu</strong> or <strong>English</strong> (e.g. <em>"Lahore shia doctor rishta"</em> or <em>"larki ka rishta chahiye rawalpindi se"</em>).
        </div>
      </div>

      <div class="hmb-chatbot-tags">
        <span class="hmb-tag" data-query="Lahore Doctor larki">Lahore Doctor Bride</span>
        <span class="hmb-tag" data-query="Karachi Engineer larka">Karachi Engineer Groom</span>
        <span class="hmb-tag" data-query="Shia rishta">Ahle Tashi Matches</span>
        <span class="hmb-tag" data-query="Overseas rishta">Overseas Proposals</span>
      </div>

      <div class="hmb-chatbot-input-container">
        <input type="text" class="hmb-chatbot-input" id="chatbot-input" placeholder="Type a message..." />
        <button class="hmb-chatbot-send" id="chatbot-send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(chatbotWrapper);

  // 3. Elements and Listeners
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const chatBox = document.getElementById('chatbot-box');
  const chatMessages = document.getElementById('chatbot-messages');
  const chatInput = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const tags = document.querySelectorAll('.hmb-tag');

  // Load API base path
  const apiBase = window.HMB_API_URL || 'https://heaven-marriage-bureau-backend.onrender.com/api/v1';

  // Toggle Visibility
  toggleBtn.addEventListener('click', () => {
    chatBox.classList.toggle('active');
    chatInput.focus();
  });

  closeBtn.addEventListener('click', () => {
    chatBox.classList.remove('active');
  });

  // Handle send message
  async function handleSendMessage(text) {
    if (!text.trim()) return;

    // Append User Message
    appendMessage(text, 'user');
    chatInput.value = '';

    // Append Loading State
    const loadingId = appendMessage('Searching matches...', 'bot');

    try {
      const response = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      
      // Remove loading message
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      if (data.success) {
        // Render bot response with markdown formatting support
        appendFormattedMessage(data.reply, 'bot');
      } else {
        appendMessage('Sorry, I encountered an issue checking the database. Please try again.', 'bot');
      }
    } catch (err) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      appendMessage('Unable to connect to AI server. Please try contacting support directly.', 'bot');
    }
  }

  function appendMessage(text, sender) {
    const msgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const msgEl = document.createElement('div');
    msgEl.className = `hmb-message ${sender}`;
    msgEl.id = msgId;
    msgEl.innerHTML = text;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgId;
  }

  function appendFormattedMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = `hmb-message ${sender}`;
    
    // Simple markdown formatting (*bold*, \n lists, links)
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
      
    msgEl.innerHTML = formatted;

    // Append WhatsApp support CTA inside the bot response card
    const whatsappCTA = document.createElement('a');
    whatsappCTA.href = 'https://wa.me/923204048464?text=Assalam-o-Alaikum, I want to inquire about matched profiles shown by AI.';
    whatsappCTA.target = '_blank';
    whatsappCTA.className = 'chat-whatsapp-btn';
    whatsappCTA.innerHTML = `
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="vertical-align: middle;">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.945 9.945 0 0 0 4.777 1.224h.005c5.505 0 9.99-4.478 9.99-9.985 0-2.67-1.037-5.178-2.92-7.062C17.162 2.922 14.654 2 12.012 2zm5.727 14.072c-.314.888-1.543 1.637-2.13 1.722-.529.076-1.222.137-3.52-.816-2.936-1.218-4.836-4.218-4.983-4.417-.147-.197-1.184-1.579-1.184-3.013 0-1.433.748-2.137 1.015-2.423.267-.285.586-.356.782-.356.197 0 .393.002.563.01.18.009.421-.07.659.502.247.595.842 2.062.915 2.211.072.148.12.321.02.522-.097.2-.147.324-.294.496-.147.172-.31.385-.441.517-.148.147-.302.308-.13.603.172.295.767 1.266 1.644 2.049.88.784 1.62 1.025 1.915 1.173.295.148.466.12.639-.08.172-.2.748-.871.947-1.17.2-.298.397-.248.663-.148.267.1.1.92 2.052 1.947c.2.1.332.148.482.397.149.248.149 1.432-.165 2.32z"/>
      </svg> Ask Matchmaker
    `;
    msgEl.appendChild(whatsappCTA);

    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Trigger send on click / Enter
  sendBtn.addEventListener('click', () => handleSendMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendMessage(chatInput.value);
  });

  // Tag clicks
  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      handleSendMessage(tag.getAttribute('data-query'));
    });
  });

})();
