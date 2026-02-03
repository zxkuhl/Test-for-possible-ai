const memory = {
  name: "ZX-AI",
  history: []
};

function parseIntent(input) {
  input = input.toLowerCase();

  if (input.includes("help")) return "help";
  if (input.includes("code")) return "code";
  if (input.includes("who are you")) return "identity";
  return "unknown";
}

function think(input) {
  const intent = parseIntent(input);
  memory.history.push({ input, intent });

  if (intent === "help") return "I assist with logic, systems, and structured thinking.";
  if (intent === "code") return "Code mode enabled. Specify language or goal.";
  if (intent === "identity") return "I am ZX-AI. A local symbolic intelligence.";
  return "Unrecognized input. Clarify intent.";
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
