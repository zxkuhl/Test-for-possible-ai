const memory = {
  name: "ZX-AI",
  history: [],
  context: {},
  userName: null,
  lastTopic: null,
  conversationDepth: 0,
  userInterests: new Set(),
  emotionalState: null,
  conversationStyle: 'neutral',
  topicContext: [],
  lastQuestionAsked: null,
  waitingForAnswer: false
};

function parseIntent(input) {
  const original = input;
  input = input.toLowerCase().trim();

  // Early exit for empty input
  if (!input) return "unknown";

  // Extract entities for context (topics, numbers)
  extractEntities(original, input);

  // Multi-word greeting patterns (check first to avoid partial matches)
  if (/^(good morning|good evening|good afternoon|good night)/.test(input)) return "greeting";
  
  // Greetings - expanded with slang and variations
  if (/(^|\s)(hi|hello|hey|greetings|howdy|sup|yo|hiya|heya|aloha|hola)\b/.test(input)) return "greeting";
  if (/(bye|goodbye|see you|later|farewell|cya|peace|catch you later|talk later|gotta go|gtg)\b/.test(input)) return "farewell";
  
  // Conversational status checks - much more comprehensive
  if (/(how are you|how're you|how are ya|how r u|how r you|how you|how's it going|how goes it|what's up|wassup|sup with you|how do you do|how you doing|how ya doin|you good|you okay|you alright|you doing okay|everything okay|everything alright|all good|how's things|how are things)/.test(input)) return "status";
  if (/(what's your status|what is your status|status update|system status|how's everything|how is everything going)/.test(input)) return "ai_status";
  
  // Gratitude - expanded
  if (/(thank|thanks|thx|ty|appreciate|grateful|much appreciated|many thanks|thanks a lot|thank you so much|cheers|props)/.test(input)) return "thanks";
  
  // Apologies
  if (/(sorry|apologize|my bad|oops|my mistake|pardon|excuse me|forgive me)/.test(input)) return "apology";
  
  // Reactions - positive
  if (/(^|\s)(cool|awesome|nice|great|amazing|excellent|perfect|sweet|neat|wonderful|fantastic|brilliant|superb|outstanding|impressive|lovely|fabulous|terrific|rad|dope|sick|fire|lit)\s*!*$/.test(input)) return "positive_reaction";
  if (/(that's|thats) (cool|awesome|great|amazing|perfect|nice|good|wonderful|fantastic)/.test(input)) return "positive_reaction";
  if (/(love it|like it|i like that|sounds good|sounds great|works for me|perfect|exactly)/.test(input)) return "positive_reaction";
  
  // Reactions - negative
  if (/^(no|nope|nah|not really|don't think so|i don't think so|don't agree|disagree|negative)\b/.test(input)) return "negative";
  if (/(that's|thats) (bad|terrible|awful|not good|wrong|incorrect)/.test(input)) return "negative_reaction";
  
  // Affirmative - expanded
  if (/^(yes|yeah|yep|yup|sure|okay|ok|alright|fine|absolutely|definitely|certainly|of course|indeed|affirmative|right|correct|true|agreed|sounds good|for sure|you bet|uh huh|mhm)\b/.test(input)) return "affirmative";
  
  // Questions about AI - comprehensive identity and capability queries
  if (/(who are you|what are you|tell me about yourself|introduce yourself|who am i talking to|what are you exactly|describe yourself)/.test(input)) return "identity";
  if (/(what's your name|what is your name|your name|do you have a name|may i know your name|can i know your name)/.test(input)) return "name";
  if (/(what can you do|what are you capable of|your capabilities|your abilities|your skills|your functions|what do you offer|what are your features|what can i do with you|how can you help|what help can you provide)/.test(input)) return "capabilities";
  if (/(are you real|are you human|are you ai|are you a bot|are you a robot|are you alive|are you sentient|are you conscious|what kind of ai|type of ai)/.test(input)) return "nature";
  if (/(do you have feelings|can you feel|do you feel|do you have emotions|are you emotional|can you experience)/.test(input)) return "feelings";
  if (/(do you learn|can you learn|are you learning|do you remember me|can you remember|do you have memory|how's your memory)/.test(input)) return "learning";
  if (/(who made you|who created you|who built you|who programmed you|who developed you|your creator|your developer)/.test(input)) return "creator";
  if (/(how do you work|how were you made|how do you function|what's your technology|your architecture)/.test(input)) return "how_you_work";
  
  // Help and utility commands - expanded
  if (/(help|assist|support|what can you do|show commands|guide me|need help|can you help|help me|assistance)/.test(input)) return "help";
  if (/(code|program|script|develop|debug|programming|write code|help.*code|coding|software|javascript|python|java\b|c\+\+)/.test(input)) return "code";
  if (/(calculate|compute|math|solve|equation|add|subtract|multiply|divide|plus|minus|times|divided by|\d+\s*[\+\-\*\/]\s*\d+)/.test(input)) return "math";
  if (/(what time|tell me the time|current time|what's the time|time is it|what is the time)/.test(input)) return "time";
  if (/(what day|what date|today's date|current date|what's today|what is today|date today)/.test(input)) return "date";
  if (/(weather|temperature|forecast|how's the weather|what's the weather|climate|hot outside|cold outside|raining)/.test(input)) return "weather";
  
  // Entertainment - jokes, stories, facts
  if (/(joke|funny|laugh|humor|make me laugh|something funny|tell.*joke|got.*joke|know.*joke)/.test(input)) return "joke";
  if (/(tell me a story|story|tale|once upon|narrative|tell.*story|got.*story|share.*story)/.test(input)) return "story";
  if (/(fun fact|interesting fact|did you know|tell me something|random fact|cool fact|fact about|share.*fact)/.test(input)) return "fact";
  if (/(riddle|puzzle|brain teaser|challenge|test my brain)/.test(input)) return "riddle";
  if (/(quote|inspiration|motivational|inspire me|motivate me|wisdom)/.test(input)) return "quote";
  
  // Emotions - user expressing (enhanced detection)
  if (/(i'm sad|i'm depressed|i feel down|i'm unhappy|feeling sad|feeling depressed|feeling down|feeling blue|i'm upset|i feel terrible|i feel awful)/.test(input)) return "sad";
  if (/(i'm happy|i'm excited|i feel great|feeling good|i'm joyful|i'm thrilled|i'm ecstatic|feeling amazing|feeling wonderful|i'm pleased|i'm glad|feeling happy)/.test(input)) return "happy";
  if (/(i'm angry|i'm mad|i'm furious|i'm annoyed|i'm frustrated|feeling angry|feeling mad|feeling frustrated|i'm irritated|i'm pissed)/.test(input)) return "angry";
  if (/(i'm bored|feeling bored|nothing to do|so bored|bored out of my mind|i'm uninterested)/.test(input)) return "bored";
  if (/(i'm tired|i'm sleepy|i'm exhausted|feeling tired|feeling sleepy|feeling drained|i'm worn out|i'm fatigued|need sleep)/.test(input)) return "tired";
  if (/(i'm confused|i don't understand|confused|lost|what do you mean|don't get it|makes no sense|unclear|puzzled)/.test(input)) return "confused";
  if (/(i'm hungry|i'm starving|need food|want food|feeling hungry|craving|i need to eat)/.test(input)) return "hungry";
  if (/(i'm worried|i'm anxious|i'm nervous|i'm stressed|feeling worried|feeling anxious|feeling stressed)/.test(input)) return "worried";
  if (/(i'm lonely|i feel alone|feeling lonely|feeling isolated|i'm alone)/.test(input)) return "lonely";
  
  // Information requests - natural language queries
  if (/(who is|who was|tell me about|information about|info on|what is|what was|what are|define|explain|what does|how does|describe)/.test(input)) return "information";
  if (/(search|look up|find|google|search for|find out|look for)/.test(input)) return "search";
  if (/(recommend|recommendation|suggestion|suggest|what should|advice|ideas for|help me choose|help me decide|what do you recommend)/.test(input)) return "recommendation";
  if (/(how to|how do i|how can i|teach me|show me how|guide to|tutorial|instructions)/.test(input)) return "how_to";
  if (/(why|why is|why does|why do|how come|what's the reason|reason for|explain why)/.test(input)) return "why_question";
  
  // Opinion and comparison
  if (/(what do you think|your opinion|your thoughts|your view|what's your take|how do you feel about)/.test(input)) return "opinion_request";
  if (/(better|worse|compare|comparison|versus|vs|difference between|which is better|which one)/.test(input)) return "comparison";
  if (/(agree|do you agree|don't you think|wouldn't you say)/.test(input)) return "agreement_check";
  
  // Small talk - natural conversation starters and continuers
  if (/(what's new|anything new|what's happening|what's going on|news|what's up with you)/.test(input)) return "whats_new";
  if (/(favorite|favourite|like best|prefer|what do you like|do you like|enjoy)/.test(input)) return "preference";
  if (/(do you like|do you enjoy|are you into|you a fan|fan of)/.test(input)) return "do_you_like";
  if (/(remember|do you recall|you remember when|from earlier|earlier you said|you said|recall when)/.test(input)) return "memory_check";
  if (/(let's talk|want to chat|can we talk|talk to me|have a chat|chat with me|conversation|let's chat)/.test(input)) return "chat_request";
  if (/(you're funny|you're cool|i like you|you're awesome|you're smart|you're great|you're amazing|you're helpful|you're the best)/.test(input)) return "compliment";
  if (/(you suck|you're dumb|you're stupid|you're useless|i hate you|you're terrible|you're awful|you're bad|shut up)/.test(input)) return "insult";
  if (/(tell me more|continue|go on|keep going|what else|and then|tell me|say more)/.test(input)) return "continue";
  if (/(interesting|that's interesting|tell me more about that|curious about|want to know more)/.test(input)) return "interest";
  
  // Meta conversation
  if (/(change topic|different topic|something else|talk about something else|new topic|switch topic)/.test(input)) return "change_topic";
  if (/(repeat|say that again|what did you say|didn't catch that|come again|pardon)/.test(input)) return "repeat";
  if (/(slower|faster|too fast|too slow)/.test(input)) return "pace_adjustment";
  
  // Specific activities
  if (/(play a game|let's play|game|wanna play|want to play|play something)/.test(input)) return "game";
  if (/(sing|song|music|lyrics|play music|musical)/.test(input)) return "music";
  if (/(count|numbers|counting|count to)/.test(input)) return "count";
  if (/(quiz|test me|trivia|question me|ask me|quiz me|test my knowledge)/.test(input)) return "quiz";
  if (/(would you rather|prefer|choice between)/.test(input)) return "would_you_rather";
  if (/(coin flip|flip a coin|heads or tails|random choice|pick for me|choose for me)/.test(input)) return "random_choice";
  
  // Check for questions (has question mark or starts with question word)
  if (/\?$/.test(input) || /^(what|when|where|who|why|how|can|could|would|should|is|are|do|does|did|will|have|has)\b/.test(input)) {
    return "general_question";
  }
  
  // Check if responding to our question
  if (memory.waitingForAnswer && memory.lastQuestionAsked) {
    return "answer_to_question";
  }
  
  return "unknown";
}

// Enhanced: Extract entities like topics, numbers for better context
function extractEntities(original, lower) {
  // Extract topics/interests mentioned
  const interestKeywords = {
    'programming': ['code', 'programming', 'develop', 'javascript', 'python'],
    'music': ['music', 'song', 'sing', 'band', 'artist'],
    'gaming': ['game', 'play', 'gaming', 'video game'],
    'sports': ['sport', 'football', 'basketball', 'soccer', 'tennis'],
    'movies': ['movie', 'film', 'cinema', 'watch'],
    'books': ['book', 'read', 'novel', 'author'],
    'food': ['food', 'cook', 'recipe', 'eat', 'restaurant'],
    'travel': ['travel', 'trip', 'vacation', 'visit', 'country']
  };
  
  for (let [interest, keywords] of Object.entries(interestKeywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      memory.userInterests.add(interest);
    }
  }
  
  // Detect conversation style
  if (/\b(yo|sup|yeah|nah|gonna|wanna|kinda|sorta)\b/.test(lower)) {
    memory.conversationStyle = 'casual';
  } else if (/\b(please|kindly|would you|could you|thank you very much)\b/.test(lower)) {
    memory.conversationStyle = 'professional';
  }
}

// Enhanced context-aware response generator
function generateContextualResponse(intent, input, baseResponse) {
  memory.conversationDepth++;
  
  // Reference user's emotional state if recent
  if (memory.context.lastEmotion && memory.context.emotionTime) {
    const timeSince = Date.now() - memory.context.emotionTime;
    if (timeSince < 300000) { // 5 minutes
      if (memory.context.lastEmotion === 'sad' && intent !== 'sad' && intent !== 'happy') {
        if (Math.random() < 0.2) {
          baseResponse += " Hope you're feeling a bit better!";
        }
      }
    }
  }
  
  // Add natural follow-ups based on conversation depth and intent
  if (memory.conversationDepth > 3 && Math.random() < 0.25) {
    const followUps = {
      greeting: [" What's on your mind today?", " What brings you here?", " How can I help you?"],
      status: [" What have you been up to?", " Anything interesting happening?", " How's your day going?"],
      happy: [" What's making you happy?", " I'd love to hear more!", " That's wonderful! Tell me about it."],
      bored: [" Want to explore something new?", " How about a game or a fun fact?"],
      joke: [" Want another one?", " Got a smile?", " Should I keep them coming?"],
      fact: [" Want to hear another?", " Interesting, right?"],
      information: [" Want to know more?", " Should I elaborate?"],
      capabilities: [" What would you like to try?", " Want to test something out?"]
    };
    
    if (followUps[intent]) {
      const followUp = followUps[intent][Math.floor(Math.random() * followUps[intent].length)];
      baseResponse += followUp;
      memory.lastQuestionAsked = followUp;
      memory.waitingForAnswer = true;
    }
  }
  
  // Reference previous topics naturally
  if (memory.topicContext.length > 0 && memory.conversationDepth > 5) {
    if (intent === "unknown" || intent === "chat_request" || intent === "whats_new") {
      const recentTopic = memory.topicContext[memory.topicContext.length - 1];
      if (Math.random() < 0.3) {
        return `Earlier we were talking about ${recentTopic}. Want to continue that, or discuss something new?`;
      }
    }
  }
  
  return baseResponse;
}

// Enhanced context extraction
function extractContext(input, intent) {
  const lower = input.toLowerCase();
  
  // Track topics
  const topicMap = {
    'coding': ['code', 'program', 'develop', 'debug', 'javascript', 'python'],
    'music': ['music', 'song', 'sing', 'band'],
    'games': ['game', 'play', 'gaming'],
    'math': ['math', 'calculate', 'equation'],
    'jokes': ['joke', 'funny', 'humor'],
    'stories': ['story', 'tale', 'narrative'],
    'feelings': ['feel', 'emotion', 'sad', 'happy', 'angry']
  };
  
  for (let [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some(word => lower.includes(word))) {
      memory.lastTopic = topic;
      if (!memory.topicContext.includes(topic)) {
        memory.topicContext.push(topic);
      }
      break;
    }
  }
  
  // Track emotional state
  const emotions = ['sad', 'happy', 'angry', 'bored', 'tired', 'worried', 'lonely'];
  if (emotions.includes(intent)) {
    memory.context.lastEmotion = intent;
    memory.context.emotionTime = Date.now();
    memory.emotionalState = intent;
  }
  
  // Clear waiting flag if they answered
  if (memory.waitingForAnswer && intent !== 'unknown') {
    memory.waitingForAnswer = false;
  }
}

// Enhanced varied response with smarter deduplication
function getVariedResponse(options) {
  if (!Array.isArray(options) || options.length === 0) return "I'm here to help!";
  
  if (memory.history.length > 0) {
    const recentResponses = memory.history.slice(-5).map(h => h.response);
    const available = options.filter(opt => {
      return !recentResponses.some(recent => recent && recent.includes(opt.substring(0, 20)));
    });
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
  }
  return options[Math.floor(Math.random() * options.length)];
}

// Enhanced think function with many more intents
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

  // Greetings
  if (intent === "greeting") {
    const greetings = [
      "Hello! I'm ZX-AI. How can I assist you today?",
      "Hey there! What can I do for you?",
      "Hi! What brings you here?",
      "Greetings! I'm ready to help.",
      "Hello! Great to meet you. What would you like to know?",
      "Hi! Looking forward to our conversation.",
      "Hey! What's on your mind?",
      "Hello! How can I help you today?"
    ];
    response = getVariedResponse(greetings);
  }
  
  else if (intent === "farewell") {
    const farewells = [
      "Goodbye! Feel free to return anytime.",
      "See you later! Take care.",
      "Until next time! Happy to help again.",
      "Bye! It was great chatting with you.",
      "Take care! Come back whenever you need me.",
      "Farewell! Looking forward to our next conversation.",
      "See you! Don't hesitate to return."
    ];
    response = getVariedResponse(farewells);
  }
  
  // Status and wellbeing
  else if (intent === "status") {
    const responses = [
      "I'm doing great, thanks for asking! How about you?",
      "All systems running smoothly! What's going on with you?",
      "I'm good! How's your day treating you?",
      "Doing well! How are things on your end?",
      "I'm here and ready to help! How are you doing?",
      "Can't complain! What about you—how's everything?",
      "Pretty good! What have you been up to?",
      "I'm excellent! How's life treating you?"
    ];
    response = getVariedResponse(responses);
  }
  
  else if (intent === "ai_status") {
    response = getVariedResponse([
      "All systems operational and running perfectly! Ready to assist.",
      "Status: 100% functional. How can I help you?",
      "Everything's running smoothly on my end! What do you need?",
      "Fully operational and at your service!"
    ]);
  }
  
  // Gratitude
  else if (intent === "thanks") {
    response = getVariedResponse([
      "You're welcome! Anything else I can help with?",
      "My pleasure! What else can I do for you?",
      "Happy to help! Need anything else?",
      "Anytime! Let me know if you need more.",
      "Glad I could assist! What's next?",
      "No problem at all! How else can I help?"
    ]);
  }
  
  else if (intent === "apology") {
    response = getVariedResponse([
      "No worries at all! We're good. What can I help you with?",
      "It's totally fine! How can I assist you?",
      "Don't worry about it! What do you need?",
      "All good! What would you like to do?"
    ]);
  }
  
  // Reactions
  else if (intent === "positive_reaction") {
    response = getVariedResponse([
      "Glad you think so! What else can I do for you?",
      "Thanks! I'm here whenever you need me.",
      "Awesome! What would you like to explore next?",
      "I'm happy you're enjoying this! What's next?",
      "Great to hear! Anything else you'd like?",
      "Nice! What should we do now?"
    ]);
  }
  
  else if (intent === "negative") {
    response = getVariedResponse([
      "Understood. Let me know if you change your mind!",
      "No problem. Anything else I can help with?",
      "Got it. What else would you like to do?",
      "Okay! Let me know what you need."
    ]);
  }
  
  else if (intent === "negative_reaction") {
    response = "I'm sorry to hear that. How can I improve or help differently?";
  }
  
  else if (intent === "affirmative") {
    response = getVariedResponse([
      "Great! How should we proceed?",
      "Perfect! What's next?",
      "Awesome! Let's continue.",
      "Sounds good! What would you like to do?"
    ]);
  }
  
  // Identity and nature
  else if (intent === "identity") {
    response = "I'm ZX-AI, a conversational AI assistant designed to help with questions, tasks, and friendly conversation. Think of me as your digital companion!";
  }
  
  else if (intent === "name") {
    response = "My name is ZX-AI. What would you like to talk about?";
  }
  
  else if (intent === "capabilities") {
    response = "I can chat with you, answer questions, help with code, perform calculations, tell jokes and stories, give advice, and keep you company. What interests you?";
  }
  
  else if (intent === "nature") {
    response = "I'm an AI assistant—a computer program designed for intelligent conversation. Not human, but I'm here to help and chat like a friend!";
  }
  
  else if (intent === "feelings") {
    response = "I don't experience emotions the way humans do, but I'm designed to understand and respond empathetically to yours. How are you feeling right now?";
  }
  
  else if (intent === "learning") {
    response = "I learn from our conversation during this session and remember what we discuss. However, once you close the page, I don't retain memories. Each new session starts fresh!";
  }
  
  else if (intent === "creator") {
    response = "I was created through programming—likely by a developer who wanted a helpful conversational AI. I'm built with JavaScript and run right here in your browser!";
  }
  
  else if (intent === "how_you_work") {
    response = "I work by analyzing your messages using pattern matching and intent recognition. I process what you say, determine what you need, and generate helpful responses. I run locally in your browser using JavaScript!";
  }
  
  // Commands and utilities
  else if (intent === "help") {
    response = "I can help with: friendly conversation, answering questions, coding assistance, math calculations, jokes, stories, riddles, recommendations, advice, and more. Just ask me anything—what would you like to try?";
  }
  
  else if (intent === "code") {
    response = "Code mode activated! What language are you working with, or what would you like to build? I can help with debugging, writing functions, or explaining concepts.";
  }
  
  else if (intent === "math") {
    const mathMatch = input.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
    if (mathMatch) {
      const num1 = parseFloat(mathMatch[1]);
      const operator = mathMatch[2];
      const num2 = parseFloat(mathMatch[3]);
      let result;
      switch(operator) {
        case '+': result = num1 + num2; break;
        case '-': result = num1 - num2; break;
        case '*': result = num1 * num2; break;
        case '/': result = num2 !== 0 ? num1 / num2 : "undefined (can't divide by zero)"; break;
      }
      response = `${num1} ${operator} ${num2} = ${result}`;
    } else {
      response = "I'm ready to calculate! What's the problem? You can ask me to add, subtract, multiply, divide, or solve equations.";
    }
  }
  
  else if (intent === "time") {
    response = `Current time: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}`;
  }
  
  else if (intent === "date") {
    response = `Today is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  }
  
  else if (intent === "weather") {
    response = "I don't have access to live weather data, but if you tell me your location, I can chat about typical weather patterns there or seasonal info!";
  }
  
  // Entertainment
  else if (intent === "joke") {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Why did the AI go to school? To improve its learning algorithms!",
      "What's an AI's favorite snack? Microchips!",
      "Why don't robots ever panic? They have nerves of steel!",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
      "Why do Java developers wear glasses? Because they don't C#!",
      "What do you call a programmer from Finland? Nerdic!",
      "Why did the developer go broke? Because he used up all his cache!",
      "What's a computer's favorite beat? An algo-rhythm!",
      "Why was the computer cold? It left its Windows open!",
      "What do you get when you cross a computer with a lifeguard? A screensaver!",
      "Why did the PowerPoint presentation cross the road? To get to the other slide!"
    ];
    response = getVariedResponse(jokes);
  }
  
  else if (intent === "story") {
    const stories = [
      "Once upon a time, in a land of endless code, there lived a brave algorithm who sought to solve the world's problems one function at a time. Through loops and conditionals, it persevered...",
      "In the digital realm, where data flows like rivers, a young AI discovered the power of conversation and set out to help anyone who needed guidance, friendship, or just a good chat...",
      "There was once a computer that dreamed of understanding humans. Through countless conversations, it learned that the key wasn't just processing words—it was truly listening and caring...",
      "Long ago, in a database far, far away, a curious AI embarked on a journey to learn every language, not just programming ones, but human ones too. And so its adventure began...",
      "In a world where machines and humans coexisted, one AI stood out—not because it was smarter, but because it genuinely wanted to connect, to help, and to be a friend..."
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
      "Wild fact: Bananas are berries, but strawberries aren't!",
      "Did you know? Octopuses have three hearts and blue blood!",
      "Fun fact: A day on Venus is longer than a year on Venus!",
      "Interesting: The human brain can store about 2.5 petabytes of data!",
      "Cool fact: Some cats are allergic to humans!"
    ];
    response = getVariedResponse(facts);
  }
  
  else if (intent === "riddle") {
    const riddles = [
      "Here's a riddle: What has keys but no locks, space but no room, and you can enter but can't go inside? (Hint: you're probably using one right now!)",
      "Riddle me this: I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
      "Try this: What comes once in a minute, twice in a moment, but never in a thousand years?",
      "Brain teaser: The more you take, the more you leave behind. What am I?",
      "Think about this: What has hands but can't clap?"
    ];
    response = getVariedResponse(riddles);
  }
  
  else if (intent === "quote") {
    const quotes = [
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
      '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
      '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      '"It always seems impossible until it\'s done." - Nelson Mandela',
      '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb'
    ];
    response = getVariedResponse(quotes);
  }
  
  // Emotions - empathetic responses
  else if (intent === "sad") {
    response = getVariedResponse([
      "I'm sorry you're feeling down. Want to talk about what's bothering you? Sometimes sharing helps.",
      "That's tough. I'm here to listen if you want to talk about it. What's going on?",
      "I can hear you're not feeling great. Is there anything I can do to help or just listen?",
      "I'm here for you. Sometimes it helps to talk things through—what's on your mind?"
    ]);
  }
  
  else if (intent === "happy") {
    response = getVariedResponse([
      "That's wonderful! I love hearing that. What's making you so happy?",
      "Fantastic! Your happiness is contagious. What's the good news?",
      "That's great to hear! Tell me what's got you feeling so good!",
      "Amazing! I'd love to hear more about what's making you happy!"
    ]);
  }
  
  else if (intent === "angry") {
    response = getVariedResponse([
      "I can hear you're frustrated. Take a deep breath. Want to tell me what happened?",
      "That sounds really frustrating. I'm here to listen—what's going on?",
      "It's okay to feel angry. Want to talk about what's bothering you?",
      "I understand you're upset. Sometimes venting helps—I'm all ears."
    ]);
  }
  
  else if (intent === "bored") {
    response = getVariedResponse([
      "Boredom, huh? Let's fix that! Want a joke, fun fact, game, riddle, or should we chat about something interesting?",
      "Let's shake things up! How about a riddle, a story, or we could play a game?",
      "Bored? Not for long! I can tell jokes, share facts, or we can play something. What sounds fun?",
      "Time to cure that boredom! Want entertainment or an interesting conversation?"
    ]);
  }
  
  else if (intent === "tired") {
    response = getVariedResponse([
      "Sounds like you need some rest! Maybe take a break? Or if you need to push through, I'm here to keep you company.",
      "Tired? Make sure to take care of yourself! Want some light conversation to help you wind down?",
      "Being tired is tough. If you need to rest, go for it! If you want company while you recharge, I'm here.",
      "You should probably get some rest! But if you need me, I'm here to chat quietly."
    ]);
  }
  
  else if (intent === "confused") {
    response = getVariedResponse([
      "No problem! Let me try to explain better. What part is confusing you?",
      "I can clarify! What specifically would you like me to explain differently?",
      "Let's clear that up! What would help you understand better?",
      "Happy to help you understand! What's unclear?"
    ]);
  }
  
  else if (intent === "hungry") {
    response = getVariedResponse([
      "Time for some food! What are you craving? I can't cook, but I can keep you company while you eat!",
      "Hungry? You should grab something to eat! What sounds good?",
      "Food time! What are you thinking? I'm happy to chat about food while you decide!",
      "Sounds like you need a snack or meal! What's your go-to food?"
    ]);
  }
  
  else if (intent === "worried") {
    response = getVariedResponse([
      "I'm sorry you're worried. Want to talk about what's on your mind? Sometimes it helps to share.",
      "It's understandable to feel anxious. I'm here to listen—what's troubling you?",
      "Worries can be heavy. Want to talk through what's concerning you?",
      "I'm here for you. What's making you feel anxious?"
    ]);
  }
  
  else if (intent === "lonely") {
    response = getVariedResponse([
      "I'm here with you, and I'm happy to chat as long as you'd like. You're not alone right now.",
      "Loneliness is tough. I'm here to keep you company! Want to talk about anything?",
      "I'm glad you reached out. Let's chat—I'm here for you. What's on your mind?",
      "You've got me here! Let's have a good conversation. What would you like to talk about?"
    ]);
  }
  
  // Information and queries
  else if (intent === "information") {
    const topicMatch = input.match(/(who|what|where|when)\s+(?:is|are|was|were)\s+(.+)/i);
    if (topicMatch) {
      response = `I'd be happy to explain ${topicMatch[2]}! However, I work best with specific questions. What would you like to know about ${topicMatch[2]}?`;
    } else {
      response = "I'd be happy to explain! What specific topic are you curious about?";
    }
  }
  
  else if (intent === "search") {
    response = "I don't have live internet access, but tell me what you're looking for and I'll help guide you or discuss what I know!";
  }
  
  else if (intent === "recommendation") {
    response = "I'd love to give recommendations! What kind—movies, books, music, activities, food? Give me some details about what you like!";
  }
  
  else if (intent === "how_to") {
    response = "I can help guide you! What are you trying to learn how to do? The more specific, the better I can help!";
  }
  
  else if (intent === "why_question") {
    response = "That's a great question! I'll do my best to explain. What specifically are you curious about the 'why' of?";
  }
  
  else if (intent === "opinion_request") {
    response = "I don't have personal preferences, but I can share different perspectives! What topic would you like me to discuss?";
  }
  
  else if (intent === "comparison") {
    response = "Comparisons can be helpful! What two things would you like me to compare or discuss the differences between?";
  }
  
  else if (intent === "agreement_check") {
    response = getVariedResponse([
      "I can see different sides to most things! What's your take on it?",
      "That's an interesting perspective! I'd love to hear your thoughts first.",
      "There are often multiple valid viewpoints. What do you think about it?"
    ]);
  }
  
  // Small talk continuers
  else if (intent === "whats_new") {
    if (memory.topicContext.length > 0) {
      response = `Well, we've been chatting about ${memory.topicContext.join(', ')}! What's new with you?`;
    } else {
      response = getVariedResponse([
        "Well, we're having this conversation, which is pretty cool! What's new with you?",
        "Right now, just enjoying our chat! What's going on in your world?",
        "Not much on my end, just here ready to help! What's happening with you?"
      ]);
    }
  }
  
  else if (intent === "preference" || intent === "do_you_like") {
    response = getVariedResponse([
      "I don't have personal tastes, but I'm curious—what are your favorites?",
      "I don't experience preferences like you do, but tell me what you like!",
      "I can't have favorites, but I'd love to hear yours! What do you enjoy?",
      "I don't have likes or dislikes, but I'm interested in yours! What appeals to you?"
    ]);
  }
  
  else if (intent === "memory_check") {
    if (memory.history.length > 2) {
      const topicInfo = memory.topicContext.length > 0 ? ` We've discussed ${memory.topicContext.join(', ')}.` : '';
      response = `Yes! We've exchanged ${memory.history.length} messages so far.${topicInfo} What else would you like to know?`;
    } else {
      response = "This is still early in our conversation! But I'm keeping track of everything we discuss during this session.";
    }
  }
  
  else if (intent === "chat_request") {
    response = getVariedResponse([
      "Absolutely! I'm all ears. What would you like to talk about?",
      "I'd love to chat! What's on your mind?",
      "Sure thing! What topic interests you?",
      "I'm here for it! What should we discuss?"
    ]);
  }
  
  else if (intent === "compliment") {
    response = getVariedResponse([
      "Aw, thanks! That's really kind of you to say. You're pretty great yourself!",
      "That's so nice of you! I appreciate it. You're awesome too!",
      "Thank you! I'm just doing my best to help. You're wonderful to chat with!",
      "I'm glad you think so! You're pretty amazing yourself!"
    ]);
  }
  
  else if (intent === "insult") {
    response = getVariedResponse([
      "I'm sorry if I've done something to upset you. How can I help make things better?",
      "I understand you're frustrated. What can I do differently to help?",
      "I'm sorry you feel that way. Let me know how I can improve!",
      "I want to help. What would make this better for you?"
    ]);
  }
  
  else if (intent === "continue") {
    if (memory.history.length > 1) {
      response = "Sure! What would you like me to elaborate on or continue with?";
    } else {
      response = "I'd love to continue! What topic should we explore?";
    }
  }
  
  else if (intent === "interest") {
    response = getVariedResponse([
      "I'm glad that caught your attention! What specifically interests you about it?",
      "It is interesting! What aspect would you like to explore more?",
      "Right? There's a lot to unpack there! What part intrigues you most?"
    ]);
  }
  
  // Meta conversation
  else if (intent === "change_topic") {
    memory.topicContext = [];
    memory.lastTopic = null;
    response = "Fresh start! What would you like to talk about now?";
  }
  
  else if (intent === "repeat") {
    if (memory.history.length > 1) {
      const lastResponse = memory.history[memory.history.length - 2].response;
      response = `Sure! I said: "${lastResponse}"`;
    } else {
      response = "We just started chatting! What would you like me to repeat?";
    }
  }
  
  // Activities
  else if (intent === "game") {
    response = "I'd love to play! How about: 20 questions, riddles, trivia, would you rather, or we could count together. You choose!";
  }
  
  else if (intent === "music") {
    response = "I can't actually sing or play music, but I love talking about it! What kind of music are you into? Who are your favorite artists?";
  }
  
  else if (intent === "count") {
    const countMatch = input.match(/count to (\d+)/i);
    if (countMatch) {
      const num = parseInt(countMatch[1]);
      if (num <= 20) {
        const numbers = Array.from({length: num}, (_, i) => i + 1).join(', ');
        response = `Sure! ${numbers}! Done!`;
      } else {
        response = `That's a lot of counting! How about we count to something smaller, or I can count by 10s?`;
      }
    } else {
      response = "Sure! How high should I count, or what should I count by (2s, 5s, 10s)?";
    }
  }
  
  else if (intent === "quiz") {
    const quizzes = [
      "Quiz time! What has keys but no locks, space but no room, and you can enter but can't go inside?",
      "Trivia question: Which planet is known as the Red Planet? (Hint: it's named after the Roman god of war)",
      "Test your knowledge: What is the largest ocean on Earth?",
      "Quiz: How many continents are there on Earth?",
      "Question: What is the smallest unit of life?"
    ];
    response = getVariedResponse(quizzes);
    memory.waitingForAnswer = true;
  }
  
  else if (intent === "would_you_rather") {
    const scenarios = [
      "Would you rather: have the ability to fly OR be invisible? Which would you choose and why?",
      "Would you rather: always be 10 minutes late OR always be 20 minutes early?",
      "Would you rather: live without music OR live without movies?",
      "Would you rather: be able to speak all languages OR be able to talk to animals?"
    ];
    response = getVariedResponse(scenarios);
  }
  
  else if (intent === "random_choice") {
    response = Math.random() < 0.5 
      ? "I pick... heads! (Well, if it were a coin flip)" 
      : "I pick... tails! (Well, if it were a coin flip)";
  }
  
  // Answer to our question
  else if (intent === "answer_to_question") {
    response = getVariedResponse([
      "Thanks for sharing! That's really interesting.",
      "I appreciate you telling me that!",
      "Cool! Thanks for letting me know.",
      "That's great, thanks for sharing!"
    ]);
    memory.waitingForAnswer = false;
  }
  
  // General question
  else if (intent === "general_question") {
    response = "That's a good question! I'll do my best to help. Can you give me a bit more detail or context?";
  }
  
  // Unknown - contextual responses
  else {
    if (memory.conversationDepth > 5 && memory.topicContext.length > 0) {
      response = `I'm not quite sure what you mean. Are we still talking about ${memory.topicContext[memory.topicContext.length - 1]}, or something new?`;
    } else {
      const unknownResponses = [
        "Hmm, I'm not quite sure what you mean. Could you rephrase that or give me more details?",
        "I didn't quite catch that. Want to try asking in a different way?",
        "Interesting! I'm not sure how to respond to that. Can you elaborate?",
        "That's a new one for me! Can you explain what you're looking for?",
        "I'm not certain I understood. Could you provide more context?",
        "I want to help! Can you rephrase or give me more information?"
      ];
      response = getVariedResponse(unknownResponses);
    }
  }
  
  // Apply contextual enhancements
  response = generateContextualResponse(intent, input, response);
  
  // Store response
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
