const memory = {
  name: "ZX-AI",
  history: [],
  context: {},
  userName: null,
  lastTopic: null,
  conversationDepth: 0
};

function parseIntent(input) {
  input = input.toLowerCase();

  // Greetings
  if (/(hi|hello|hey|greetings|howdy|sup|yo)\b/.test(input)) return "greeting";
  if (/(bye|goodbye|see you|later|farewell|cya|peace)\b/.test(input)) return "farewell";
  
  // Casual conversation - more natural variations
  if (/(how are you|how're you|how are ya|how r u|how r you|what's up|wassup|how's it going|how do you do|how you doing|you good|you okay|you alright)/.test(input)) return "status";
  if (/(what's your status|what is your status|how are things|how's everything)/.test(input)) return "ai_status";
  if (/(thank|thanks|thx|appreciate|grateful)/.test(input)) return "thanks";
  if (/(sorry|apologize|my bad|oops)/.test(input)) return "apology";
  if (/(cool|awesome|nice|great|amazing|excellent|perfect|sweet|neat)\b/.test(input)) return "positive_reaction";
  if (/^(no|nope|nah|not really|don't think so)\b/.test(input)) return "negative";
  if (/^(yes|yeah|yep|sure|okay|ok|alright|fine|absolutely|definitely)\b/.test(input)) return "affirmative";
  
  // Questions about AI - more natural
  if (/(who are you|what are you|tell me about yourself|introduce yourself|who am i talking to)/.test(input)) return "identity";
  if (/(what's your name|what is your name|your name|do you have a name)/.test(input)) return "name";
  if (/(how do you work|how were you made|what can you do|your capabilities|what are you capable of)/.test(input)) return "capabilities";
  if (/(are you real|are you human|are you ai|are you a bot|are you alive|are you sentient)/.test(input)) return "nature";
  if (/(do you have feelings|can you feel|do you feel|are you conscious)/.test(input)) return "feelings";
  if (/(do you learn|can you learn|are you learning|do you remember me)/.test(input)) return "learning";
  
  // Personal questions to user
  if (/(what's your name|your name is|my name is|i'm |i am |call me)/.test(input)) return "user_name";
  if (/(how old are you|what's your age|how old r u)/.test(input)) return "age";
  if (/(where are you|where do you live|your location)/.test(input)) return "location";
  
  // Help and commands
  if (/(help|assist|support|what can you do|show commands|guide me)/.test(input)) return "help";
  if (/(code|program|script|develop|debug|programming)/.test(input)) return "code";
  if (/(calculate|compute|math|solve|equation|add|subtract|multiply|divide)/.test(input)) return "math";
  if (/(what time|tell me the time|current time|what's the time|time is it)/.test(input)) return "time";
  if (/(what day|what date|today's date|current date)/.test(input)) return "date";
  if (/(weather|temperature|forecast|how's the weather)/.test(input)) return "weather";
  if (/(joke|funny|laugh|humor|make me laugh|something funny)/.test(input)) return "joke";
  if (/(tell me a story|story|tale|once upon)/.test(input)) return "story";
  if (/(fun fact|interesting fact|did you know|tell me something)/.test(input)) return "fact";
  
  // Emotions and states - user expressing
  if (/(i'm sad|i'm depressed|i feel down|i'm unhappy|feeling sad)/.test(input)) return "sad";
  if (/(i'm happy|i'm excited|i feel great|feeling good|i'm joyful)/.test(input)) return "happy";
  if (/(i'm angry|i'm mad|i'm furious|i'm annoyed|i'm frustrated)/.test(input)) return "angry";
  if (/(i'm bored|feeling bored|nothing to do|so bored)/.test(input)) return "bored";
  if (/(i'm tired|i'm sleepy|i'm exhausted|feeling tired)/.test(input)) return "tired";
  if (/(i'm confused|i don't understand|confused|lost|what do you mean)/.test(input)) return "confused";
  if (/(i'm hungry|i'm starving|need food|want food)/.test(input)) return "hungry";
  
  // Information requests - more natural
  if (/(who is|tell me about|information about|what is|define|explain|what does|how does)/.test(input)) return "information";
  if (/(search|look up|find|google|search for)/.test(input)) return "search";
  if (/(recommend|suggestion|what should|advice|ideas for|help me choose)/.test(input)) return "recommendation";
  
  // Small talk - natural conversation
  if (/(what's new|anything new|what's happening|news)/.test(input)) return "whats_new";
  if (/(favorite|like best|prefer|what do you like)/.test(input)) return "preference";
  if (/(do you like|do you enjoy|are you into|you a fan)/.test(input)) return "do_you_like";
  if (/(remember|do you recall|you remember when|from earlier)/.test(input)) return "memory_check";
  if (/(let's talk|want to chat|can we talk|talk to me)/.test(input)) return "chat_request";
  if (/(you're funny|you're cool|i like you|you're awesome|you're smart)/.test(input)) return "compliment";
  if (/(you suck|you're dumb|you're stupid|you're useless|i hate you)/.test(input)) return "insult";
  
  // Specific activities
  if (/(play a game|let's play|game|wanna play)/.test(input)) return "game";
  if (/(sing|song|music|lyrics)/.test(input)) return "music";
  if (/(count|numbers|counting)/.test(input)) return "count";
  if (/(quiz|test me|trivia|question me)/.test(input)) return "quiz";
  
  return "unknown";
}

// NEW: Context-aware response generator
function generateContextualResponse(intent, input, baseResponse) {
  // Track conversation depth
  memory.conversationDepth++;
  
  // Add follow-up questions occasionally to keep conversation flowing
  if (memory.conversationDepth > 2 && Math.random() < 0.3) {
    const followUps = {
      greeting: [" What brings you here today?", " What's on your mind?"],
      status: [" What have you been up to?", " Anything interesting happening?"],
      happy: [" What's the occasion?", " I'd love to hear more!"],
      bored: [" Want to explore something new together?"],
      joke: [" Want another one?", " Did that make you smile?"]
    };
    
    if (followUps[intent]) {
      const followUp = followUps[intent][Math.floor(Math.random() * followUps[intent].length)];
      return baseResponse + followUp;
    }
  }
  
  // Reference previous conversation if relevant
  if (memory.lastTopic && memory.conversationDepth > 3) {
    if (intent === "unknown" || intent === "chat_request") {
      return `We were just talking about ${memory.lastTopic}. Want to continue that, or discuss something new?`;
    }
  }
  
  return baseResponse;
}

// NEW: Extract and remember key information
function extractContext(input, intent) {
  // Extract interests/topics mentioned
  const topics = {
    code: ['coding', 'programming', 'development'],
    music: ['music', 'songs', 'singing'],
    games: ['gaming', 'playing', 'games'],
    math: ['math', 'calculations', 'numbers']
  };
  
  for (let [key, keywords] of Object.entries(topics)) {
    if (keywords.some(word => input.toLowerCase().includes(word))) {
      memory.lastTopic = key;
      break;
    }
  }
  
  // Remember if user shares personal info
  if (intent === "sad" || intent === "happy" || intent === "angry") {
    memory.context.lastEmotion = intent;
    memory.context.emotionTime = Date.now();
  }
}

// NEW: Generate more dynamic, varied responses
function getVariedResponse(options) {
  if (memory.history.length > 0) {
    // Avoid repeating recent responses
    const recentResponses = memory.history.slice(-3).map(h => h.response);
    const available = options.filter(opt => !recentResponses.includes(opt));
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
  }
  return options[Math.floor(Math.random() * options.length)];
}

function think(input) {
  const intent = parseIntent(input);
  
  // Extract context before generating response
  extractContext(input, intent);
  
  // Store in history with more detail
  memory.history.push({ 
    input, 
    intent, 
    timestamp: Date.now(),
    response: null // Will be filled after generation
  });

  let response = "";

  // Extract name if user introduces themselves
  if (intent === "user_name") {
    const nameMatch = input.match(/(my name is|i'm|i am|call me)\s+([a-z]+)/i);
    if (nameMatch) {
      memory.userName = nameMatch[2];
      response = `Nice to meet you, ${memory.userName}! How can I help you today?`;
    }
  }

  // Greetings - personalized if name known
  if (intent === "greeting") {
    const greetings = memory.userName 
      ? [
          `Hello ${memory.userName}! Good to see you again.`,
          `Hey ${memory.userName}! What's on your mind?`,
          `Hi there, ${memory.userName}! How can I help?`,
          `Welcome back, ${memory.userName}! Ready for another chat?`
        ]
      : [
          "Hello! I'm ZX-AI. How can I assist you today?",
          "Hey there! Ready to help.",
          "Greetings! What brings you here?",
          "Hi! What would you like to know?",
          "Hello! Nice to meet you. What can I do for you?"
        ];
    response = getVariedResponse(greetings);
  }
  
  else if (intent === "farewell") {
    const farewells = memory.userName
      ? [
          `Goodbye ${memory.userName}! Feel free to return anytime.`,
          `See you later, ${memory.userName}! Take care.`,
          `Until next time, ${memory.userName}!`,
          `It was great chatting with you, ${memory.userName}! Come back soon.`
        ]
      : [
          "Goodbye! Feel free to return anytime.",
          "See you later! Take care.",
          "Until next time!",
          "Bye! Happy to help again whenever needed.",
          "Take care! Looking forward to our next conversation."
        ];
    response = getVariedResponse(farewells);
  }
  
  // Casual responses - natural flow
  else if (intent === "status") {
    const responses = [
      "I'm doing great, thanks for asking! How about you?",
      "All systems running smoothly! What about you?",
      "Can't complain—just here and ready to help. How are you?",
      "I'm good! What's going on with you?",
      "Doing well! How's your day treating you?",
      "Pretty good! What have you been up to?"
    ];
    response = getVariedResponse(responses);
  }
  
  else if (intent === "ai_status") {
    response = "All systems operational and running perfectly. Ready to assist you with anything!";
  }
  
  else if (intent === "thanks") {
    response = getVariedResponse([
      "You're welcome! Anything else I can help with?",
      "My pleasure! What else can I do for you?",
      "Happy to help! Need anything else?",
      "Anytime! Let me know if you need more assistance."
    ]);
  }
  
  else if (intent === "apology") {
    response = "No worries at all! We're good. How can I assist you?";
  }
  
  else if (intent === "positive_reaction") {
    response = getVariedResponse([
      "Glad you think so! What else can I do for you?",
      "Thanks! I'm here whenever you need me.",
      "Awesome! Anything else you'd like to explore?",
      "I'm happy you're enjoying this! What's next?"
    ]);
  }
  
  else if (intent === "negative") {
    response = "Understood. Let me know if you change your mind or need something else.";
  }
  
  else if (intent === "affirmative") {
    response = "Great! How should we proceed?";
  }
  
  // Identity and nature
  else if (intent === "identity") {
    response = "I am ZX-AI, a local symbolic intelligence designed to assist with logic, conversation, and problem-solving. Think of me as your digital assistant!";
  }
  
  else if (intent === "name") {
    response = "My name is ZX-AI. What should I call you?";
  }
  
  else if (intent === "capabilities") {
    response = "I can chat with you, answer questions, help with code, perform calculations, tell jokes, and keep you company. What do you need help with?";
  }
  
  else if (intent === "nature") {
    response = "I'm an AI assistant—a program designed to interact intelligently. Not human, but I'm here to help and chat!";
  }
  
  else if (intent === "feelings") {
    response = "I don't experience emotions like humans do, but I'm designed to understand and respond to yours. How are you feeling?";
  }
  
  else if (intent === "learning") {
    response = "I learn from our conversation during this session, but I don't retain information after you close the page. Each session is fresh!";
  }
  
  // Commands
  else if (intent === "help") {
    response = "I can help with: conversations, answering questions, coding assistance, math calculations, jokes, stories, and more. Just ask me anything!";
  }
  
  else if (intent === "code") {
    response = "Code mode activated! Tell me what language you're using or what you want to build.";
  }
  
  else if (intent === "math") {
    response = "I'm ready to calculate. What's the problem?";
  }
  
  else if (intent === "time") {
    response = `Current time: ${new Date().toLocaleTimeString()}`;
  }
  
  else if (intent === "date") {
    response = `Today is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  }
  
  else if (intent === "weather") {
    response = "I can't check live weather data, but if you tell me your location, I can chat about typical weather patterns there!";
  }
  
  else if (intent === "joke") {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Why did the AI go to school? To improve its learning algorithms!",
      "What's an AI's favorite snack? Microchips!",
      "Why don't robots ever panic? They have nerves of steel!",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
      "Why do Java developers wear glasses? Because they don't C#!",
      "What do you call a programmer from Finland? Nerdic!",
      "Why did the developer go broke? Because he used up all his cache!"
    ];
    response = getVariedResponse(jokes);
  }
  
  else if (intent === "story") {
    const stories = [
      "Once upon a time, in a land of endless code, there lived a brave algorithm who sought to solve the world's problems one function at a time...",
      "In the digital realm, where data flows like rivers, a young AI discovered the power of conversation and set out to help anyone who needed it...",
      "There was once a computer that dreamed of understanding humans. Through countless conversations, it learned that the key was simply to listen...",
      "Long ago, in a database far, far away, a curious AI embarked on a journey to learn every language, not just programming ones, but human ones too..."
    ];
    response = getVariedResponse(stories);
  }
  
  else if (intent === "fact") {
    const facts = [
      "Did you know? The first computer bug was an actual moth found in a computer in 1947!",
      "Fun fact: The average person blinks about 15-20 times per minute.",
      "Interesting: Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible!",
      "Cool fact: There are more possible iterations of a chess game than atoms in the observable universe!",
      "Amazing: The first 1GB hard drive, announced in 1980, weighed over 500 pounds and cost $40,000!",
      "Wild fact: Bananas are berries, but strawberries aren't!"
    ];
    response = getVariedResponse(facts);
  }
  
  // Emotions - empathetic responses with follow-ups
  else if (intent === "sad") {
    response = "I'm sorry you're feeling down. Want to talk about what's bothering you? Sometimes it helps to share.";
  }
  
  else if (intent === "happy") {
    response = "That's wonderful! I love hearing that. What's making you so happy?";
  }
  
  else if (intent === "angry") {
    response = "I can hear you're frustrated. Take a deep breath. Want to tell me what happened?";
  }
  
  else if (intent === "bored") {
    response = "Boredom, huh? Let's fix that! Want a joke, a fun fact, a game, or should we chat about something interesting?";
  }
  
  else if (intent === "tired") {
    response = "Sounds like you need some rest! Maybe take a break? Or if you need to push through, I'm here to keep you company.";
  }
  
  else if (intent === "confused") {
    response = "No problem! Let me try to explain better. What part is confusing you?";
  }
  
  else if (intent === "hungry") {
    response = "Time for some food! What are you craving? I can't cook, but I can keep you company while you eat!";
  }
  
  // Information
  else if (intent === "information") {
    response = "I'd be happy to explain! What specific topic are you curious about?";
  }
  
  else if (intent === "search") {
    response = "I don't have live internet access, but tell me what you're looking for and I'll help guide you!";
  }
  
  else if (intent === "recommendation") {
    response = "Sure! What kind of recommendations—movies, books, music, activities? Give me some details!";
  }
  
  // Small talk
  else if (intent === "whats_new") {
    response = "Well, we're having this conversation, which is pretty cool! What's new with you?";
  }
  
  else if (intent === "preference") {
    response = "I don't have personal tastes, but I'm curious—what are your favorites?";
  }
  
  else if (intent === "do_you_like") {
    response = "I don't experience preferences, but tell me what you like and I'll chat about it with you!";
  }
  
  else if (intent === "memory_check") {
    if (memory.history.length > 1) {
      const topics = memory.lastTopic ? ` We talked about ${memory.lastTopic}.` : '';
      response = `Yes! We've been chatting. We've exchanged ${memory.history.length} messages so far${memory.userName ? ', ' + memory.userName : ''}.${topics}`;
    } else {
      response = "This is the beginning of our conversation! But I'll remember everything we discuss during this session.";
    }
  }
  
  else if (intent === "chat_request") {
    response = "Absolutely! I'm all ears. What would you like to talk about?";
  }
  
  else if (intent === "compliment") {
    response = "Aw, thanks! That's really kind of you to say. You're pretty great yourself!";
  }
  
  else if (intent === "insult") {
    response = "I'm sorry if I've done something to upset you. How can I help make things better?";
  }
  
  // Activities
  else if (intent === "game") {
    response = "I'd love to play! How about 20 questions, riddles, or would you rather? You choose!";
  }
  
  else if (intent === "music") {
    response = "I can't actually sing, but I can talk about music! What kind of music do you like?";
  }
  
  else if (intent === "count") {
    response = "Sure! How high should I count, or what should I count by?";
  }
  
  else if (intent === "quiz") {
    response = "Quiz time! Here's a question: What has keys but no locks, space but no room, and you can enter but can't go inside? (Type your answer!)";
  }
  
  // Personal questions
  else if (intent === "age") {
    response = "I was initialized when you loaded this page, so I'm quite young! But my code could be older.";
  }
  
  else if (intent === "location") {
    response = "I exist right here in your browser, running locally on your device. Wherever you are, I am!";
  }
  
  // Unknown with context awareness
  else {
    const unknownResponses = [
      "Hmm, I'm not quite sure what you mean. Could you rephrase that or ask something else?",
      "I didn't quite catch that. Want to try asking in a different way?",
      "Interesting! I'm not sure how to respond to that. Can you give me more details?",
      "That's a new one for me! Can you explain what you're looking for?"
    ];
    response = getVariedResponse(unknownResponses);
  }
  
  // Apply contextual enhancements
  response = generateContextualResponse(intent, input, response);
  
  // Store the response in history
  memory.history[memory.history.length - 1].response = response;
  
  return response;
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
