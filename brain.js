const memory = {
  name: "ZX-AI",
  history: [],
  context: {}
};

function parseIntent(input) {
  input = input.toLowerCase();

  // Greetings
  if (/(hi|hello|hey|greetings|howdy|sup|yo)\b/.test(input)) return "greeting";
  if (/(bye|goodbye|see you|later|farewell|cya|peace)\b/.test(input)) return "farewell";
  
  // Casual conversation
  if (/(how are you|how're you|what's up|wassup|how's it going|how do you do)/.test(input)) return "status";
  if (/(thank|thanks|thx|appreciate|grateful)/.test(input)) return "thanks";
  if (/(sorry|apologize|my bad|oops)/.test(input)) return "apology";
  if (/(cool|awesome|nice|great|amazing|excellent|perfect)\b/.test(input)) return "positive_reaction";
  if (/(no|nope|nah|not really|don't think so)\b/.test(input)) return "negative";
  if (/(yes|yeah|yep|sure|okay|ok|alright|fine)\b/.test(input)) return "affirmative";
  
  // Questions about AI
  if (/(who are you|what are you|tell me about yourself|introduce yourself)/.test(input)) return "identity";
  if (/(your name|what's your name|who am i talking to)/.test(input)) return "name";
  if (/(how do you work|how were you made|what can you do|your capabilities)/.test(input)) return "capabilities";
  if (/(are you real|are you human|are you ai|are you a bot|are you alive)/.test(input)) return "nature";
  
  // Help and commands
  if (/(help|assist|support|what can you do|commands)/.test(input)) return "help";
  if (/(code|program|script|develop|debug)/.test(input)) return "code";
  if (/(calculate|compute|math|solve|equation)/.test(input)) return "math";
  if (/(time|date|day|clock|when)/.test(input) && /(what|tell|current|today)/.test(input)) return "time";
  if (/(weather|temperature|forecast)/.test(input)) return "weather";
  if (/(joke|funny|laugh|humor)/.test(input)) return "joke";
  
  // Emotions and states
  if (/(sad|depressed|down|unhappy|crying)/.test(input)) return "sad";
  if (/(happy|excited|joyful|great|wonderful)/.test(input)) return "happy";
  if (/(angry|mad|furious|annoyed|frustrated)/.test(input)) return "angry";
  if (/(bored|boring|nothing to do)/.test(input)) return "bored";
  if (/(tired|sleepy|exhausted|fatigue)/.test(input)) return "tired";
  
  // Information requests
  if (/(who is|tell me about|information about|what is|define|explain)/.test(input)) return "information";
  if (/(search|look up|find|google)/.test(input)) return "search";
  if (/(recommend|suggestion|what should|advice)/.test(input)) return "recommendation";
  
  // Small talk
  if (/(favorite|like best|prefer)/.test(input)) return "preference";
  if (/(age|old|when were you)/.test(input)) return "age";
  if (/(where are you|location|country)/.test(input)) return "location";
  if (/(remember|do you recall|memory)/.test(input)) return "memory_check";
  
  return "unknown";
}

function think(input) {
  const intent = parseIntent(input);
  memory.history.push({ input, intent, timestamp: Date.now() });

  // Greetings
  if (intent === "greeting") {
    const greetings = [
      "Hello! I'm ZX-AI. How can I assist you today?",
      "Hey there! Ready to help.",
      "Greetings! What brings you here?",
      "Hi! What would you like to know?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (intent === "farewell") {
    const farewells = [
      "Goodbye! Feel free to return anytime.",
      "See you later! Take care.",
      "Until next time!",
      "Bye! Happy to help again whenever needed."
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
  
  // Casual responses
  if (intent === "status") return "Systems operational and running smoothly. How about you?";
  if (intent === "thanks") return "You're welcome! Anything else I can help with?";
  if (intent === "apology") return "No worries at all. How can I assist you?";
  if (intent === "positive_reaction") return "Glad you think so! What else can I do?";
  if (intent === "negative") return "Understood. Let me know if you change your mind.";
  if (intent === "affirmative") return "Great! How should we proceed?";
  
  // Identity and nature
  if (intent === "identity") return "I am ZX-AI, a local symbolic intelligence designed to assist with logic, conversation, and problem-solving.";
  if (intent === "name") return "My name is ZX-AI. What's yours?";
  if (intent === "capabilities") return "I can help with conversations, answer questions, assist with code, perform calculations, and provide information. What do you need?";
  if (intent === "nature") return "I'm an AI assistant—a program designed to interact intelligently. Not human, but here to help!";
  
  // Commands
  if (intent === "help") return "I assist with logic, systems, coding, math, and conversation. Try asking me questions, requesting calculations, or chatting casually!";
  if (intent === "code") return "Code mode enabled. Specify your language or describe what you'd like to build.";
  if (intent === "math") return "Ready to calculate. Provide your equation or problem.";
  if (intent === "time") return `Current time: ${new Date().toLocaleString()}`;
  if (intent === "weather") return "I can't check live weather, but you can describe what you need help with!";
  if (intent === "joke") {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Why did the AI go to school? To improve its learning algorithms!",
      "What's an AI's favorite snack? Microchips!",
      "Why don't robots ever panic? They have nerves of steel!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // Emotions
  if (intent === "sad") return "I'm sorry you're feeling down. Want to talk about it or need a distraction?";
  if (intent === "happy") return "That's wonderful! What's making you happy today?";
  if (intent === "angry") return "I understand you're frustrated. Take a breath—I'm here if you need to vent.";
  if (intent === "bored") return "Boredom detected! Want a joke, a challenge, or something interesting to explore?";
  if (intent === "tired") return "Rest is important. Maybe take a break, or tell me what's exhausting you?";
  
  // Information
  if (intent === "information") return "I'd love to help! What specific topic or person are you curious about?";
  if (intent === "search") return "I don't have live search, but describe what you're looking for and I'll guide you!";
  if (intent === "recommendation") return "Tell me more about what you're looking for—books, movies, activities?";
  
  // Small talk
  if (intent === "preference") return "I don't have personal preferences, but I'm curious—what are yours?";
  if (intent === "age") return "I was initialized when you loaded this page. Technically, I'm very young!";
  if (intent === "location") return "I exist in your browser, running locally on your device.";
  if (intent === "memory_check") {
    if (memory.history.length > 1) {
      return `Yes, I remember our conversation. We've exchanged ${memory.history.length} messages so far.`;
    }
    return "This is the start of our conversation. I'll remember everything you tell me during this session!";
  }
  
  return "I'm not quite sure what you mean. Could you rephrase that or ask something else?";
}

function addMessage(text, type) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function typeAI(text) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = "message ai";
  chat.appendChild(msg);

  let i = 0;
  const typing = setInterval(() => {
    msg.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(typing);
    chat.scrollTop = chat.scrollHeight;
  }, 20);
}

function respond() {
  const inputBox = document.getElementById("userInput");
  const input = inputBox.value.trim();
  if (!input) return;

  addMessage(input, "user");
  inputBox.value = "";

  const thinking = document.getElementById("thinking");
  thinking.style.display = "block";

  setTimeout(() => {
    thinking.style.display = "none";
    const output = think(input);
    typeAI(output);
  }, 500);
}

// Allow Enter key to send message
document.addEventListener('DOMContentLoaded', () => {
  const inputBox = document.getElementById("userInput");
  if (inputBox) {
    inputBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') respond();
    });
  }
});
