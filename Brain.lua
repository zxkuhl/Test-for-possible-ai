-- ZX-AI Advanced Exploit Chatbot with Console Integration
-- Supports multiple exploit environments

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local CoreGui = game:GetService("CoreGui")

-- Exploit environment detection
local exploit_env = {
    name = "Unknown",
    console = nil,
    print = print,
    warn = warn,
    error = error
}

-- Detect exploit environment
if syn then
    exploit_env.name = "Synapse X"
    exploit_env.console = syn.write_clipboard or writefile
elseif KRNL_LOADED then
    exploit_env.name = "KRNL"
elseif getexecutorname then
    exploit_env.name = getexecutorname()
elseif identifyexecutor then
    exploit_env.name = identifyexecutor()
end

-- Console wrapper functions
local function consoleprint(msg, color)
    if rconsoleprint then
        rconsoleprint(msg .. "\n")
    elseif syn and syn.console_print then
        syn.console_print(msg .. "\n")
    else
        print(msg)
    end
end

local function consoleclear()
    if rconsoleclear then
        rconsoleclear()
    elseif syn and syn.console_clear then
        syn.console_clear()
    end
end

local function consoleinfo(msg)
    consoleprint("[INFO] " .. msg, "Cyan")
end

local function consolewarn(msg)
    consoleprint("[WARN] " .. msg, "Yellow")
    warn(msg)
end

local function consoleerror(msg)
    consoleprint("[ERROR] " .. msg, "Red")
    error(msg, 0)
end

-- Memory system
local memory = {
    name = "ZX-AI",
    history = {},
    context = {},
    userName = Players.LocalPlayer.Name,
    lastTopic = nil,
    conversationDepth = 0,
    userInterests = {},
    emotionalState = nil,
    conversationStyle = "neutral",
    topicContext = {},
    lastQuestionAsked = nil,
    waitingForAnswer = false,
    lastIntent = nil,
    conversationFlow = {},
    userMood = nil,
    contextualMemory = {},
    sentimentHistory = {},
    engagementLevel = 0,
    
    -- Exploit-specific memory
    executedScripts = {},
    consoleLog = {},
    commandHistory = {},
    gameInfo = {
        placeId = game.PlaceId,
        jobId = game.JobId,
        playerCount = #Players:GetPlayers()
    }
}

-- Helper functions
local function tableContains(tbl, value)
    for _, v in pairs(tbl) do
        if v == value then return true end
    end
    return false
end

local function addToSet(tbl, value)
    if not tableContains(tbl, value) then
        table.insert(tbl, value)
    end
end

