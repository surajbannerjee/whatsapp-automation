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

async function initClient(forceNew = false) {
  if (isInitializing && !forceNew) {
    logger.info('WhatsApp client initialization already in progress...');
    return client;
  }

  if (client && isClientConnected() && !forceNew) {
    logger.info('WhatsApp client is already connected.');
    return client;
  }

  isInitializing = true;
  currentStatus = 'initializing';
  lastError = null;
  lastQr = null;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Cleanup existing client safely
  if (client) {
    try {
      logger.info('Destroying previous WhatsApp client instance...');
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
      logger.info(`WhatsApp sync: ${percent}% - ${message || 'Loading'}`);
      currentStatus = 'authenticated';
    });

    client.on('authenticated', () => {
      currentStatus = 'authenticated';
      lastQr = null;
      lastError = null;
      logger.info('WhatsApp client authenticated');
    });

    client.on('ready', () => {
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

      // Auto-reinitialize after 8 seconds
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          logger.info('Attempting automatic WhatsApp reconnection...');
          initClient(true).catch(err => {
            logger.error('Auto-reconnect error: ' + err.message);
          });
        }, 8000);
      }
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

    await client.initialize();
    isInitializing = false;
    return client;
  } catch (err) {
    isInitializing = false;
    currentStatus = 'error';
    lastError = err.message || 'Failed to initialize client';
    logger.error(`WhatsApp initialization error: ${lastError}`);
    
    // Schedule a retry after 15s if it failed completely
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        logger.info('Retrying WhatsApp client initialization...');
        initClient(true).catch(e => logger.error('Retry failed: ' + e.message));
      }, 15000);
    }

    return null;
  }
}

function isClientConnected() {
  return Boolean(client && (currentStatus === 'ready' || currentStatus === 'authenticated' || client.info));
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
  return await initClient(true);
}

async function logout() {
  logger.info('WhatsApp logout requested');
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
  // Reinitialize to get a fresh QR code
  setTimeout(() => {
    initClient(true).catch(e => logger.error('Re-init after logout error: ' + e.message));
  }, 1000);
  return { success: true };
}

async function isRegisteredNumber(number) {
  if (!isClientConnected()) throw new Error('WhatsApp client not initialized');
  try {
    const checkPromise = client.isRegisteredUser(number);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(true), 4000));
    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (e) {
    logger.warn(`isRegisteredUser check fallback for ${number}: ${e.message}`);
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
  if (!isClientConnected()) throw new Error('WhatsApp client is not connected');

  if (mediaUrl) {
    const media = await fetchMediaAsMessageMedia(mediaUrl);
    return client.sendMessage(number, media, { caption: message });
  }

  return client.sendMessage(number, message);
}

async function verifyNumber(rawPhone) {
  if (!isClientConnected()) {
    throw new Error('WhatsApp client is not connected. Please pair your device first.');
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
  if (!isClientConnected()) {
    throw new Error('WhatsApp client is not connected. Please pair your device first.');
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
