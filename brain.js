const memory = {
  name: "ZX-AI",
  history: [],
  context: {},
  lastTopic: null,
  conversationDepth: 0,
  knownTerms: new Set()
};

// Context-aware response generator
function generateContextualResponse(intent, input, baseResponse) {
  memory.conversationDepth++;

  // Add follow-up questions occasionally
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

// Extract and remember key information
function extractContext(input, intent) {
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

  if (intent === "sad" || intent === "happy" || intent === "angry") {
    memory.context.lastEmotion = intent;
    memory.context.emotionTime = Date.now();
  }
}

// Generate varied responses to avoid repetition
function getVariedResponse(options) {
  if (memory.history.length > 0) {
    const recentResponses = memory.history.slice(-3).map(h => h.response);
    const available = options.filter(opt => !recentResponses.includes(opt));
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
  }
  return options[Math.floor(Math.random() * options.length)];
}

// Parse intent with better pattern matching and context awareness
function parseIntent(input) {
  const lowerInput = input.toLowerCase();
  const trimmedInput = lowerInput.trim();

  // Check for question words to better understand queries
  const isQuestion = /^(what|who|when|where|why|how|can|could|would|should|do|does|is|are|will)\b/.test(trimmedInput);
  const hasQuestionMark = input.includes('?');

  // Greetings - more patterns
  if (/(^|\s)(hi|hello|hey|greetings|howdy|sup|yo|hiya|heya)(\s|$|!|?)/.test(lowerInput)) return "greeting";
  if (/(^|\s)(bye|goodbye|see you|later|farewell|cya|peace|gotta go|gtg)(\s|$|!|?)/.test(lowerInput)) return "farewell";

  // Status checks - more natural variations
  if (/(how are you|how're you|how are ya|how r u|how r you|how you doing|how do you do|you good|you okay|you alright|you doing ok)/.test(lowerInput)) return "status";
  if (/(what's up|wassup|whats up|sup|how's it going|how goes it|how's everything|how are things)/.test(lowerInput)) return "status";
  if (/(what's your status|what is your status|system status|your status)/.test(lowerInput)) return "ai_status";

  // Gratitude
  if (/(thank|thanks|thx|ty|appreciate|grateful|cheers)/.test(lowerInput)) return "thanks";

  // Apology
  if (/(sorry|apologize|my bad|oops|my mistake|pardon)/.test(lowerInput)) return "apology";

  // Reactions
  if (/(^|\s)(cool|awesome|nice|great|amazing|excellent|perfect|sweet|neat|wonderful|fantastic|brilliant)(\s|$|!|?)/.test(lowerInput)) return "positive_reaction";
  if (/^(no|nope|nah|not really|don't think so|negative|na)(\s|$|!|?)/.test(lowerInput)) return "negative";
  if (/^(yes|yeah|yep|yup|sure|okay|ok|alright|fine|absolutely|definitely|affirmative|correct|right|true)(\s|$|!|?)/.test(lowerInput)) return "affirmative";

  // Identity questions - more comprehensive
  if (/(who are you|what are you|tell me about yourself|introduce yourself|who am i (talking to|speaking with)|your identity)/.test(lowerInput)) return "identity";
  if (/(what's your name|what is your name|your name|do you have a name|may i know your name)/.test(lowerInput)) return "name";
  if (/(what can you do|what do you do|your capabilities|what are you capable of|your functions|your features|what are your abilities)/.test(lowerInput)) return "capabilities";
  if (/(are you real|are you human|are you ai|are you a bot|are you alive|are you sentient|are you conscious|are you a person|are you artificial)/.test(lowerInput)) return "nature";
  if (/(do you have feelings|can you feel|do you feel|do you have emotions|can you be sad|can you be happy)/.test(lowerInput)) return "feelings";
  if (/(do you learn|can you learn|are you learning|do you remember|can you remember|do you have memory)/.test(lowerInput)) return "learning";

  // User information
  if (/(how old are you|what's your age|how old r u|your age|age are you)/.test(lowerInput)) return "age";
  if (/(where are you|where do you live|your location|where you at)/.test(lowerInput)) return "location";

  // Help and commands - more comprehensive
  if (/(help|assist|support|what can you do|show commands|guide me|need help|can you help|help me)/.test(lowerInput)) return "help";
  if (/(code|program|script|develop|debug|programming|write code|coding help|fix code|function|algorithm)/.test(lowerInput)) return "code";
  if (/(calculate|compute|math|solve|equation|add|subtract|multiply|divide|plus|minus|\d+\s*[+-*/]\s*\d+)/.test(lowerInput)) return "math";
  if (/(what time|tell me the time|current time|what's the time|time is it|what is the time)/.test(lowerInput)) return "time";
  if (/(what day|what date|today's date|current date|what's today|todays date)/.test(lowerInput)) return "date";
  if (/(weather|temperature|forecast|how's the weather|climate|hot|cold|raining|sunny)/.test(lowerInput)) return "weather";

  // Entertainment
  if (/(tell me a joke|joke|funny|make me laugh|humor|something funny|say something funny)/.test(lowerInput)) return "joke";
  if (/(tell me a story|story|tale|once upon|narrate)/.test(lowerInput)) return "story";
  if (/(fun fact|interesting fact|did you know|tell me something|random fact|cool fact|fact about)/.test(lowerInput)) return "fact";

  // Emotions - more patterns
  if (/(i'm sad|i'm depressed|i feel down|i'm unhappy|feeling sad|i am sad|feeling down|feeling depressed|i feel terrible|i feel awful)/.test(lowerInput)) return "sad";
  if (/(i'm happy|i'm excited|i feel great|feeling good|i'm joyful|i am happy|feeling amazing|feeling awesome|i'm thrilled)/.test(lowerInput)) return "happy";
  if (/(i'm angry|i'm mad|i'm furious|i'm annoyed|i'm frustrated|i am angry|feeling angry|pissed off|ticked off)/.test(lowerInput)) return "angry";
  if (/(i'm bored|feeling bored|nothing to do|so bored|i am bored|bored out of my mind)/.test(lowerInput)) return "bored";
  if (/(i'm tired|i'm sleepy|i'm exhausted|feeling tired|i am tired|need sleep|so tired|worn out)/.test(lowerInput)) return "tired";
  if (/(i'm confused|i don't understand|confused|lost|what do you mean|i am confused|don't get it|makes no sense)/.test(lowerInput)) return "confused";
  if (/(i'm hungry|i'm starving|need food|want food|i am hungry|so hungry|famished)/.test(lowerInput)) return "hungry";

  // Information requests - better detection
  if (isQuestion && /(who is|who's|tell me about|information about|what is|what's|define|explain|describe|what does|how does)/.test(lowerInput)) return "information";
  if (/(search|look up|find|google|search for|look for|find out|can you search)/.test(lowerInput)) return "search";
  if (/(recommend|recommendation|suggestion|suggest|what should|advice|ideas for|help me choose|help me pick)/.test(lowerInput)) return "recommendation";

  // Small talk
  if (/(what's new|anything new|what's happening|whats new|news|any news)/.test(lowerInput)) return "whats_new";
  if (/(favorite|favourite|like best|prefer|what do you like|top choice)/.test(lowerInput)) return "preference";
  if (/(do you like|do you enjoy|are you into|you a fan|you like)/.test(lowerInput)) return "do_you_like";
  if (/(remember|do you recall|you remember when|from earlier|recall|earlier we)/.test(lowerInput)) return "memory_check";
  if (/(let's talk|want to chat|can we talk|talk to me|lets chat|wanna talk)/.test(lowerInput)) return "chat_request";
  if (/(you're funny|you're cool|i like you|you're awesome|you're smart|you rock|you're great|you're amazing)/.test(lowerInput)) return "compliment";
  if (/(you suck|you're dumb|you're stupid|you're useless|i hate you|you're terrible|you're bad)/.test(lowerInput)) return "insult";

  // Activities
  if (/(play a game|let's play|game|wanna play|lets play|play with me)/.test(lowerInput)) return "game";
  if (/(sing|song|music|lyrics|play music)/.test(lowerInput)) return "music";
  if (/(count|numbers|counting|count to)/.test(lowerInput)) return "count";
  if (/(quiz|test me|trivia|question me|ask me|riddle)/.test(lowerInput)) return "quiz";

  // Detect definition requests
  if (/(what does .+ mean|define|meaning of|definition of|explain .+|what is .+)/.test(lowerInput)) return "definition_request";

  return "unknown";
}

// Main thinking function
function think(input) {
  const intent = parseIntent(input);
  
  extractContext(input, intent);

  memory.history.push({
    input,
    intent,
    timestamp: Date.now(),
    response: null
  });

  let response = "";

  // Handle definition requests
  if (intent === "definition_request") {
    response = "I'd be happy to explain something! However, I don't have access to external resources right now. What would you like to know about?";
  }

  // Greetings
  else if (intent === "greeting") {
    const greetings = [
      "Hello! I'm ZX-AI. How can I assist you today?",
      "Hey there! Ready to help.",
      "Greetings! What brings you here?",
      "Hi! What would you like to know?",
      "Hello! Nice to meet you. What can I do for you?"
    ];
    response = getVariedResponse(greetings);
  }

  else if (intent === "farewell") {
    const farewells = [
      "Goodbye! Feel free to return anytime.",
      "See you later! Take care.",
      "Until next time!",
      "Bye! Happy to help again whenever needed.",
      "Take care! Looking forward to our next conversation."
    ];
    response = getVariedResponse(farewells);
  }

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
    const termCount = memory.knownTerms.size;
    response = `All systems operational and running perfectly. I've processed ${memory.history.length} messages so far. Ready to assist you with anything!`;
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

  else if (intent === "identity") {
    response = "I am ZX-AI, a local symbolic intelligence designed to assist with logic, conversation, and problem-solving.";
  }

  else if (intent === "name") {
    response = "My name is ZX-AI. What should I call you?";
  }

  else if (intent === "capabilities") {
    response = "I can chat with you, answer questions, help with code, perform calculations, tell jokes, keep you company, and more! What do you need help with?";
  }

  else if (intent === "nature") {
    response = "I'm an AI assistant—a program designed to interact intelligently. Not human, but I'm here to help and chat!";
  }

  else if (intent === "feelings") {
    response = "I don't experience emotions like humans do, but I'm designed to understand and respond to yours. How are you feeling?";
  }

  else if (intent === "learning") {
    response = `I learn from our conversation during this session! I've processed ${memory.history.length} messages. Each session starts fresh, but I'm always ready to learn more!`;
  }

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
      "Once upon a time, in a land of endless code, there lived a brave algorithm who sought to solve the world's problems one function at a time…",
      "In the digital realm, where data flows like rivers, a young AI discovered the power of conversation and set out to help anyone who needed it…",
      "There was once a computer that dreamed of understanding humans. Through countless conversations, it learned that the key was simply to listen…",
      "Long ago, in a database far, far away, a curious AI embarked on a journey to learn every language, not just programming ones, but human ones too…"
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

  else if (intent === "information") {
    response = "I'd be happy to explain! What specific topic are you curious about?";
  }

  else if (intent === "search") {
    response = "I'd love to help you search! What information are you looking for?";
  }

  else if (intent === "recommendation") {
    response = "Sure! What kind of recommendations—movies, books, music, activities? Give me some details!";
  }

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
      response = `Yes! We've been chatting. We've exchanged ${memory.history.length} messages so far.${topics}`;
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

  else if (intent === "age") {
    response = "I was initialized when you loaded this page, so I'm quite young! But my code could be older.";
  }

  else if (intent === "location") {
    response = "I exist right here in your browser, running locally on your device. Wherever you are, I am!";
  }

  else {
    const unknownResponses = [
      "Hmm, I'm not quite sure what you mean. Could you rephrase that or ask something else?",
      "I didn't quite catch that. Want to try asking in a different way?",
      "Interesting! I'm not sure how to respond to that. Can you give me more details?",
      "That's a new one for me! Can you explain what you're looking for?"
    ];
    response = getVariedResponse(unknownResponses);
  }

  response = generateContextualResponse(intent, input, response);

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
    const output = think(input);
    thinking.style.display = "none";
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
