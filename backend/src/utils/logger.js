const fs = require('fs');
const path = require('path');

const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const logFile = path.join(logsDir, 'whatsapp.log');

function append(level, msg) {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}\n`;
  try { fs.appendFileSync(logFile, line); } catch (e) { /* ignore */ }
  console[level === 'error' ? 'error' : 'log'](line.trim());
}

module.exports = {
  info: (msg) => append('info', msg),
  warn: (msg) => append('warn', msg),
  error: (msg) => append('error', msg)
};
