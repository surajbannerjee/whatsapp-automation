const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const mime = require('mime-types');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const logger = require('../utils/logger');
const { findChromeExecutable } = require('../utils/chromeFinder');
const { formatPhoneToWhatsApp } = require('../utils/phoneFormatter');

let client = null;
let currentStatus = 'initializing';
let lastQr = null;
let lastError = null;
let isInitializing = false;
let reconnectTimeout = null;

const authDataPath = path.resolve(__dirname, '../../.wwebjs_auth');

function isClientConnected() {
  return Boolean(client && currentStatus === 'ready' && client.info);
}

function clearPendingReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}

async function initClient(forceNew = false) {
  if (isInitializing && !forceNew) {
    logger.info('WhatsApp client initialization already in progress...');
    return client;
  }

  if (client && isClientConnected() && !forceNew) {
    logger.info('WhatsApp client is already connected and ready.');
    return client;
  }

  clearPendingReconnect();
  isInitializing = true;
  currentStatus = 'initializing';
  lastError = null;
  lastQr = null;

  // Cleanup existing client safely
  if (client) {
    try {
      logger.info('Cleaning up previous WhatsApp client instance...');
      await client.destroy().catch(() => {});
    } catch (e) {
      // ignore
    }
    client = null;
  }

  try {
    const chromePath = findChromeExecutable();

    logger.info(`Initializing WhatsApp client (Headless: ${process.env.WHATSAPP_HEADLESS !== 'false'}, Binary: ${chromePath || 'puppeteer default'})`);

    client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: 'whatsapp-automation',
        dataPath: authDataPath
      }),
      puppeteer: { 
        headless: process.env.WHATSAPP_HEADLESS !== 'false',
        executablePath: chromePath || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-default-apps',
          '--mute-audio',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      }
    });

    client.on('qr', (qr) => {
      clearPendingReconnect();
      currentStatus = 'qr_ready';
      lastQr = qr;
      lastError = null;
      logger.info('QR code received — scan it with your phone');
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        // ignore terminal render errors
      }
    });

    client.on('loading_screen', (percent, message) => {
      clearPendingReconnect();
      logger.info(`WhatsApp sync: ${percent}% - ${message || 'Loading'}`);
      currentStatus = 'authenticated';
    });

    client.on('authenticated', () => {
      clearPendingReconnect();
      currentStatus = 'authenticated';
      lastQr = null;
      lastError = null;
      logger.info('WhatsApp client authenticated');
    });

    client.on('ready', () => {
      clearPendingReconnect();
      currentStatus = 'ready';
      lastQr = null;
      lastError = null;
      isInitializing = false;
      logger.info(`WhatsApp client is READY! Phone: ${client?.info?.wid?.user || 'Connected'}`);
    });

    client.on('auth_failure', (msg) => {
      currentStatus = 'auth_failure';
      lastError = msg || 'Authentication failure';
      isInitializing = false;
      logger.error('WhatsApp Auth failure: ' + msg);
    });

    client.on('disconnected', (reason) => {
      currentStatus = 'disconnected';
      lastQr = null;
      lastError = `Disconnected: ${reason}`;
      isInitializing = false;
      logger.warn('WhatsApp client disconnected: ' + reason);

      // Auto-reinitialize after unexpected disconnect
      clearPendingReconnect();
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        logger.info('Attempting automatic WhatsApp reconnection after disconnect...');
        initClient(true).catch(err => {
          logger.error('Auto-reconnect error: ' + err.message);
        });
      }, 10000);
    });

    // Listen to incoming messages for auto-reply
    const autoReplyService = require('./autoReplyService');
    client.on('message', async (msg) => {
      try {
        await autoReplyService.handleInboundMessage(client, msg);
      } catch (err) {
        logger.error('Auto-reply handler error: ' + err.message);
      }
    });

    try {
      await client.initialize();
    } catch (initErr) {
      if (initErr.message && (initErr.message.includes('Execution context was destroyed') || initErr.message.includes('Protocol error'))) {
        logger.warn('Initial navigation reload detected, waiting for page stabilization...');
        await new Promise(r => setTimeout(r, 3000));
        await client.initialize().catch(e => { throw e; });
      } else {
        throw initErr;
      }
    }
    isInitializing = false;
    return client;
  } catch (err) {
    isInitializing = false;
    currentStatus = 'error';
    lastError = err.message || 'Failed to initialize client';
    logger.error(`WhatsApp initialization error: ${lastError}`);
    return null;
  }
}

