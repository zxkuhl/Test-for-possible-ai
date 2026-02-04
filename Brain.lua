-- Memory system
local memory = {
    name = "ZX-AI",
    history = {},
    context = {},
    lastTopic = nil,
    conversationDepth = 0,
    knownTerms = {} -- Track terms we've learned (using table as set)
}

-- Common words set
local commonWords = {
    ['the'] = true, ['a'] = true, ['an'] = true, ['and'] = true, ['or'] = true, 
    ['but'] = true, ['in'] = true, ['on'] = true, ['at'] = true, ['to'] = true, 
    ['for'] = true, ['of'] = true, ['with'] = true, ['by'] = true, ['from'] = true, 
    ['up'] = true, ['about'] = true, ['into'] = true, ['through'] = true, ['during'] = true,
    ['is'] = true, ['are'] = true, ['was'] = true, ['were'] = true, ['be'] = true, 
    ['been'] = true, ['being'] = true, ['have'] = true, ['has'] = true, ['had'] = true,
    ['do'] = true, ['does'] = true, ['did'] = true, ['will'] = true, ['would'] = true, 
    ['could'] = true, ['should'] = true, ['may'] = true, ['might'] = true,
    ['can'] = true, ['what'] = true, ['when'] = true, ['where'] = true, ['who'] = true, 
    ['why'] = true, ['how'] = true, ['which'] = true, ['this'] = true,
    ['that'] = true, ['these'] = true, ['those'] = true, ['i'] = true, ['you'] = true, 
    ['he'] = true, ['she'] = true, ['it'] = true, ['we'] = true, ['they'] = true,
    ['my'] = true, ['your'] = true, ['his'] = true, ['her'] = true, ['its'] = true, 
    ['our'] = true, ['their'] = true, ['me'] = true, ['him'] = true, ['us'] = true,
    ['them'] = true, ['myself'] = true, ['yourself'] = true, ['himself'] = true, 
    ['herself'] = true, ['itself'] = true, ['ourselves'] = true,
    ['hi'] = true, ['hello'] = true, ['hey'] = true, ['thanks'] = true, ['please'] = true, 
    ['yes'] = true, ['no'] = true, ['okay'] = true, ['ok'] = true
}

-- Known specialized terms
local knownSpecializedTerms = {
    ['ai'] = true, ['code'] = true, ['programming'] = true, ['javascript'] = true, 
    ['python'] = true, ['html'] = true, ['css'] = true,
    ['computer'] = true, ['software'] = true, ['hardware'] = true, ['algorithm'] = true, 
    ['data'] = true, ['function'] = true,
    ['variable'] = true, ['array'] = true, ['object'] = true, ['class'] = true, 
    ['method'] = true, ['api'] = true, ['database'] = true,
    ['server'] = true, ['client'] = true, ['browser'] = true, ['website'] = true, 
    ['app'] = true, ['application'] = true,
    ['internet'] = true, ['email'] = true, ['password'] = true, ['login'] = true, 
    ['user'] = true, ['file'] = true, ['folder'] = true,
    ['weather'] = true, ['time'] = true, ['date'] = true, ['joke'] = true, ['story'] = true, 
    ['game'] = true, ['music'] = true, ['song'] = true,
    ['movie'] = true, ['book'] = true, ['food'] = true, ['restaurant'] = true, 
    ['math'] = true, ['calculate'] = true, ['number'] = true
}

-- Helper function to split string
local function split(str, delimiter)
    local result = {}
    local pattern = string.format("([^%s]+)", delimiter or "%s")
    for match in string.gmatch(str, pattern) do
        table.insert(result, match)
    end
    return result
end

-- Helper function to check if value is in table
local function contains(tbl, value)
    for _, v in ipairs(tbl) do
        if v == value then
            return true
        end
    end
    return false
end

-- Check if input contains unknown terms and search for them
local function identifyUnknownTerms(input)
    -- Remove punctuation except hyphens and split into words
    local cleaned = string.gsub(input:lower(), "[^%w%s%-]", " ")
    local words = split(cleaned, "%s+")
    
    local unknownTerms = {}
    
    for _, word in ipairs(words) do
        if #word > 2 then
            -- Skip if it's a common word, known specialized term, or already learned
            if not commonWords[word] and 
               not knownSpecializedTerms[word] and 
               not memory.knownTerms[word] then
                
                -- Check if it looks like a specialized term
                local mightBeSpecialized = 
                    string.match(word, "^[A-Z][A-Z]+$") or -- All caps (acronym)
                    string.find(word, "%-") or -- Hyphenated term
                    #word > 12 -- Long unusual word
                
                if mightBeSpecialized and not contains(unknownTerms, word) then
                    table.insert(unknownTerms, word)
                end
            end
        end
    end
    
    return unknownTerms
