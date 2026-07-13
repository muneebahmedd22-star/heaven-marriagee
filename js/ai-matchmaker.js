(function() {
  // 1. Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .ai-chat-widget {
      position: fixed;
      bottom: 90px;
      right: 30px;
      width: 380px;
      height: 520px;
      background: var(--white, #fff);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border: 2px solid var(--accent-color, #D4AF37);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .ai-chat-widget.active {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
    .ai-chat-header {
      background: var(--primary-color, #6B0000);
      color: #fff;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid var(--accent-color, #D4AF37);
    }
    .ai-chat-title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ai-chat-status-dot {
      width: 8px;
      height: 8px;
      background: #20ba5a;
      border-radius: 50%;
      box-shadow: 0 0 8px #20ba5a;
      animation: pulse-dot 1.5s infinite;
    }
    @keyframes pulse-dot {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }
    .ai-chat-header h4 {
      margin: 0;
      font-size: 1rem;
      font-family: var(--font-headings, inherit);
      color: var(--accent-color, #D4AF37);
    }
    .ai-chat-header p {
      margin: 2px 0 0 0;
      font-size: 0.75rem;
      color: #FAF7F2;
      opacity: 0.8;
    }
    .ai-chat-close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .ai-chat-close-btn:hover {
      color: var(--accent-color, #D4AF37);
    }
    .ai-chat-messages {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background: #FAF7F2;
    }
    .ai-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      line-height: 1.5;
      font-family: var(--font-body, inherit);
    }
    .ai-message.bot {
      background: #fff;
      color: var(--dark-text, #333);
      align-self: flex-start;
      border-left: 3px solid var(--accent-color, #D4AF37);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .ai-message.user {
      background: var(--primary-color, #6B0000);
      color: #fff;
      align-self: flex-end;
      box-shadow: 0 2px 5px rgba(107, 0, 0, 0.15);
    }
    .ai-chat-input-area {
      padding: 15px;
      background: #fff;
      border-top: 1px solid var(--border-muted, #ddd);
      display: flex;
      gap: 10px;
    }
    .ai-chat-input-area input {
      flex-grow: 1;
      border: 1px solid var(--accent-color, #D4AF37);
      border-radius: 4px;
      padding: 10px 15px;
      outline: none;
      font-size: 0.9rem;
    }
    .ai-chat-send-btn {
      background: var(--primary-color, #6B0000);
      border: 1px solid var(--accent-color, #D4AF37);
      color: var(--accent-color, #D4AF37);
      padding: 0 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: var(--transition);
    }
    .ai-chat-send-btn:hover {
      background: var(--accent-color, #D4AF37);
      color: var(--primary-color, #6B0000);
    }
    /* Toggle Floating Button */
    .ai-chat-toggle {
      position: fixed;
      bottom: 25px;
      right: 30px;
      width: 55px;
      height: 55px;
      background: var(--primary-color, #6B0000);
      border: 2px solid var(--accent-color, #D4AF37);
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9998;
      transition: all 0.3s ease;
      color: var(--accent-color, #D4AF37);
    }
    .ai-chat-toggle:hover {
      transform: scale(1.08);
      background: var(--accent-color, #D4AF37);
      color: var(--primary-color, #6B0000);
    }
    .ai-chat-toggle svg {
      width: 26px;
      height: 26px;
    }
    /* Typing indicator */
    .bot-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 12px 16px;
      background: #fff;
      align-self: flex-start;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      border-left: 3px solid var(--accent-color, #D4AF37);
    }
    .bot-typing span {
      width: 8px;
      height: 8px;
      background: var(--accent-color, #D4AF37);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .bot-typing span:nth-child(1) { animation-delay: -0.32s; }
    .bot-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    /* Guided Prompt Chips */
    .ai-prompt-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 5px;
    }
    .prompt-chip {
      background: rgba(107, 0, 0, 0.05);
      border: 1px solid var(--accent-color, #D4AF37);
      color: var(--primary-color, #6B0000);
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .prompt-chip:hover {
      background: var(--primary-color, #6B0000);
      color: var(--accent-color, #D4AF37);
    }
    /* Mini Proposal Card inside Chat */
    .ai-mini-proposal-card {
      border: 1px solid var(--accent-color, #D4AF37);
      border-radius: 6px;
      background: #fff;
      padding: 10px;
      margin-top: 10px;
      box-shadow: var(--shadow-sm);
    }
    .ai-mini-card-header {
      font-weight: bold;
      color: var(--primary-color, #6B0000);
      margin-bottom: 5px;
      font-size: 0.85rem;
      border-bottom: 1px dashed var(--border-muted, #ccc);
      padding-bottom: 3px;
    }
    .ai-mini-card-body {
      font-size: 0.8rem;
      color: var(--dark-text, #333);
      line-height: 1.4;
      margin-bottom: 8px;
    }
    .ai-mini-card-chat-btn {
      display: block;
      background: #25D366;
      color: white;
      text-align: center;
      text-decoration: none;
      font-weight: bold;
      font-size: 0.8rem;
      padding: 6px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .ai-mini-card-chat-btn:hover {
      background: #128C7E;
    }
    @media (max-width: 480px) {
      .ai-chat-widget {
        width: 320px;
        right: 15px;
        bottom: 85px;
        height: 450px;
      }
      .ai-chat-toggle {
        right: 15px;
        bottom: 15px;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Inject HTML
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <!-- Floating Circle Button -->
    <div class="ai-chat-toggle" id="ai-chat-toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>

    <!-- Chat Widget Window -->
    <div class="ai-chat-widget" id="ai-chat-widget">
      <div class="ai-chat-header">
        <div class="ai-chat-title-wrapper">
          <div class="ai-chat-status-dot"></div>
          <div>
            <h4>HMB AI Matchmaker</h4>
            <p>Active Assistant</p>
          </div>
        </div>
        <button class="ai-chat-close-btn" id="ai-chat-close">&times;</button>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages">
        <!-- Message bubbles appended here -->
      </div>
      <div class="ai-chat-input-area">
        <input type="text" id="ai-chat-input" placeholder="Type here..." autocomplete="off">
        <button class="ai-chat-send-btn" id="ai-chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 3. Controller Logic
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-chat-close');
  const widget = document.getElementById('ai-chat-widget');
  const messagesArea = document.getElementById('ai-chat-messages');
  const inputEl = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');

  let userName = "";
  let currentStep = "greeting"; // greeting -> name -> chat

  toggleBtn.addEventListener('click', () => {
    widget.classList.toggle('active');
    if (widget.classList.contains('active') && messagesArea.children.length === 0) {
      triggerBotGreeting();
    }
  });

  closeBtn.addEventListener('click', () => {
    widget.classList.remove('active');
  });

  const getGreetingByTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const triggerBotGreeting = () => {
    const timeGreeting = getGreetingByTime();
    appendBotMessage(`Assalam-o-Alaikum & ${timeGreeting}! Welcome to Heaven Marriage Bureau. I am your AI Matchmaker Assistant. 🌟`);
    setTimeout(() => {
      appendBotMessage("May I know your name to assist you better?");
      currentStep = "name";
    }, 1000);
  };

  const appendBotMessage = (text) => {
    const bubble = document.createElement('div');
    bubble.className = 'ai-message bot';
    bubble.textContent = text;
    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  const appendUserMessage = (text) => {
    const bubble = document.createElement('div');
    bubble.className = 'ai-message user';
    bubble.textContent = text;
    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  const appendBotTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'bot-typing';
    indicator.id = 'bot-typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messagesArea.appendChild(indicator);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  const removeBotTypingIndicator = () => {
    const indicator = document.getElementById('bot-typing-indicator');
    if (indicator) indicator.remove();
  };

  const getGenderSuffix = (name) => {
    const lower = name.toLowerCase();
    const femaleEndings = ['a', 'i', 'e', 'n', 'sh', 'ra', 'ma', 'ab', 'am', 'y'];
    const femaleNames = ['alisha', 'fatima', 'ayesha', 'zainab', 'maryam', 'kiran', 'saira', 'zarnab', 'zareena', 'alina', 'anum', 'sidra', 'iqra', 'amna', 'sana', 'komal', 'hina', 'saba', 'bushra', 'nadia', 'maria', 'hadiqa', 'uzma', 'fiza', 'tayyaba'];
    
    if (femaleNames.includes(lower)) return 'Sahiba';
    
    const lastChar = lower.slice(-1);
    const lastTwo = lower.slice(-2);
    if (femaleEndings.includes(lastChar) || femaleEndings.includes(lastTwo)) {
      return 'Sahiba';
    }
    
    return 'Sahib';
  };

  const appendGuidedChips = (category = 'primary') => {
    const chipWrapper = document.createElement('div');
    chipWrapper.className = 'ai-prompt-chips';
    
    let prompts = [];
    if (category === 'primary') {
      prompts = [
        { text: "🤵 Look for Groom (Dulha)", type: 'select_groom' },
        { text: "👰 Look for Bride (Dulhan)", type: 'select_bride' },
        { text: "💳 Packages & Services", query: "services and plans" },
        { text: "⭐ Read Client Reviews", query: "reviews and testimonials" }
      ];
    } else if (category === 'groom') {
      prompts = [
        { text: "🤵 Doctor Groom", query: "I need a doctor groom" },
        { text: "🤵 Engineer Groom", query: "I need an engineer groom" },
        { text: "📍 Lahore Grooms", query: "Show grooms from Lahore" },
        { text: "✈️ Overseas Grooms", query: "Show international grooms" },
        { text: "🕰️ Late Marriage Grooms", query: "Show late marriage grooms" },
        { text: "💍 2nd Marriage Grooms", query: "Show 2nd marriage grooms" },
        { text: "⬅️ Back", type: 'select_primary' }
      ];
    } else if (category === 'bride') {
      prompts = [
        { text: "👰 Doctor Bride", query: "I need a doctor bride" },
        { text: "👰 Educated Bride", query: "I need a bachelors educated bride" },
        { text: "📍 Lahore Brides", query: "Show brides from Lahore" },
        { text: "✈️ Overseas Brides", query: "Show international brides" },
        { text: "🕰️ Late Marriage Brides", query: "Show late marriage brides" },
        { text: "💍 2nd Marriage Brides", query: "Show 2nd marriage brides" },
        { text: "⬅️ Back", type: 'select_primary' }
      ];
    }

    prompts.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'prompt-chip';
      chip.textContent = p.text;
      chip.addEventListener('click', () => {
        appendUserMessage(p.text);
        chipWrapper.remove();
        
        if (p.type === 'select_groom') {
          appendBotTypingIndicator();
          setTimeout(() => {
            removeBotTypingIndicator();
            appendBotMessage("Select a category for Groom proposals:");
            appendGuidedChips('groom');
          }, 600);
        } else if (p.type === 'select_bride') {
          appendBotTypingIndicator();
          setTimeout(() => {
            removeBotTypingIndicator();
            appendBotMessage("Select a category for Bride proposals:");
            appendGuidedChips('bride');
          }, 600);
        } else if (p.type === 'select_primary') {
          appendBotTypingIndicator();
          setTimeout(() => {
            removeBotTypingIndicator();
            appendBotMessage("How can I assist you today?");
            appendGuidedChips('primary');
          }, 600);
        } else {
          processChatMessage(p.query);
        }
      });
      chipWrapper.appendChild(chip);
    });

    messagesArea.appendChild(chipWrapper);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  const handleInputSubmit = () => {
    const val = inputEl.value.trim();
    if (!val) return;

    appendUserMessage(val);
    inputEl.value = "";

    if (currentStep === "name") {
      userName = val;
      currentStep = "chat";
      appendBotTypingIndicator();
      setTimeout(() => {
        removeBotTypingIndicator();
        appendBotMessage(`Honored to assist you, ${userName}! Let's find the perfect family match for you today.`);
        appendGuidedChips('primary');
      }, 1000);
    } else if (currentStep === "chat") {
      processChatMessage(val);
    }
  };

  const processChatMessage = async (userText) => {
    appendBotTypingIndicator();
    
    try {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const apiUrl = isLocal 
        ? 'http://localhost:5000/api/v1/proposals/ai-matchmaker'
        : 'https://heaven-marriagee.onrender.com/api/v1/proposals/ai-matchmaker';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, name: userName })
      });
      
      const resObj = await response.json();
      removeBotTypingIndicator();

      if (resObj.success && resObj.type === 'lead_registered') {
        appendBotMessage(resObj.message);
        appendGuidedChips('primary');
        return;
      }

      if (resObj.success && resObj.type === 'request_phone') {
        appendBotMessage(resObj.message);
        return;
      }

      if (resObj.success && resObj.type === 'faq') {
        appendBotMessage(resObj.message);
        appendGuidedChips('primary');
        return;
      }

      if (resObj.success && resObj.data && resObj.data.length > 0) {
        if (resObj.fallback) {
          appendBotMessage(`We couldn't find exact matches for all filters, but here are some highly compatible matches matching your caste/city:`);
        } else {
          appendBotMessage(`Great news! Our AI found ${resObj.data.length} match(es) for you:`);
        }

        resObj.data.forEach(p => {
          const birthYear = new Date(p.dob).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          
          const card = document.createElement('div');
          card.className = 'ai-mini-proposal-card';
          card.innerHTML = `
            <div class="ai-mini-card-header">ID: ${p.profileId} - ${p.gender === 'Male' ? 'Groom' : 'Bride'}</div>
            <div class="ai-mini-card-body">
              <strong>Caste:</strong> ${p.caste} | <strong>City:</strong> ${p.city}<br>
              <strong>Education:</strong> ${p.education}<br>
              <strong>Profession:</strong> ${p.occupation || '-'} | <strong>Age:</strong> ${age} yrs
            </div>
            <a href="https://wa.me/923204048464?text=Assalam-o-Alaikum, I am inquiring about AI-recommended Profile ID ${p.profileId} on Heaven Marriage Bureau." target="_blank" class="ai-mini-card-chat-btn">
              Discuss on WhatsApp
            </a>
          `;
          messagesArea.appendChild(card);
        });
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
      } else {
        appendBotMessage("No matches were found matching your criteria. Try describing another caste, city, or profession!");
        appendGuidedChips();
      }

    } catch (error) {
      removeBotTypingIndicator();
      appendBotMessage("Apologies, I encountered an issue processing your query. Please try searching in different words.");
    }
  };

  sendBtn.addEventListener('click', handleInputSubmit);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInputSubmit();
  });

})();
