const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to local .env if any

const logger = require('./utils/logger');

// Catch-all safety handlers to prevent the backend process from ever dying unexpectedly
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ' + (err.stack || err.message));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection: ' + (reason?.stack || reason?.message || reason));
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 4000;

const sendBulkRouter = require('./routes/sendBulk');
const uploadMediaRouter = require('./routes/uploadMedia');
const singleMessageRouter = require('./routes/singleMessage');
const autoReplyRouter = require('./routes/autoReply');
const leadFinderRouter = require('./routes/leadFinder');
const campaignManager = require('./services/campaignManager');
const whatsappService = require('./services/whatsappService');

// Initialize WhatsApp client (LocalAuth) safely in background
whatsappService.initClient().catch(err => {
  logger.error('Background WhatsApp initialization notice: ' + err.message);
});

app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));
app.use('/api', sendBulkRouter);
app.use('/api', singleMessageRouter);
app.use('/api', autoReplyRouter);
app.use('/api/leads', leadFinderRouter);
app.use('/api/upload-media', uploadMediaRouter);

// Lightweight Health / Keep-Alive Ping Endpoint for Cron Jobs
app.get('/api/ping', (req, res) => {
  return res.status(200).json({ status: 'active', timestamp: Date.now() });
});

app.get('/health', (req, res) => {
  return res.status(200).send('OK');
});

// WhatsApp client status endpoint (disabled cache for real-time polling)
app.get('/api/status', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.json(whatsappService.getStatus());
});

// WhatsApp manual reconnect endpoint
app.post('/api/reconnect', async (req, res) => {
  try {
    whatsappService.reconnect();
    return res.json({ success: true, message: 'Reconnection triggered' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// WhatsApp logout / reset endpoint
app.post('/api/logout', async (req, res) => {
  try {
    await whatsappService.logout();
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Campaign status endpoint
app.get('/api/campaigns/:id', (req, res) => {
  const id = req.params.id;
  const c = campaignManager.getCampaign(id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  return res.json(c);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Express error at ${req.method} ${req.url}: ${err.message}`);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Backend listening on http://localhost:${PORT}`);
});