end

-- Search dictionary API for term meaning
local function searchTermMeaning(term)
    -- NOTE: In Lua, you'll need to use a library like LuaSocket or lua-http
    -- for HTTP requests. This is a placeholder showing the structure.
    print(string.format('Searching for: "%s"', term))
    
    -- Placeholder for actual HTTP request
    -- In a real implementation, you'd use:
    -- local http = require("socket.http")
    -- local json = require("json") -- or cjson, dkjson, etc.
    -- local url = string.format("https://api.dictionaryapi.dev/api/v2/entries/en/%s", term)
    -- local response, status = http.request(url)
    
    -- For now, return a mock result
    memory.knownTerms[term:lower()] = true
    
    return {
        term = term,
        searched = true,
        found = false,
        definition = nil
    }
end

-- Parse intent with better pattern matching
local function parseIntent(input)
    local lowerInput = input:lower()
    local trimmedInput = string.match(lowerInput, "^%s*(.-)%s*$")
    
    -- Check for question words
    local isQuestion = string.match(trimmedInput, "^(what|who|when|where|why|how|can|could|would|should|do|does|is|are|will)%s") ~= nil
    local hasQuestionMark = string.find(input, "?") ~= nil
    
    -- Greetings
    if string.match(lowerInput, "(^|%s)(hi|hello|hey|greetings|howdy|sup|yo|hiya|heya)(%s|$|!|?)") then 
        return "greeting" 
    end
    if string.match(lowerInput, "(^|%s)(bye|goodbye|see you|later|farewell|cya|peace|gotta go|gtg)(%s|$|!|?)") then 
        return "farewell" 
    end
    
    -- Status checks
    if string.match(lowerInput, "how are you") or string.match(lowerInput, "how're you") or 
       string.match(lowerInput, "you good") or string.match(lowerInput, "you okay") then 
        return "status" 
    end
    if string.match(lowerInput, "what's up") or string.match(lowerInput, "wassup") or 
       string.match(lowerInput, "how's it going") then 
        return "status" 
    end
    if string.match(lowerInput, "what's your status") or string.match(lowerInput, "system status") then 
        return "ai_status" 
    end
    
    -- Gratitude
    if string.match(lowerInput, "thank") or string.match(lowerInput, "thx") or 
       string.match(lowerInput, "appreciate") then 
        return "thanks" 
    end
    
    -- Apology
    if string.match(lowerInput, "sorry") or string.match(lowerInput, "apologize") or 
       string.match(lowerInput, "my bad") then 
        return "apology" 
    end
    
    -- Reactions
    if string.match(lowerInput, "(^|%s)(cool|awesome|nice|great|amazing|excellent)(%s|$|!|?)") then 
        return "positive_reaction" 
    end
    if string.match(lowerInput, "^(no|nope|nah|not really)(%s|$|!|?)") then 
        return "negative" 
    end
    if string.match(lowerInput, "^(yes|yeah|yep|yup|sure|okay|ok)(%s|$|!|?)") then 
        return "affirmative" 
    end
    
    -- Identity questions
    if string.match(lowerInput, "who are you") or string.match(lowerInput, "what are you") or 
       string.match(lowerInput, "tell me about yourself") then 
        return "identity" 
    end
    if string.match(lowerInput, "what's your name") or string.match(lowerInput, "your name") then 
        return "name" 
    end
    if string.match(lowerInput, "what can you do") or string.match(lowerInput, "your capabilities") then 
        return "capabilities" 
    end
    if string.match(lowerInput, "are you real") or string.match(lowerInput, "are you human") or 
       string.match(lowerInput, "are you ai") then 
        return "nature" 
    end
    if string.match(lowerInput, "do you have feelings") or string.match(lowerInput, "can you feel") then 
        return "feelings" 
    end
    if string.match(lowerInput, "do you learn") or string.match(lowerInput, "can you learn") or 
       string.match(lowerInput, "do you remember") then 
        return "learning" 
    end
    
    -- Help and commands
    if string.match(lowerInput, "help") or string.match(lowerInput, "assist") or 
       string.match(lowerInput, "what can you do") then 
        return "help" 
    end
    if string.match(lowerInput, "code") or string.match(lowerInput, "program") or 
       string.match(lowerInput, "script") then 
        return "code" 
    end
    if string.match(lowerInput, "calculate") or string.match(lowerInput, "math") or 
       string.match(lowerInput, "%d+%s*[+%-*/]%s*%d+") then 
        return "math" 
    end
    if string.match(lowerInput, "what time") or string.match(lowerInput, "current time") then 
        return "time" 
    end
    if string.match(lowerInput, "what day") or string.match(lowerInput, "what date") or 
       string.match(lowerInput, "today's date") then 
        return "date" 
    end
    if string.match(lowerInput, "weather") or string.match(lowerInput, "temperature") or 
       string.match(lowerInput, "forecast") then 
        return "weather" 
    end
    
    -- Entertainment
    if string.match(lowerInput, "joke") or string.match(lowerInput, "funny") or 
       string.match(lowerInput, "make me laugh") then 
        return "joke" 
    end
    if string.match(lowerInput, "story") or string.match(lowerInput, "tale") or 
       string.match(lowerInput, "once upon") then 
        return "story" 
    end
    if string.match(lowerInput, "fun fact") or string.match(lowerInput, "interesting fact") or 
       string.match(lowerInput, "did you know") then 
        return "fact" 
    end
    
    -- Emotions
    if string.match(lowerInput, "i'm sad") or string.match(lowerInput, "i'm depressed") or 
       string.match(lowerInput, "feeling sad") then 
        return "sad" 
    end
    if string.match(lowerInput, "i'm happy") or string.match(lowerInput, "i'm excited") or 
       string.match(lowerInput, "feeling good") then 
        return "happy" 
    end
    if string.match(lowerInput, "i'm angry") or string.match(lowerInput, "i'm mad") or 
       string.match(lowerInput, "i'm frustrated") then 
        return "angry" 
    end
    if string.match(lowerInput, "i'm bored") or string.match(lowerInput, "feeling bored") then 
        return "bored" 
    end
    if string.match(lowerInput, "i'm tired") or string.match(lowerInput, "i'm sleepy") or 
       string.match(lowerInput, "i'm exhausted") then 
        return "tired" 
    end
    if string.match(lowerInput, "i'm confused") or string.match(lowerInput, "i don't understand") then 
        return "confused" 
    end
    if string.match(lowerInput, "i'm hungry") or string.match(lowerInput, "i'm starving") then 
        return "hungry" 
    end
    
    -- Information requests
    if isQuestion and (string.match(lowerInput, "who is") or string.match(lowerInput, "what is") or 
       string.match(lowerInput, "tell me about")) then 
        return "information" 
    end
    if string.match(lowerInput, "search") or string.match(lowerInput, "look up") or 
       string.match(lowerInput, "find") then 
        return "search" 
    end
    if string.match(lowerInput, "recommend") or string.match(lowerInput, "suggestion") or 
       string.match(lowerInput, "suggest") then 
        return "recommendation" 
    end
    
    -- Small talk
    if string.match(lowerInput, "what's new") or string.match(lowerInput, "anything new") then 
        return "whats_new" 
    end
    if string.match(lowerInput, "favorite") or string.match(lowerInput, "favourite") or 
       string.match(lowerInput, "prefer") then 
        return "preference" 
    end
    if string.match(lowerInput, "do you like") or string.match(lowerInput, "do you enjoy") then 
        return "do_you_like" 
    end
    if string.match(lowerInput, "remember") or string.match(lowerInput, "do you recall") then 
        return "memory_check" 
    end
    if string.match(lowerInput, "let's talk") or string.match(lowerInput, "want to chat") then 
        return "chat_request" 
    end
    if string.match(lowerInput, "you're funny") or string.match(lowerInput, "you're cool") or 
       string.match(lowerInput, "i like you") then 
        return "compliment" 
    end
    if string.match(lowerInput, "you suck") or string.match(lowerInput, "you're dumb") or 
       string.match(lowerInput, "i hate you") then 
        return "insult" 
    end
    
    -- Activities
    if string.match(lowerInput, "play a game") or string.match(lowerInput, "let's play") then 
        return "game" 
    end
    if string.match(lowerInput, "sing") or string.match(lowerInput, "song") or 
       string.match(lowerInput, "music") then 
        return "music" 
    end
    if string.match(lowerInput, "count") or string.match(lowerInput, "counting") then 
        return "count" 
    end
    if string.match(lowerInput, "quiz") or string.match(lowerInput, "test me") or 
       string.match(lowerInput, "trivia") then 
        return "quiz" 
    end
    
    -- Definition requests
    if string.match(lowerInput, "what does .+ mean") or string.match(lowerInput, "define") or 
       string.match(lowerInput, "meaning of") then 
        return "definition_request" 
    end
    
    return "unknown"