function getStatus() {
  return {
    status: currentStatus,
    qr: lastQr,
    isReady: isClientConnected(),
    error: lastError,
    user: client?.info?.wid?.user || null,
    pushname: client?.info?.pushname || null
  };
}

async function reconnect() {
  logger.info('Manual WhatsApp reconnection requested');
  clearPendingReconnect();
  return await initClient(true);
}

async function logout() {
  logger.info('WhatsApp logout requested');
  clearPendingReconnect();
  try {
    if (client) {
      await client.logout().catch(() => {});
      await client.destroy().catch(() => {});
      client = null;
    }
  } catch (e) {
    logger.warn('Error during logout: ' + e.message);
  }
  currentStatus = 'disconnected';
  lastQr = null;
  setTimeout(() => {
    initClient(true).catch(e => logger.error('Re-init after logout error: ' + e.message));
  }, 1500);
  return { success: true };
}

async function isRegisteredNumber(number) {
  if (!isClientConnected()) return true;
  try {
    const formattedJid = formatPhoneToWhatsApp(number);
    const checkPromise = client.isRegisteredUser(formattedJid);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(true), 4000));
    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (e) {
    logger.warn(`isRegisteredNumber check fallback for ${number}: ${e.message}`);
    return true;
  }
}

async function fetchMediaAsMessageMedia(url) {
  // If local upload path, e.g. /uploads/filename.jpg
  if (url.startsWith('/uploads/')) {
    const localFilePath = path.resolve(__dirname, '../../', url.slice(1));
    if (fs.existsSync(localFilePath)) {
      const mimeType = mime.lookup(localFilePath) || 'application/octet-stream';
      const data = fs.readFileSync(localFilePath).toString('base64');
      const filename = path.basename(localFilePath);
      return new MessageMedia(mimeType, data, filename);
    }
  }

  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const contentType = response.headers['content-type'] || mime.lookup(url) || 'application/octet-stream';
  const extension = mime.extension(contentType) || 'bin';
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  const filename = `media.${extension}`;
  return new MessageMedia(contentType, base64, filename);
}

async function sendMessage(number, message, mediaUrl) {
  if (!client || currentStatus !== 'ready') {
    throw new Error('WhatsApp client is not ready. Please wait a few seconds or scan the QR code to pair.');
  }

  const formattedJid = formatPhoneToWhatsApp(number);

  if (mediaUrl) {
    const media = await fetchMediaAsMessageMedia(mediaUrl);
    return await client.sendMessage(formattedJid, media, { caption: message });
  }

  return await client.sendMessage(formattedJid, message);
}

async function verifyNumber(rawPhone) {
  if (!client || (currentStatus !== 'ready' && currentStatus !== 'authenticated')) {
    throw new Error('WhatsApp client is not connected. Please scan QR code to pair your device.');
  }

  const formattedJid = formatPhoneToWhatsApp(rawPhone);
  let isRegistered = true;

  try {
    const checkPromise = client.isRegisteredUser(formattedJid);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(true), 4000));
    isRegistered = await Promise.race([checkPromise, timeoutPromise]);
  } catch (err) {
    logger.warn(`Number registration check fallback for ${formattedJid}: ${err.message}`);
    isRegistered = true;
  }
  
  return {
    isRegistered: Boolean(isRegistered),
    formattedJid
  };
}

async function sendSingleMessage({ phone, message, mediaUrl }) {
  if (!client || currentStatus !== 'ready') {
    throw new Error('WhatsApp client is not ready. Please wait a few moments for chat sync to complete.');
  }

  const formattedJid = formatPhoneToWhatsApp(phone);

  let result;
  if (mediaUrl) {
    const media = await fetchMediaAsMessageMedia(mediaUrl);
    result = await client.sendMessage(formattedJid, media, { caption: message });
  } else {
    result = await client.sendMessage(formattedJid, message);
  }

  return {
    success: true,
    messageId: result?.id?._serialized || result?.id?.id || String(Date.now()),
    timestamp: Date.now()
  };
}

module.exports = {
  initClient,
  reconnect,
  logout,
  getStatus,
  isRegisteredNumber,
  sendMessage,
  verifyNumber,
  sendSingleMessage,
  _getClient: () => client
};
