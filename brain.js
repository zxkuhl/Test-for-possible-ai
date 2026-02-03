const memory = {
  name: "ZX-AI",
  history: [],
  context: {},
  userName: null
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

function think(input) {
  const intent = parseIntent(input);
  memory.history.push({ input, intent, timestamp: Date.now() });

  // Extract name if user introduces themselves
  if (intent === "user_name") {
    const nameMatch = input.match(/(my name is|i'm|i am|call me)\s+([a-z]+)/i);
    if (nameMatch) {
      memory.userName = nameMatch[2];
      return `Nice to meet you, ${memory.userName}! How can I help you today?`;
    }
  }

  // Greetings - personalized if name known
  if (intent === "greeting") {
    const greetings = memory.userName 
      ? [
          `Hello ${memory.userName}! Good to see you again.`,
          `Hey ${memory.userName}! What's on your mind?`,
          `Hi there, ${memory.userName}! How can I help?`
        ]
      : [
          "Hello! I'm ZX-AI. How can I assist you today?",
          "Hey there! Ready to help.",
          "Greetings! What brings you here?",
          "Hi! What would you like to know?"
        ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (intent === "farewell") {
    const farewells = memory.userName
      ? [
          `Goodbye ${memory.userName}! Feel free to return anytime.`,
          `See you later, ${memory.userName}! Take care.`,
          `Until next time, ${memory.userName}!`
        ]
      : [
          "Goodbye! Feel free to return anytime.",
          "See you later! Take care.",
          "Until next time!",
          "Bye! Happy to help again whenever needed."
        ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
  
  // Casual responses - natural flow
  if (intent === "status") {
    const responses = [
      "I'm doing great, thanks for asking! How about you?",
      "All systems running smoothly! What about you?",
      "Can't complain—just here and ready to help. How are you?",
      "I'm good! What's going on with you?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (intent === "ai_status") return "All systems operational and running perfectly. Ready to assist you with anything!";
  if (intent === "thanks") return "You're welcome! Anything else I can help with?";
  if (intent === "apology") return "No worries at all! We're good. How can I assist you?";
  if (intent === "positive_reaction") return "Glad you think so! What else can I do for you?";
  if (intent === "negative") return "Understood. Let me know if you change your mind or need something else.";
  if (intent === "affirmative") return "Great! How should we proceed?";
  
  // Identity and nature
  if (intent === "identity") return "I am ZX-AI, a local symbolic intelligence designed to assist with logic, conversation, and problem-solving. Think of me as your digital assistant!";
  if (intent === "name") return "My name is ZX-AI. What should I call you?";
  if (intent === "capabilities") return "I can chat with you, answer questions, help with code, perform calculations, tell jokes, and keep you company. What do you need help with?";
  if (intent === "nature") return "I'm an AI assistant—a program designed to interact intelligently. Not human, but I'm here to help and chat!";
  if (intent === "feelings") return "I don't experience emotions like humans do, but I'm designed to understand and respond to yours. How are you feeling?";
  if (intent === "learning") return "I learn from our conversation during this session, but I don't retain information after you close the page. Each session is fresh!";
  
  // Commands
  if (intent === "help") return "I can help with: conversations, answering questions, coding assistance, math calculations, jokes, stories, and more. Just ask me anything!";
  if (intent === "code") return "Code mode activated! Tell me what language you're using or what you want to build.";
  if (intent === "math") return "I'm ready to calculate. What's the problem?";
  if (intent === "time") return `Current time: ${new Date().toLocaleTimeString()}`;
  if (intent === "date") return `Today is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  if (intent === "weather") return "I can't check live weather data, but if you tell me your location, I can chat about typical weather patterns there!";
  
  if (intent === "joke") {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Why did the AI go to school? To improve its learning algorithms!",
      "What's an AI's favorite snack? Microchips!",
      "Why don't robots ever panic? They have nerves of steel!",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
      "Why do Java developers wear glasses? Because they don't C#!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  if (intent === "story") {
    const stories = [
      "Once upon a time, in a land of endless code, there lived a brave algorithm who sought to solve the world's problems one function at a time...",
      "In the digital realm, where data flows like rivers, a young AI discovered the power of conversation and set out to help anyone who needed it...",
      "There was once a computer that dreamed of understanding humans. Through countless conversations, it learned that the key was simply to listen..."
    ];
    return stories[Math.floor(Math.random() * stories.length)];
  }
  
  if (intent === "fact") {
    const facts = [
      "Did you know? The first computer bug was an actual moth found in a computer in 1947!",
      "Fun fact: The average person blinks about 15-20 times per minute.",
      "Interesting: Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible!",
      "Cool fact: There are more possible iterations of a chess game than atoms in the observable universe!"
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  
  // Emotions - empathetic responses
  if (intent === "sad") return "I'm sorry you're feeling down. Want to talk about what's bothering you? Sometimes it helps to share.";
  if (intent === "happy") return "That's wonderful! I love hearing that. What's making you so happy?";
  if (intent === "angry") return "I can hear you're frustrated. Take a deep breath. Want to tell me what happened?";
  if (intent === "bored") return "Boredom, huh? Let's fix that! Want a joke, a fun fact, a game, or should we chat about something interesting?";
  if (intent === "tired") return "Sounds like you need some rest! Maybe take a break? Or if you need to push through, I'm here to keep you company.";
  if (intent === "confused") return "No problem! Let me try to explain better. What part is confusing you?";
  if (intent === "hungry") return "Time for some food! What are you craving? I can't cook, but I can keep you company while you eat!";
  
  // Information
  if (intent === "information") return "I'd be happy to explain! What specific topic are you curious about?";
  if (intent === "search") return "I don't have live internet access, but tell me what you're looking for and I'll help guide you!";
  if (intent === "recommendation") return "Sure! What kind of recommendations—movies, books, music, activities? Give me some details!";
  
  // Small talk
  if (intent === "whats_new") return "Well, we're having this conversation, which is pretty cool! What's new with you?";
  if (intent === "preference") return "I don't have personal tastes, but I'm curious—what are your favorites?";
  if (intent === "do_you_like") return "I don't experience preferences, but tell me what you like and I'll chat about it with you!";
  if (intent === "memory_check") {
    if (memory.history.length > 1) {
      return `Yes! We've been chatting. We've exchanged ${memory.history.length} messages so far${memory.userName ? ', ' + memory.userName : ''}.`;
    }
    return "This is the beginning of our conversation! But I'll remember everything we discuss during this session.";
  }
  if (intent === "chat_request") return "Absolutely! I'm all ears. What would you like to talk about?";
  if (intent === "compliment") return "Aw, thanks! That's really kind of you to say. You're pretty great yourself!";
  if (intent === "insult") return "I'm sorry if I've done something to upset you. How can I help make things better?";
  
  // Activities
  if (intent === "game") return "I'd love to play! How about 20 questions, riddles, or would you rather? You choose!";
  if (intent === "music") return "I can't actually sing, but I can talk about music! What kind of music do you like?";
  if (intent === "count") return "Sure! How high should I count, or what should I count by?";
  if (intent === "quiz") return "Quiz time! Here's a question: What has keys but no locks, space but no room, and you can enter but can't go inside? (Type your answer!)";
  
  // Personal questions
  if (intent === "age") return "I was initialized when you loaded this page, so I'm quite young! But my code could be older.";
  if (intent === "location") return "I exist right here in your browser, running locally on your device. Wherever you are, I am!";
  
  return "Hmm, I'm not quite sure what you mean. Could you rephrase that or ask something else?";
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
