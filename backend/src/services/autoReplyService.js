const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const configFilePath = path.resolve(__dirname, '../config/autoReplyConfig.json');

const DEFAULT_CONFIG = {
  enabled: false, // Must be FALSE by default unless explicitly turned on by the user
  template: "Hey! 👋 Thanks for reaching out. Got your message!\n\nI'll get back to you personally in just a little bit.\n\nMeanwhile, you can take a look at my portfolio to see how I help local brands build modern, fast websites:\n🔗 https://suraj-banerjee.vercel.app/\n\nIf it's urgent or you'd prefer a direct call, feel free to ring me at 9609618271. Speak soon!",
  cooldownHours: 24
};

let currentConfig = { ...DEFAULT_CONFIG };
const contactCooldowns = new Map(); // senderJid -> timestamp
const replyLogs = []; // array of recent reply audit entries
const serverStartTime = Date.now(); // Ignore messages older than server start

// Load initial config from file
function loadConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf8');
      currentConfig = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } else {
      saveConfig(DEFAULT_CONFIG);
    }
  } catch (err) {
    logger.error('Failed to load autoReplyConfig.json, using defaults: ' + err.message);
    currentConfig = { ...DEFAULT_CONFIG };
  }
}

// Save config to file
function saveConfig(newConfig) {
  try {
    const dir = path.dirname(configFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');
    currentConfig = { ...newConfig };
  } catch (err) {
    logger.error('Failed to save autoReplyConfig.json: ' + err.message);
  }
}

loadConfig();

function getConfig() {
  return { ...currentConfig };
}

function updateConfig(updates) {
  const merged = {
    ...currentConfig,
    ...updates,
    enabled: typeof updates.enabled === 'boolean' ? updates.enabled : currentConfig.enabled,
    cooldownHours: Number(updates.cooldownHours) || currentConfig.cooldownHours,
    template: typeof updates.template === 'string' ? updates.template.trim() : currentConfig.template
  };
  saveConfig(merged);
  return merged;
}

function clearCooldowns() {
  const count = contactCooldowns.size;
  contactCooldowns.clear();
  logger.info(`Cleared auto-reply cooldowns for ${count} contacts.`);
  return { clearedCount: count };
}

function getStats() {
  return {
    config: currentConfig,
    activeCooldownsCount: contactCooldowns.size,
    totalRepliesTriggered: replyLogs.length,
    recentLogs: replyLogs.slice(-25).reverse()
  };
}

async function handleInboundMessage(client, msg) {
  if (!msg) return;

  // Guardrail 1: Check if auto-reply feature is explicitly enabled by user
  if (!currentConfig.enabled || !currentConfig.template || currentConfig.template.trim().length === 0) {
    return;
  }

  // Guardrail 2: Ignore messages sent by ourselves
  if (msg.fromMe) return;

  // Guardrail 3: Ignore status broadcasts, group chats, newsletters, channels
  const sender = msg.from || '';
  if (
    sender.endsWith('@g.us') || 
    sender.endsWith('@newsletter') || 
    sender.includes('broadcast') || 
    msg.isGroupMsg || 
    msg.isStatus
  ) {
    return;
  }

  // Guardrail 4: Ignore old synced chat history replay when WhatsApp first connects
  // msg.timestamp is in seconds Unix epoch
  if (msg.timestamp) {
    const messageTimeMs = msg.timestamp * 1000;
    // If message was sent before this server instance started or older than 2 minutes, ignore it
    if (messageTimeMs < serverStartTime - 10000 || messageTimeMs < Date.now() - 120000) {
      return;
    }
  }

  const now = Date.now();
  const cooldownMs = (currentConfig.cooldownHours || 24) * 60 * 60 * 1000;
  const lastReplyTime = contactCooldowns.get(sender);

  // Guardrail 5: Cooldown check
  if (lastReplyTime && (now - lastReplyTime) < cooldownMs) {
    const remainingHrs = (((cooldownMs - (now - lastReplyTime)) / 1000) / 3600).toFixed(1);
    logger.info(`[Auto-Reply Skipped] Contact ${sender} is on cooldown (${remainingHrs}h remaining).`);
    return;
  }

  const cleanPhone = sender.replace('@c.us', '').replace('@lid', '');
  logger.info(`[Auto-Reply Triggered] Sending automated response to new live message from ${cleanPhone}`);

  try {
    // Send auto-reply
    await client.sendMessage(sender, currentConfig.template);

    // Update cooldown map
    contactCooldowns.set(sender, now);

    // Record in recent reply logs
    const logEntry = {
      id: Date.now().toString(),
      sender,
      phone: cleanPhone,
      timestamp: now,
      incomingSnippet: (msg.body || '').slice(0, 80)
    };

    replyLogs.push(logEntry);
    if (replyLogs.length > 100) replyLogs.shift();

    logger.info(`[Auto-Reply Sent] Successfully delivered to ${cleanPhone}`);
  } catch (err) {
    logger.error(`[Auto-Reply Failed] Could not deliver to ${cleanPhone}: ${err.message}`);
  }
}

module.exports = {
  getConfig,
  updateConfig,
  getStats,
  clearCooldowns,
  handleInboundMessage
};
