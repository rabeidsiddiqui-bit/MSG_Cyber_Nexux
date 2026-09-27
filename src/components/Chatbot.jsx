import { useState, useEffect, useRef } from 'react';
import { Bot, User, X, Send, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import chatbotData from '../data/chatbot.json';
import defaultMarkets from '../data/markets.json';
import defaultProduce from '../data/produce.json';

/**
 * Helper to detect language script (Urdu, Roman Urdu, or English)
 */
function detectLanguage(input) {
  if (!input) return 'en';
  if (/[\u0600-\u06FF]/.test(input)) return 'ur';
  const romanUrduWords = [
    'kya', 'hai', 'hain', 'kahan', 'kab', 'batao', 'bataen', 'bataiye', 'rates', 'rate',
    'kitna', 'kitne', 'kaise', 'kese', 'mein', 'bazaar', 'bazar', 'aam', 'tamatar',
    'chahiye', 'bhai', 'shukriya', 'salam', 'karna', 'hoga', 'walay', 'wali', 'kholo',
    'khulti', 'band', 'waqt', 'subah', 'shaam', 'aaj', 'kal', 'itwar', 'somwar',
    'mandi', 'sabzi', 'phal', 'bolein', 'poocho', 'karachi', 'lao', 'kitnay', 'milta',
    'milti', 'hota', 'hoti', 'acha', 'theek', 'shukria', 'janab', 'sir'
  ];
  const words = input.toLowerCase().split(/[^a-zA-Z]+/);
  if (words.some(w => romanUrduWords.includes(w))) return 'roman';
  return 'en';
}

/**
 * RELEVANCE CHECK:
 * The FreshFind chatbot should ONLY answer questions related to the purpose
 * of FreshFind and its market/produce information.
 * Any unrelated questions (e.g. "What is FTECH?", general trivia, coding) are rejected.
 */
function isRelevantFreshFindQuery(query, markets = [], produceList = []) {
  const q = query.toLowerCase().trim();

  // 1. Greetings & Bot Identity
  const greetingKeywords = [
    'hi', 'hello', 'hey', 'salam', 'assalam', 'aoa', 'morning', 'evening',
    'who are you', 'what are you', 'help', 'what can you do', 'freshbot', 'freshfind',
    'kese ho', 'kaise ho', 'shukriya', 'thanks', 'thank you'
  ];
  if (greetingKeywords.some(k => q.includes(k))) {
    return true;
  }

  // 2. Markets, Mandis, Bazaars, Locations & Timings
  const marketKeywords = [
    'market', 'mandi', 'bazaar', 'bazar', 'stall', 'vendor', 'shop', 'store',
    'near me', 'nearby', 'closest', 'location', 'area', 'address', 'where', 'direction',
    'open', 'close', 'timing', 'time', 'hours', 'schedule', 'day', 'days',
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'weekend', 'today',
    'karachi', 'lahore', 'islamabad', 'saddar', 'clifton', 'highway', 'dha',
    'gulshan', 'liaquatabad', 'jodia', 'model town', 'h9', 'h-9', 'kahan', 'kab'
  ];
  if (marketKeywords.some(k => q.includes(k))) {
    return true;
  }

  // 3. Produce, Crops, Prices, Seasons & Farming
  const produceKeywords = [
    'produce', 'fruit', 'fruits', 'vegetable', 'vegetables', 'crop', 'crops',
    'rate', 'rates', 'price', 'prices', 'cost', 'qimat', 'bhav', 'cheap', 'expensive',
    'fresh', 'organic', 'farm', 'harvest', 'season', 'seasonal', 'summer', 'winter', 'spring', 'autumn',
    'tomato', 'tomatoes', 'tamatar', 'mango', 'mangoes', 'aam', 'sindhri', 'chaunsa',
    'apple', 'apples', 'seb', 'spinach', 'palak', 'okra', 'bhindi', 'chilli', 'chillies', 'mirch',
    'guava', 'amrood', 'orange', 'oranges', 'kinnow', 'egg', 'eggs', 'anda', 'ande',
    'honey', 'shehad', 'ghee', 'makhan', 'butter', 'kale', 'bread', 'sourdough', 'dairy'
  ];
  if (produceKeywords.some(k => q.includes(k))) {
    return true;
  }

  // 4. FreshFind Features (Saved, Bookmarks, Notes, Download)
  const featureKeywords = [
    'bookmark', 'favorite', 'save', 'saved', 'basket', 'download', 'notes', 'login', 'signup', 'contact',
    'book', 'booking', 'appointment', 'schedule visit', 'visit', 'reserve', 'slot', 'book a visit', 'appoint'
  ];
  if (featureKeywords.some(k => q.includes(k))) {
    return true;
  }

  // 5. Dynamic Check against Market Names / Produce Names
  const matchMarketName = markets.some(m => q.includes(m.name.toLowerCase()) || q.includes(m.area.toLowerCase()));
  if (matchMarketName) return true;

  const matchProduceName = produceList.some(p => q.includes(p.name.toLowerCase()));
  if (matchProduceName) return true;

  // Otherwise, the query is unrelated
  return false;
}

export default function Chatbot({
  onNavigate,
  onSelectMarket,
  onSelectProduce,
  onOpenBookmarks,
  markets = defaultMarkets,
  produceList = defaultProduce
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: chatbotData.botInfo.welcomeMessage,
      action: null,
      time: 'Just now'
    }
  ]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProactiveBubble(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, isOpen]);

  /**
   * Main Question Answering Logic
   */
  function findReply(userQuery) {
    const q = userQuery.toLowerCase().trim();
    const lang = detectLanguage(q);

    // ========================================================
    // REQUIREMENT: RESTRICT CHATBOT TO FRESHFIND / MARKET INFO
    // ========================================================
    const isRelevant = isRelevantFreshFindQuery(q, markets, produceList);

    if (!isRelevant) {
      // Unrelated question handler — clearly shows the 3 main things FreshBot can help with
      return {
        text: "❌ Sorry, I can only help with FreshFind topics.\n\nHere are the 3 things I can help you with:\n\n🏪 1. Markets & Bazaars\n   • Locations, timings & areas\n   • Markets open on specific days\n\n🍅 2. Fresh Produce & Prices\n   • Where to find fruits & vegetables\n   • Seasonal crops & harvest info\n   • Daily market rates\n\n📆 3. Book a Market Visit\n   • Reserve a time slot at any market\n   • Free booking, no registration needed\n\nTry asking: 'Which markets are open Sunday?' or 'How to book a visit?'",
        action: {
          label: 'Explore Market Directory',
          page: 'markets'
        }
      };
    }

    // ========================================================
    // SMART RELEVANT QUERY HANDLERS
    // ========================================================

    // 1. "Which markets are near me?" / "nearest market"
    if (q.includes('near me') || q.includes('nearby') || q.includes('closest') || q.includes('near')) {
      return {
        text: "Here are popular verified farmers markets across Karachi:\n\n1. Empress Market (Saddar, Karachi)\n2. Sunday Bachat Bazaar (Clifton, Karachi)\n3. Gulshan-e-Iqbal Sunday Market (Block 13-D)\n4. DHA Sunday Farmers Market (Phase 8)\n5. New Sabzi Market (Super Highway M-9)\n\nYou can use our Market Directory to sort markets by closest distance using GPS!",
        action: {
          label: 'Find Markets Near You',
          page: 'markets'
        }
      };
    }

    // 2. "Where can I find [produce]?" e.g., tomatoes, mangoes, palak, apples, eggs
    const produceMatch = produceList.find(p => {
      const pName = p.name.toLowerCase();
      const pId = p.id.toLowerCase();
      return (
        q.includes(pName) ||
        q.includes(pId) ||
        (q.includes('tomato') && pId.includes('tomato')) ||
        (q.includes('mango') && pId.includes('mango')) ||
        (q.includes('palak') && pId.includes('palak')) ||
        (q.includes('spinach') && pId.includes('palak')) ||
        (q.includes('apple') && pId.includes('apple')) ||
        (q.includes('bhindi') && pId.includes('bhindi')) ||
        (q.includes('okra') && pId.includes('bhindi')) ||
        (q.includes('egg') && pId.includes('egg')) ||
        (q.includes('honey') && pId.includes('honey')) ||
        (q.includes('ghee') && pId.includes('ghee')) ||
        (q.includes('guava') && pId.includes('guava'))
      );
    });

    if (produceMatch && (q.includes('where') || q.includes('find') || q.includes('kahan') || q.includes('available') || q.includes('buy') || q.includes('get'))) {
      const carryingMarkets = markets.filter(m => (produceMatch.markets || []).includes(m.id));
      const marketLines = carryingMarkets
        .map(m => `• ${m.name} (${m.area})`)
        .join('\n');

      return {
        text: `You can find fresh ${produceMatch.name} (${produceMatch.estimatedPrice}) at these markets:\n\n${marketLines || 'Available at Empress Market Saddar and Clifton Bachat Bazaar.'}\n\nTypical Season: ${produceMatch.season}.`,
        action: {
          label: `View ${produceMatch.name} in Catalog`,
          page: 'produce'
        }
      };
    }

    // 3. "Which markets are open on [day]?"
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const matchedDay = dayNames.find(d => q.includes(d.toLowerCase()) || (d === 'Sunday' && q.includes('itwar')));

    if (matchedDay && (q.includes('open') || q.includes('bazaar') || q.includes('market') || q.includes('which') || q.includes('mandi') || q.includes('kab'))) {
      const openOnDay = markets.filter(m => m.operatingDays && m.operatingDays.includes(matchedDay));
      const list = openOnDay
        .map(m => `• ${m.name} (${m.area}) - ${m.scheduleDetails ? m.scheduleDetails[matchedDay] || m.hoursDisplay : m.hoursDisplay}`)
        .join('\n');

      return {
        text: `Here are the markets open on ${matchedDay}:\n\n${list}\n\nUse our Directory filters to view details and stalls.`,
        action: {
          label: `Filter ${matchedDay} Markets`,
          page: 'markets'
        }
      };
    }

    // 4. "What produce is available in a particular season?" e.g., summer, winter, spring, autumn
    const seasonNames = ['Summer', 'Winter', 'Spring', 'Autumn'];
    const matchedSeason = seasonNames.find(s => q.includes(s.toLowerCase()));

    if (matchedSeason && (q.includes('season') || q.includes('produce') || q.includes('available') || q.includes('fruit') || q.includes('vegetable') || q.includes('crop') || q.includes('what'))) {
      const inSeason = produceList.filter(p => p.season === matchedSeason || p.season.includes(matchedSeason) || p.season === 'All Year');
      const itemsList = inSeason
        .map(p => `• ${p.icon} ${p.name} (${p.category}) - ${p.estimatedPrice}`)
        .join('\n');

      return {
        text: `Here is the fresh produce typically available in ${matchedSeason}:\n\n${itemsList}\n\nVisit our Seasonal Harvest Recommendations for health benefits and storage tips!`,
        action: {
          label: `Explore ${matchedSeason} Picks`,
          page: 'seasonal'
        }
      };
    }

    // 5. "Which market is in a particular area?" e.g. Gulshan, Clifton, Saddar, DHA, Super Highway
    const areaKeywords = [
      { key: 'gulshan', area: 'Gulshan-e-Iqbal', id: 'gulshan-sunday-mandi' },
      { key: 'clifton', area: 'Clifton', id: 'sunday-bachat-bazaar-clifton' },
      { key: 'saddar', area: 'Saddar', id: 'empress-market-saddar' },
      { key: 'dha', area: 'DHA Phase 8', id: 'dha-farmers-market' },
      { key: 'highway', area: 'Super Highway', id: 'new-sabzi-mandi-karachi' },
      { key: 'super highway', area: 'Super Highway', id: 'new-sabzi-mandi-karachi' },
      { key: 'liaquatabad', area: 'Liaquatabad', id: 'liaquatabad-super-market' },
      { key: 'lahore', area: 'Model Town, Lahore', id: 'model-town-mandi-lahore' },
      { key: 'islamabad', area: 'Sector H-9, Islamabad', id: 'h9-itwar-bazaar-islamabad' }
    ];

    const matchedArea = areaKeywords.find(a => q.includes(a.key));
    if (matchedArea && (q.includes('market') || q.includes('mandi') || q.includes('bazaar') || q.includes('which') || q.includes('where') || q.includes('in'))) {
      const foundMarket = markets.find(m => m.id === matchedArea.id);
      if (foundMarket) {
        return {
          text: `Market in ${foundMarket.area}:\n\n🏛️ ${foundMarket.name}\n📍 Address: ${foundMarket.address}\n⏰ Timings: ${foundMarket.hoursDisplay}\n📅 Operating Days: ${foundMarket.operatingDays.join(', ')}\n⭐ Rating: ${foundMarket.rating} / 5.0 (${foundMarket.vendorCount} stalls)`,
          action: {
            label: `View ${foundMarket.name}`,
            page: 'market-detail',
            marketId: foundMarket.id
          }
        };
      }
    }

    // 6. Booking / Visit / Appointment questions
    if (q.includes('book') || q.includes('booking') || q.includes('appointment') || q.includes('visit') || q.includes('reserve') || q.includes('slot') || q.includes('appoint')) {
      return {
        text: "You can book a visit to any market through FreshFind!\n\nHere's how:\n1️⃣ Open the Market Directory and find your market\n2️⃣ Click on the market card to view full details\n3️⃣ Scroll to the 'Book a Visit' section\n4️⃣ Choose your preferred date & time slot\n5️⃣ Enter your name and confirm your booking\n\nBookings are free and help markets manage visitor flow!",
        action: {
          label: 'Browse Markets to Book a Visit',
          page: 'markets'
        }
      };
    }

    // 7. Match predefined intents in chatbot.json (prices, greetings, specific markets)
    for (let i = 0; i < chatbotData.intents.length; i++) {
      const intent = chatbotData.intents[i];
      const match = intent.keywords.some(k => q.includes(k.toLowerCase()));
      if (match) {
        let responseText = intent.response;
        if (lang === 'ur' && intent.response_ur) responseText = intent.response_ur;
        else if (lang === 'roman' && intent.response_roman) responseText = intent.response_roman;
        return {
          text: responseText,
          action: intent.suggestedAction || null
        };
      }
    }

    // 7. Relevant fallback if general market topic was recognized
    return {
      text: "I can help you with market timings, locating fresh produce, or wholesale market rates.\n\nYou can ask:\n• Where can I find tomatoes?\n• Which markets are open on Sunday?\n• What produce is in season?\n• Which market is in Gulshan or Clifton?",
      action: {
        label: 'Explore Market Directory',
        page: 'markets'
      }
    };
  }

  function handleSend(msgToSend) {
    const query = (msgToSend || text).trim();
    if (!query) return;

    setIsOpen(true);
    setShowProactiveBubble(false);

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setText('');
    setTyping(true);

    setTimeout(() => {
      const botResponse = findReply(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse.text,
        action: botResponse.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 400);
  }

  function handleActionClick(action) {
    if (!action) return;
    if (action.page === 'open-bookmarks') onOpenBookmarks();
    else if (action.page === 'market-detail' && action.marketId) onSelectMarket(action.marketId);
    else if (action.page === 'produce') {
      if (action.produceId && onSelectProduce) {
        onSelectProduce(action.produceId);
      } else {
        onNavigate('produce');
      }
    }
    else if (action.page === 'markets') onNavigate('markets');
    else if (action.page === 'seasonal') onNavigate('seasonal');
    else onNavigate(action.page);
  }

  return (
    <aside className="chatbot-wrapper">
      {!isOpen && showProactiveBubble && (
        <div className="proactive-welcome-bubble">
          <div className="bubble-top-row">
            <div className="bubble-bot-badge">
              <Sparkles size={14} className="sparkle-gold" />
              <span>FreshBot Assistant</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProactiveBubble(false);
              }}
              className="bubble-close-mini"
              title="Close notification"
            >
              <X size={13} />
            </button>
          </div>

          <p className="bubble-prompt-text">
            Hello! Ask me about market locations, Sunday bachat bazaars, or fresh produce:
          </p>

          <div className="proactive-prompts-list">
            {(chatbotData.suggestedPrompts || []).slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt.text)}
                className="proactive-prompt-btn"
              >
                <span className="prompt-icon">{prompt.icon}</span>
                <span className="prompt-label">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowProactiveBubble(false);
          }}
          className="chatbot-floating-launcher"
          title="Open Assistant"
        >
          <Bot size={22} className="bot-icon-spin" />
          <span className="bot-launcher-text">Ask FreshBot</span>
          <span className="launcher-badge-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="bot-header-info">
              <div className="bot-avatar-circle">
                <Bot size={18} />
                <span className="online-indicator" />
              </div>
              <div>
                <h3>{chatbotData.botInfo.name}</h3>
                <span className="bot-subhead">Market & Produce Assistant</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn-header-icon close">
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages-area">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-row ${m.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                {m.sender === 'bot' && (
                  <div className="bubble-avatar">
                    <Bot size={15} />
                  </div>
                )}
                <div className="bubble-content-wrap">
                  <div className="bubble-text" style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                  {m.action && (
                    <button onClick={() => handleActionClick(m.action)} className="chat-action-btn">
                      <span>{m.action.label}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                  <span className="bubble-time">{m.time}</span>
                </div>
                {m.sender === 'user' && (
                  <div className="bubble-avatar user-av">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="chat-initial-suggested-box">
                <div className="suggested-heading">
                  <HelpCircle size={14} />
                  <span>Common Questions (Click to ask):</span>
                </div>
                <div className="suggested-items-col">
                  {[
                    { text: 'Which markets are near me?', icon: '📍' },
                    { text: 'Where can I find tomatoes?', icon: '🍅' },
                    { text: 'How to book a market visit?', icon: '📆' },
                    { text: 'Which markets are open on Sunday?', icon: '📅' },
                    { text: 'What produce is available in summer?', icon: '🥭' },
                    { text: 'Which market is in Gulshan?', icon: '🏛️' }
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt.text)}
                      className="suggested-item-card"
                    >
                      <span className="suggested-icon">{prompt.icon}</span>
                      <span className="suggested-text">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {typing && (
              <div className="chat-bubble-row bubble-bot">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-quick-replies">
            <div className="quick-replies-scroll">
              {[
                { text: 'Markets near me' },
                { text: 'Sunday Bazaars' },
                { text: 'Find Tomatoes' },
                { text: 'Book a Visit' },
                { text: 'Empress Market' },
                { text: 'Summer Produce' }
              ].map((item, idx) => (
                <button key={idx} onClick={() => handleSend(item.text)} className="quick-chip">
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chatbot-input-bar">
            <input
              type="text"
              placeholder="Ask about markets, timings, or produce..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" disabled={!text.trim()} className="btn-chat-send" title="Send message">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