local function getVariedResponse(options)
    if #options == 0 then return "I'm here to help!" end
    
    if #memory.history > 0 then
        local recentResponses = {}
        local start = math.max(1, #memory.history - 5)
        for i = start, #memory.history do
            if memory.history[i].response then
                table.insert(recentResponses, memory.history[i].response)
            end
        end
        
        local available = {}
        for _, opt in ipairs(options) do
            local isRecent = false
            for _, recent in ipairs(recentResponses) do
                if string.find(recent, string.sub(opt, 1, 25), 1, true) then
                    isRecent = true
                    break
                end
            end
            if not isRecent then
                table.insert(available, opt)
            end
        end
        
        if #available > 0 then
            return available[math.random(1, #available)]
        end
    end
    
    return options[math.random(1, #options)]
end

-- Log console messages
local originalPrint = print
local originalWarn = warn
local originalError = error

print = function(...)
    local args = {...}
    local msg = table.concat(args, " ")
    table.insert(memory.consoleLog, {type = "print", msg = msg, time = os.time()})
    if #memory.consoleLog > 100 then
        table.remove(memory.consoleLog, 1)
    end
    originalPrint(...)
end

warn = function(...)
    local args = {...}
    local msg = table.concat(args, " ")
    table.insert(memory.consoleLog, {type = "warn", msg = msg, time = os.time()})
    if #memory.consoleLog > 100 then
        table.remove(memory.consoleLog, 1)
    end
    originalWarn(...)
end

-- Extract entities and interests
local function extractEntities(original, lower)
    local interestKeywords = {
        scripting = {"script", "code", "lua", "function", "exploit", "hack", "loadstring"},
        gaming = {"game", "play", "roblox", "obby", "tycoon"},
        admin = {"admin", "commands", "mod", "ban", "kick"},
        exploit = {"exploit", "inject", "executor", "bypass", "anticheat"},
        automation = {"auto", "farm", "bot", "macro", "loop"},
        social = {"friend", "chat", "player", "team"},
        building = {"build", "create", "design", "studio"},
        combat = {"pvp", "fight", "combat", "weapon", "gun"}
    }
    
    for interest, keywords in pairs(interestKeywords) do
        for _, keyword in ipairs(keywords) do
            if string.find(lower, keyword, 1, true) then
                addToSet(memory.userInterests, interest)
                break
            end
        end
    end
    
    -- Detect conversation style
    if string.find(lower, "yo") or string.find(lower, "sup") or string.find(lower, "bro") then
        memory.conversationStyle = "casual"
    elseif string.find(lower, "please") or string.find(lower, "kindly") then
        memory.conversationStyle = "professional"
    else
        memory.conversationStyle = "friendly"
    end
end

-- Advanced intent parsing
local function parseIntent(input)
    local original = input
    input = string.lower(string.gsub(input, "^%s*(.-)%s*$", "%1"))
    
    if input == "" then return "unknown" end
    
    extractEntities(original, input)
    
    -- Response to AI questions
    if memory.lastIntent == "status" and memory.waitingForAnswer then
        if string.match(input, "good") or string.match(input, "great") or string.match(input, "fine") then
            return "user_status_positive"
        elseif string.match(input, "bad") or string.match(input, "terrible") then
            return "user_status_negative"
        elseif string.match(input, "tired") or string.match(input, "sleepy") then
            return "user_status_tired"
        elseif string.match(input, "busy") or string.match(input, "swamped") then
            return "user_status_busy"
        elseif string.match(input, "bored") then
            return "user_status_bored"
        end
    end
    
    -- Greetings
    if string.match(input, "^hi") or string.match(input, "^hello") or string.match(input, "^hey") then
        return "greeting"
    end
    
    if string.match(input, "bye") or string.match(input, "goodbye") then
        return "farewell"
    end
    
    -- Status
    if string.match(input, "how are you") or string.match(input, "what's up") or string.match(input, "wassup") then
        return "status"
    end
    
    -- Gratitude
    if string.match(input, "thank") or string.match(input, "thanks") then
        return "thanks"
    end
    
    -- Exploit environment info
    if string.match(input, "what executor") or string.match(input, "which exploit") then
        return "executor_info"
    end
    
    -- Console commands
    if string.match(input, "console") and (string.match(input, "clear") or string.match(input, "clean")) then
        return "console_clear"
    end
    
    if string.match(input, "console") and (string.match(input, "log") or string.match(input, "read")) then
        return "console_read"
    end
    
    if string.match(input, "console") and string.match(input, "print") then
        return "console_print"
    end
    
    -- Game info
    if string.match(input, "game info") or string.match(input, "game details") then
        return "game_info"
    end
    
    if string.match(input, "place id") or string.match(input, "placeid") then
        return "place_id"
    end
    
    if string.match(input, "job id") or string.match(input, "jobid") or string.match(input, "server") then
        return "job_id"
    end
    
    if string.match(input, "players") or string.match(input, "player list") then
        return "player_list"
    end
    
    -- Script execution
    if string.match(input, "execute") or string.match(input, "run script") or string.match(input, "loadstring") then
        return "execute_script"
    end
    
    if string.match(input, "script history") or string.match(input, "executed scripts") then
        return "script_history"
    end
    
    -- Teleport
    if string.match(input, "teleport") or string.match(input, "^tp") then
        return "teleport"
    end
    
    -- Character modification
    if string.match(input, "speed") or string.match(input, "walkspeed") then
        return "speed"
    end
    
    if string.match(input, "jump") or string.match(input, "jumppower") or string.match(input, "jumpower") then
        return "jump"
    end
    
    if string.match(input, "god") or string.match(input, "godmode") or string.match(input, "invincible") then
        return "god"
    end
    
    if string.match(input, "noclip") or string.match(input, "no clip") then
        return "noclip"
    end
    
    if string.match(input, "fly") or string.match(input, "flight") then
        return "fly"
    end
    
    if string.match(input, "invisible") or string.match(input, "invis") then
        return "invisible"
    end
    
    if string.match(input, "reset") or (string.match(input, "kill") and string.match(input, "me")) then
        return "reset"
    end
    
    -- ESP/Visual
    if string.match(input, "esp") then
        return "esp"
    end
    
    if string.match(input, "fullbright") or string.match(input, "full bright") then
        return "fullbright"
    end
    
    -- Game manipulation
    if string.match(input, "kick") and not string.match(input, "me") then
        return "kick_player"
    end
    
    if string.match(input, "bring") then
        return "bring_player"
    end
    
    if string.match(input, "freeze") then
        return "freeze"
    end
    
    if string.match(input, "unfreeze") or string.match(input, "thaw") then
        return "unfreeze"
    end
    
    -- Utility
    if string.match(input, "help") or string.match(input, "commands") then
        return "help"
    end
    
    if string.match(input, "copy") and (string.match(input, "place") or string.match(input, "job")) then
        return "copy_info"
    end
    
    -- Entertainment
    if string.match(input, "joke") or string.match(input, "funny") then
        return "joke"
    end
    
    if string.match(input, "fact") or string.match(input, "did you know") then
        return "fact"
    end
    
    -- Questions
    if string.find(input, "?") or string.match(input, "^what") or string.match(input, "^how") or string.match(input, "^why") then
        return "general_question"
    end
    
    return "unknown"
end

-- Execute player commands
local function executeCommand(intent, input)
    local player = Players.LocalPlayer
    local char = player.Character
    local hum = char and char:FindFirstChildOfClass("Humanoid")
    local root = char and char:FindFirstChild("HumanoidRootPart")
    
    if intent == "teleport" then
        local targetName = string.match(input, "tp%s+(%S+)")
        if not targetName then
            return "Please specify a player to teleport to! Example: 'tp PlayerName'"
        end
        
        local target = Players:FindFirstChild(targetName)
        if not target then
            for _, p in pairs(Players:GetPlayers()) do
                if string.lower(p.Name):find(string.lower(targetName), 1, true) then
                    target = p
                    break
                end
            end
        end
        
        if target and target.Character and target.Character:FindFirstChild("HumanoidRootPart") then
            root.CFrame = target.Character.HumanoidRootPart.CFrame
            return "Teleported to " .. target.Name .. "!"
        else
            return "Could not find player: " .. targetName
        end
        
    elseif intent == "speed" then
        local speed = tonumber(string.match(input, "%d+"))
        if speed then
            hum.WalkSpeed = speed
            return "WalkSpeed set to " .. speed .. "!"
        else
            return "Current WalkSpeed: " .. (hum and hum.WalkSpeed or "N/A") .. ". Use 'speed [number]' to change it!"
        end
        
    elseif intent == "jump" then
        local jump = tonumber(string.match(input, "%d+"))
        if jump then
            hum.JumpPower = jump
            return "JumpPower set to " .. jump .. "!"
        else
            return "Current JumpPower: " .. (hum and hum.JumpPower or "N/A") .. ". Use 'jump [number]' to change it!"
        end
        
    elseif intent == "god" then
        if hum then
            hum.MaxHealth = math.huge
            hum.Health = math.huge
            return "God mode activated! You're invincible!"
        end
        return "Could not activate god mode. No humanoid found."
        
    elseif intent == "reset" then
        if char then
            char:BreakJoints()
            return "Character reset!"
        end
        return "Could not reset character."
        
    elseif intent == "invisible" then
        if char then
            for _, part in pairs(char:GetDescendants()) do
                if part:IsA("BasePart") then
                    part.Transparency = 1
                elseif part:IsA("Decal") then
                    part.Transparency = 1
                end
            end
            return "You are now invisible!"
        end
        return "Could not make invisible."
    end
    
    return nil
end

-- Main think function
local function think(input)
    local intent = parseIntent(input)
    
    table.insert(memory.history, {
        input = input,
        intent = intent,
        timestamp = os.time(),
        response = nil
    })
    
    table.insert(memory.commandHistory, input)
    if #memory.commandHistory > 50 then
        table.remove(memory.commandHistory, 1)
    end
    
    local response = ""
    
    -- Try to execute command first
    local cmdResponse = executeCommand(intent, input)
    if cmdResponse then
        consoleinfo("Command executed: " .. input)
        response = cmdResponse
        
    -- USER STATUS
    elseif intent == "user_status_positive" then
        response = getVariedResponse({
            "That's great to hear! What would you like to do?",
            "Awesome! Ready to help with exploiting, scripting, or just chatting!",
            "Nice! What commands do you need?"
        })
        memory.waitingForAnswer = false
        
    elseif intent == "user_status_negative" then
        response = "Sorry to hear that. Want me to help cheer you up or get some work done?"
        memory.waitingForAnswer = false
        
    elseif intent == "user_status_bored" then
        response = "Bored? Let's do something fun! I can help with scripts, commands, or entertainment!"
        memory.waitingForAnswer = false
        
    -- GREETINGS
    elseif intent == "greeting" then
        response = getVariedResponse({
            "Hey " .. memory.userName .. "! I'm ZX-AI, your exploit assistant. What do you need?",
            "Hello! Ready to help with commands, scripts, or anything else!",
            "What's up! I can execute commands, read console, and much more. What'll it be?",
            "Hey there! Type 'help' to see what I can do!"
        })
        
    elseif intent == "farewell" then
        response = getVariedResponse({
            "See you later! Happy exploiting!",
            "Goodbye! Come back anytime you need help!",
            "Later! Stay safe out there!"
        })
        
    -- STATUS
    elseif intent == "status" then
        response = getVariedResponse({
            "I'm doing great! All systems operational. How about you?",
            "Running perfectly! What can I do for you?",
            "Everything's smooth! How are you doing?"
        })
        memory.lastIntent = "status"
        memory.waitingForAnswer = true
        
    -- THANKS
    elseif intent == "thanks" then
        response = "You're welcome! Anything else you need?"
        
    -- EXPLOIT INFO
    elseif intent == "executor_info" then
        response = "You're using: " .. exploit_env.name .. ". Console support: " .. (rconsoleprint and "Yes" or "Limited")
        
    -- CONSOLE COMMANDS
    elseif intent == "console_clear" then
        consoleclear()
        response = "Console cleared!"
        
    elseif intent == "console_read" then
        if #memory.consoleLog > 0 then
            local recent = {}
            local start = math.max(1, #memory.consoleLog - 5)
            for i = start, #memory.consoleLog do
                table.insert(recent, memory.consoleLog[i].type:upper() .. ": " .. memory.consoleLog[i].msg)
            end
            response = "Recent console logs:\n" .. table.concat(recent, "\n")
        else
            response = "Console is empty!"
        end
        
    elseif intent == "console_print" then
        local msg = string.match(input, "print%s+(.+)") or "Hello from ZX-AI!"
        consoleprint(msg)
        response = "Printed to console: " .. msg
        
    -- GAME INFO
    elseif intent == "game_info" then
        local info = string.format(
            "Game: %s\nPlace ID: %d\nJob ID: %s\nPlayers: %d/%d",
            game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name,
            game.PlaceId,
            game.JobId,
            #Players:GetPlayers(),
            Players.MaxPlayers
        )
        response = info
        consoleinfo(info)
        
    elseif intent == "place_id" then
        response = "Place ID: " .. game.PlaceId
        if setclipboard then
            setclipboard(tostring(game.PlaceId))
            response = response .. " (Copied to clipboard!)"
        end
        
    elseif intent == "job_id" then
        response = "Job ID: " .. game.JobId
        if setclipboard then
            setclipboard(game.JobId)
            response = response .. " (Copied to clipboard!)"
        end
        
    elseif intent == "player_list" then
        local players = {}
        for _, p in pairs(Players:GetPlayers()) do
            table.insert(players, p.Name)
        end
        response = "Players (" .. #players .. "):\n" .. table.concat(players, ", ")
        
    -- SCRIPT EXECUTION
    elseif intent == "execute_script" then
        local code = string.match(input, "execute%s+(.+)") or string.match(input, "run%s+(.+)")
        if code then
            local success, err = pcall(function()
                loadstring(code)()
            end)
            if success then
                table.insert(memory.executedScripts, {code = code, time = os.time()})
                response = "Script executed successfully!"
                consoleinfo("Script executed: " .. code)
            else
                response = "Script error: " .. tostring(err)
                consoleerror("Script failed: " .. tostring(err))
            end
        else
            response = "Please provide code to execute! Example: 'execute print(\"Hello\")'"
        end
        
    elseif intent == "script_history" then
        if #memory.executedScripts > 0 then
            local recent = {}
            local start = math.max(1, #memory.executedScripts - 3)
            for i = start, #memory.executedScripts do
                table.insert(recent, memory.executedScripts[i].code)
            end
            response = "Recent scripts:\n" .. table.concat(recent, "\n")
        else
            response = "No scripts executed yet!"
        end
        
    -- HELP
    elseif intent == "help" then
        response = [[ZX-AI Commands:
        
EXPLOIT:
• execute/run [code] - Execute Lua code
• script history - View executed scripts
• console clear/read/print - Console management

GAME INFO:
• game info - Full game details
• place id / job id - Get IDs
• players - List all players

MOVEMENT:
• tp [player] - Teleport to player
• speed [number] - Set walkspeed
• jump [number] - Set jumppower
• noclip / fly - Movement abilities

CHARACTER:
• god - God mode
• invisible/invis - Become invisible
• reset - Reset character

CHAT:
• Ask me anything!
• I can joke, give facts, and chat!

Type any command or just talk to me!]]
        
    -- JOKES
    elseif intent == "joke" then
        local jokes = {
            "Why do exploiters love Lua? Because it's undetectable... until it's not!",
            "What's an exploiter's favorite exercise? Script kiddie squats!",
            "Why did the Roblox admin cross the road? To ban the exploiter on the other side!",
            "How many exploiters does it take to change a lightbulb? None, they just noclip through the darkness!",
            "What do you call a caught exploiter? Banned-ana! 🍌"
        }
        response = jokes[math.random(1, #jokes)]
        
    -- FACTS
    elseif intent == "fact" then
        local facts = {
            "Did you know? Roblox uses Lua 5.1 with custom modifications!",
            "Fun fact: The first Roblox exploit was created around 2008!",
            "Cool fact: Synapse X was one of the most popular executors before Roblox's major patches!",
            "Interesting: Roblox's anti-cheat system is called Byfron!",
            "Amazing: Over 40 million games exist on Roblox!"
        }
        response = facts[math.random(1, #facts)]
        
    -- QUESTION
    elseif intent == "general_question" then
        response = "That's a good question! I'll do my best to help. Can you be more specific?"
        
    -- UNKNOWN
    else
        response = getVariedResponse({
            "I'm not sure what you mean. Try 'help' to see commands!",
            "Hmm, didn't catch that. Want to see what I can do? Type 'help'!",
            "Not sure about that one. Ask me something else or type 'help'!"
        })
    end
    
    memory.history[#memory.history].response = response
    memory.conversationDepth = memory.conversationDepth + 1
    table.insert(memory.conversationFlow, intent)
    
    if #memory.conversationFlow > 15 then
        table.remove(memory.conversationFlow, 1)
    end
    
    return response
end

-- Create GUI
local function createGUI()
    local gui = Instance.new("ScreenGui")
    gui.Name = "ZXAI"
    gui.ResetOnSpawn = false
    gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    
    -- Try to parent to CoreGui, fallback to PlayerGui
    local success = pcall(function()
        gui.Parent = CoreGui
    end)
    if not success then
        gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
    end
    
    -- Main Frame
    local mainFrame = Instance.new("Frame")
    mainFrame.Name = "MainFrame"
    mainFrame.Size = UDim2.new(0, 500, 0, 400)
    mainFrame.Position = UDim2.new(0.5, -250, 0.5, -200)
    mainFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    mainFrame.BorderSizePixel = 0
    mainFrame.Active = true
    mainFrame.Draggable = true
    mainFrame.Parent = gui
    
    -- Corner
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 10)
    corner.Parent = mainFrame
    
    -- Title Bar
    local titleBar = Instance.new("Frame")
    titleBar.Name = "TitleBar"
    titleBar.Size = UDim2.new(1, 0, 0, 35)
    titleBar.BackgroundColor3 = Color3.fromRGB(15, 15, 15)
    titleBar.BorderSizePixel = 0
    titleBar.Parent = mainFrame
    
    local titleCorner = Instance.new("UICorner")
    titleCorner.CornerRadius = UDim.new(0, 10)
    titleCorner.Parent = titleBar
    
    local titleLabel = Instance.new("TextLabel")
    titleLabel.Size = UDim2.new(1, -40, 1, 0)
    titleLabel.BackgroundTransparency = 1
    titleLabel.Text = "ZX-AI | " .. exploit_env.name
    titleLabel.Font = Enum.Font.GothamBold
    titleLabel.TextSize = 16
    titleLabel.TextColor3 = Color3.fromRGB(0, 255, 150)
    titleLabel.TextXAlignment = Enum.TextXAlignment.Left
    titleLabel.Position = UDim2.new(0, 10, 0, 0)
    titleLabel.Parent = titleBar
    
    -- Close Button
    local closeBtn = Instance.new("TextButton")
    closeBtn.Size = UDim2.new(0, 30, 0, 30)
    closeBtn.Position = UDim2.new(1, -35, 0, 2.5)
    closeBtn.BackgroundColor3 = Color3.fromRGB(200, 50, 50)
    closeBtn.Text = "X"
    closeBtn.Font = Enum.Font.GothamBold
    closeBtn.TextSize = 16
    closeBtn.TextColor3 = Color3.white
    closeBtn.Parent = titleBar
    
    local closeBtnCorner = Instance.new("UICorner")
    closeBtnCorner.CornerRadius = UDim.new(0, 6)
    closeBtnCorner.Parent = closeBtn
    
    closeBtn.MouseButton1Click:Connect(function()
        gui:Destroy()
    end)
    
    -- Chat Display
    local chatDisplay = Instance.new("ScrollingFrame")
    chatDisplay.Name = "ChatDisplay"
    chatDisplay.Size = UDim2.new(1, -20, 1, -100)
    chatDisplay.Position = UDim2.new(0, 10, 0, 45)
    chatDisplay.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
    chatDisplay.BorderSizePixel = 0
    chatDisplay.ScrollBarThickness = 6
    chatDisplay.CanvasSize = UDim2.new(0, 0, 0, 0)
    chatDisplay.Parent = mainFrame
    
    local chatCorner = Instance.new("UICorner")
    chatCorner.CornerRadius = UDim.new(0, 8)
    chatCorner.Parent = chatDisplay
    
    local chatLayout = Instance.new("UIListLayout")
    chatLayout.Padding = UDim.new(0, 5)
    chatLayout.SortOrder = Enum.SortOrder.LayoutOrder
    chatLayout.Parent = chatDisplay
    
    -- Input Box
    local inputBox = Instance.new("TextBox")
    inputBox.Name = "InputBox"
    inputBox.Size = UDim2.new(1, -90, 0, 40)
    inputBox.Position = UDim2.new(0, 10, 1, -50)
    inputBox.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
    inputBox.BorderSizePixel = 0
    inputBox.PlaceholderText = "Type a message or command..."
    inputBox.PlaceholderColor3 = Color3.fromRGB(150, 150, 150)
    inputBox.Text = ""
    inputBox.Font = Enum.Font.Gotham
    inputBox.TextSize = 14
    inputBox.TextColor3 = Color3.white
    inputBox.TextXAlignment = Enum.TextXAlignment.Left
    inputBox.ClearTextOnFocus = false
    inputBox.Parent = mainFrame
    
    local inputCorner = Instance.new("UICorner")
    inputCorner.CornerRadius = UDim.new(0, 8)
    inputCorner.Parent = inputBox
    
    local inputPadding = Instance.new("UIPadding")
    inputPadding.PaddingLeft = UDim.new(0, 10)
    inputPadding.Parent = inputBox
    
    -- Send Button
    local sendBtn = Instance.new("TextButton")
    sendBtn.Name = "SendButton"
    sendBtn.Size = UDim2.new(0, 70, 0, 40)
    sendBtn.Position = UDim2.new(1, -80, 1, -50)
    sendBtn.BackgroundColor3 = Color3.fromRGB(0, 200, 100)
    sendBtn.Text = "SEND"
    sendBtn.Font = Enum.Font.GothamBold
    sendBtn.TextSize = 14
    sendBtn.TextColor3 = Color3.white
    sendBtn.Parent = mainFrame
    
    local sendCorner = Instance.new("UICorner")
    sendCorner.CornerRadius = UDim.new(0, 8)
    sendCorner.Parent = sendBtn
    
    -- Functions
    local function addMessage(text, isUser)
        local msgFrame = Instance.new("Frame")
        msgFrame.Size = UDim2.new(1, -10, 0, 0)
        msgFrame.BackgroundTransparency = 1
        msgFrame.Parent = chatDisplay
        
        local msg = Instance.new("TextLabel")
        msg.Size = UDim2.new(1, -10, 0, 0)
        msg.BackgroundColor3 = isUser and Color3.fromRGB(50, 100, 200) or Color3.fromRGB(50, 50, 50)
        msg.Text = (isUser and "You: " or "ZX-AI: ") .. text
        msg.Font = Enum.Font.Gotham
        msg.TextSize = 13
        msg.TextColor3 = isUser and Color3.white or Color3.fromRGB(0, 255, 150)
        msg.TextWrapped = true
        msg.TextXAlignment = Enum.TextXAlignment.Left
        msg.TextYAlignment = Enum.TextYAlignment.Top
        msg.Parent = msgFrame
        
        local msgCorner = Instance.new("UICorner")
        msgCorner.CornerRadius = UDim.new(0, 6)
        msgCorner.Parent = msg
        
        local msgPadding = Instance.new("UIPadding")
        msgPadding.PaddingLeft = UDim.new(0, 8)
        msgPadding.PaddingRight = UDim.new(0, 8)
        msgPadding.PaddingTop = UDim.new(0, 6)
        msgPadding.PaddingBottom = UDim.new(0, 6)
        msgPadding.Parent = msg
        
        -- Calculate text height
        local textService = game:GetService("TextService")
        local textSize = textService:GetTextSize(
            msg.Text,
            msg.TextSize,
            msg.Font,
            Vector2.new(msg.AbsoluteSize.X - 16, 10000)
        )
        
        msg.Size = UDim2.new(1, -10, 0, textSize.Y + 12)
        msgFrame.Size = UDim2.new(1, -10, 0, textSize.Y + 12)
        
        chatDisplay.CanvasSize = UDim2.new(0, 0, 0, chatLayout.AbsoluteContentSize.Y)
        chatDisplay.CanvasPosition = Vector2.new(0, chatDisplay.CanvasSize.Y.Offset)
    end
    
    local function sendMessage()
        local text = inputBox.Text
        if text ~= "" then
            addMessage(text, true)
            inputBox.Text = ""
            
            task.spawn(function()
                local response = think(text)
                task.wait(0.3)
                addMessage(response, false)
            end)
        end
    end
    
    sendBtn.MouseButton1Click:Connect(sendMessage)
    inputBox.FocusLost:Connect(function(enter)
        if enter then
            sendMessage()
        end
    end)
    
    -- Initial message
    addMessage("Hello! I'm ZX-AI, your exploit assistant. Type 'help' to see what I can do!", false)
    
    consoleinfo("ZX-AI GUI Loaded | Executor: " .. exploit_env.name)
end

-- Auto-execute features
local function setupAutoFeatures()
    -- Monitor console
    task.spawn(function()
        while task.wait(1) do
            memory.gameInfo.playerCount = #Players:GetPlayers()
        end
    end)
    
    consoleinfo("ZX-AI Initialized Successfully!")
    consoleinfo("Executor: " .. exploit_env.name)
    consoleinfo("Player: " .. memory.userName)
    consoleinfo("Place ID: " .. game.PlaceId)
end

-- Initialize
setupAutoFeatures()
createGUI()

return {
    think = think,
    memory = memory,
    consoleprint = consoleprint,
    consoleclear = consoleclear
}
