// =====================
// AI MEMORY
// =====================
const memory = {
  name: "ZX-AI",
  mood: "neutral",
  context: null,
  history: []
};

// =====================
// INTENT PARSER
// =====================
function parseIntent(input) {
  input = input.toLowerCase();

  if (input.includes("help")) return "help";
  if (input.includes("code") || input.includes("script")) return "code";
  if (input.includes("discord")) return "discord";
  if (input.includes("who are you")) return "identity";
  if (input.includes("set mode")) return "mode";
  if (input.includes("remember")) return "memory";

  return "unknown";
}

// =====================
// AI DECISION ENGINE
// =====================
function think(input) {
  const intent = parseIntent(input);

  memory.history.push({ input, intent });

  switch (intent) {
    case "help":
      return "I can assist with code, logic, systems, and structured thinking.";

    case "code":
      memory.context = "coding";
      return "Code mode enabled. Tell me the language or goal.";

    case "discord":
      return "Discord systems detected. Bots, webhooks, moderation, or servers?";

    case "identity":
      return `I am ${memory.name}. A local logic-based AI. No APIs. No limits.`;

    case "memory":
      return "Short-term memory active. I can track context during this session.";

    case "mode":
      memory.mood = "focused";
      return "Mode switched to focused.";

    default:
      return "Input not recognized. Rephrase or give a clearer command.";
  }
}

// =====================
// OUTPUT HANDLER
// =====================
function respond() {
  const input = document.getElementById("userInput").value;
  const output = think(input);

  document.getElementById("output").innerText = output;
}
