const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

// Initialize WhatsApp client (LocalAuth)
whatsappService.initClient().catch(err => {
  console.error('Failed to initialize WhatsApp client:', err);
  process.exit(1);
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

// Campaign status endpoint
app.get('/api/campaigns/:id', (req, res) => {
  const id = req.params.id;
  const c = campaignManager.getCampaign(id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  return res.json(c);
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