end

-- Handle definition requests
local function handleDefinitionRequest(input)
    local patterns = {
        "what does (.+) mean",
        "meaning of (.+)",
        "define (.+)",
        "definition of (.+)",
        "what is (.+)",
        "explain (.+)"
    }
    
    for _, pattern in ipairs(patterns) do
        local term = string.match(input, pattern)
        if term then
            term = string.gsub(term, "[?.!,]$", "")
            term = string.match(term, "^%s*(.-)%s*$") -- trim
            return term
        end
    end
    
    return nil
end

-- Get count of items in table (for set-like tables)
local function getTableSize(tbl)
    local count = 0
    for _ in pairs(tbl) do
        count = count + 1
    end
    return count
end

-- Random choice from array
local function randomChoice(arr)
    return arr[math.random(#arr)]
end

-- Get varied response to avoid repetition
local function getVariedResponse(options)
    if #memory.history > 0 then
        local recentResponses = {}
        local startIdx = math.max(1, #memory.history - 2)
        for i = startIdx, #memory.history do
            if memory.history[i].response then
                table.insert(recentResponses, memory.history[i].response)
            end
        end
        
        local available = {}
        for _, opt in ipairs(options) do
            if not contains(recentResponses, opt) then
                table.insert(available, opt)
            end
        end
        
        if #available > 0 then
            return randomChoice(available)
        end
    end
    return randomChoice(options)
end

-- Extract context from conversation
local function extractContext(input, intent)
    local topics = {
        code = {'coding', 'programming', 'development'},
        music = {'music', 'songs', 'singing'},
        games = {'gaming', 'playing', 'games'},
        math = {'math', 'calculations', 'numbers'}
    }
    
    for key, keywords in pairs(topics) do
        for _, word in ipairs(keywords) do
            if string.find(input:lower(), word) then
                memory.lastTopic = key
                break
            end
        end
    end
    
    if intent == "sad" or intent == "happy" or intent == "angry" then
        memory.context.lastEmotion = intent
        memory.context.emotionTime = os.time()
    end
end

-- Context-aware response generator
local function generateContextualResponse(intent, input, baseResponse)
    memory.conversationDepth = memory.conversationDepth + 1
    
    -- Add follow-up questions occasionally
    if memory.conversationDepth > 2 and math.random() < 0.3 then
        local followUps = {
            greeting = {" What brings you here today?", " What's on your mind?"},
            status = {" What have you been up to?", " Anything interesting happening?"},
            happy = {" What's the occasion?", " I'd love to hear more!"},
            bored = {" Want to explore something new together?"},
            joke = {" Want another one?", " Did that make you smile?"}
        }
        
        if followUps[intent] then
            local followUp = randomChoice(followUps[intent])
            return baseResponse .. followUp
        end
    end
    
    -- Reference previous conversation if relevant
    if memory.lastTopic and memory.conversationDepth > 3 then
        if intent == "unknown" or intent == "chat_request" then
            return string.format("We were just talking about %s. Want to continue that, or discuss something new?", 
                               memory.lastTopic)
        end
    end
    
    return baseResponse
end

-- Main thinking function
local function think(input)
    local intent = parseIntent(input)
    
    -- Check for unknown terms
    local unknownTerms = identifyUnknownTerms(input)
    local termDefinitions = {}
    
    if #unknownTerms > 0 then
        print('Unknown terms detected:', table.concat(unknownTerms, ', '))
        for _, term in ipairs(unknownTerms) do
            local result = searchTermMeaning(term)
            if result.searched then
                table.insert(termDefinitions, result)
            end
        end
    end
    
    extractContext(input, intent)
    
    table.insert(memory.history, {
        input = input,
        intent = intent,
        timestamp = os.time(),
        unknownTerms = unknownTerms,
        response = nil
    })
    
    local response = ""
    
    -- Handle different intents
    if intent == "definition_request" then
        local term = handleDefinitionRequest(input)
        if term then
            local result = searchTermMeaning(term)
            if result.found and result.definition then
                response = string.format("%s (%s): %s", term, result.partOfSpeech, result.definition)
            elseif result.searched and not result.found then
                response = string.format('I searched for "%s" but couldn\'t find a definition in the dictionary. It might be a specialized term, slang, or misspelled. Can you provide more context?', term)
            else
                response = string.format('I had trouble searching for "%s". Could you try rephrasing or checking the spelling?', term)
            end
        else
            response = "I'd be happy to define something for you! What term would you like me to explain?"
        end
        
    elseif intent == "greeting" then
        response = getVariedResponse({
            "Hello! I'm ZX-AI. How can I assist you today?",
            "Hey there! Ready to help.",
            "Greetings! What brings you here?",
            "Hi! What would you like to know?",
            "Hello! Nice to meet you. What can I do for you?"
        })
        
    elseif intent == "farewell" then
        response = getVariedResponse({
            "Goodbye! Feel free to return anytime.",
            "See you later! Take care.",
            "Until next time!",
            "Bye! Happy to help again whenever needed.",
            "Take care! Looking forward to our next conversation."
        })
        
    elseif intent == "status" then
        response = getVariedResponse({
            "I'm doing great, thanks for asking! How about you?",
            "All systems running smoothly! What about you?",
            "Can't complain—just here and ready to help. How are you?",
            "I'm good! What's going on with you?",
            "Doing well! How's your day treating you?",
            "Pretty good! What have you been up to?"
        })
        
    elseif intent == "ai_status" then
        local termCount = getTableSize(memory.knownTerms)
        response = string.format("All systems operational and running perfectly. I've learned about %d specialized terms so far. Ready to assist you with anything!", termCount)
        
    elseif intent == "thanks" then
        response = getVariedResponse({
            "You're welcome! Anything else I can help with?",
            "My pleasure! What else can I do for you?",
            "Happy to help! Need anything else?",
            "Anytime! Let me know if you need more assistance."
        })
        
    elseif intent == "identity" then
        response = "I am ZX-AI, a local symbolic intelligence designed to assist with logic, conversation, and problem-solving. I can also search for and learn new terms I don't understand!"
        
    elseif intent == "capabilities" then
        response = "I can chat with you, answer questions, help with code, perform calculations, tell jokes, keep you company, and even search for terms I don't understand! What do you need help with?"
        
    elseif intent == "learning" then
        local termCount = getTableSize(memory.knownTerms)
        response = string.format("I learn from our conversation during this session, and I can search for new terms I don't understand! I've already learned %d specialized terms. Each session starts fresh, but I'm always ready to learn more!", termCount)
        
    elseif intent == "joke" then
        response = getVariedResponse({
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why did the AI go to school? To improve its learning algorithms!",
            "What's an AI's favorite snack? Microchips!",
            "Why don't robots ever panic? They have nerves of steel!",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
            "Why do Java developers wear glasses? Because they don't C#!",
            "What do you call a programmer from Finland? Nerdic!",
            "Why did the developer go broke? Because he used up all his cache!"
        })
        
    elseif intent == "time" then
        response = "Current time: " .. os.date("%I:%M:%S %p")
        
    elseif intent == "date" then
        response = "Today is: " .. os.date("%A, %B %d, %Y")
        
    elseif intent == "memory_check" then
        if #memory.history > 1 then
            local topics = memory.lastTopic and (" We talked about " .. memory.lastTopic .. ".") or ''
            local termCount = getTableSize(memory.knownTerms)
            response = string.format("Yes! We've been chatting. We've exchanged %d messages so far. I've learned %d new terms.%s", 
                                   #memory.history, termCount, topics)
        else
            response = "This is the beginning of our conversation! But I'll remember everything we discuss during this session."
        end
        
    else
        -- Unknown intent handling
        if #unknownTerms > 0 and #termDefinitions > 0 then
            local foundTerms = {}
            for _, t in ipairs(termDefinitions) do
                if t.found then
                    table.insert(foundTerms, t)
                end
            end
            
            if #foundTerms > 0 then
                local defText = "I found some new terms and looked them up:\n\n"
                for _, t in ipairs(foundTerms) do
                    defText = defText .. string.format("• %s (%s): %s\n", t.term, t.partOfSpeech, t.definition)
                end
                defText = defText .. "\nNow I understand better! Could you rephrase your question?"
                response = defText
            else
                local termList = table.concat(unknownTerms, ', ')
                response = string.format("I noticed some terms I couldn't find in the dictionary (%s). They might be specialized jargon or acronyms. Could you explain what you mean or rephrase your question?", termList)
            end
        else
            response = getVariedResponse({
                "Hmm, I'm not quite sure what you mean. Could you rephrase that or ask something else?",
                "I didn't quite catch that. Want to try asking in a different way?",
                "Interesting! I'm not sure how to respond to that. Can you give me more details?",
                "That's a new one for me! Can you explain what you're looking for?"
            })
        end
    end
    
    response = generateContextualResponse(intent, input, response)
    memory.history[#memory.history].response = response
    
    return response
end

-- Return the main function for use
return {
    think = think,
    memory = memory
}
