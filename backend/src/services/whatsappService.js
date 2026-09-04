const qrcode = require('qrcode-terminal');
const axios = require('axios');
const mime = require('mime-types');
const puppeteer = require('puppeteer');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const logger = require('../utils/logger');

let client;
let currentStatus = 'initializing';
let lastQr = null;

async function initClient() {
  if (client) return client;

  let chromePath;
  try {
    if (typeof puppeteer.executablePath === 'function') {
      chromePath = puppeteer.executablePath();
      logger.info('Resolved Chrome executable path: ' + chromePath);
    }
  } catch (err) {
    logger.warn('Could not automatically resolve puppeteer.executablePath: ' + err.message);
  }

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'whatsapp-automation' }),
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
        '--single-process',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--mute-audio'
      ]
    }
  });

  client.on('qr', (qr) => {
    currentStatus = 'qr_ready';
    lastQr = qr;
    logger.info('QR code received — scan it with your phone');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    currentStatus = 'authenticated';
    lastQr = null;
    logger.info('WhatsApp client authenticated');
  });

  client.on('ready', () => {
    currentStatus = 'ready';
    lastQr = null;
    logger.info('WhatsApp client is ready');
  });

  client.on('auth_failure', msg => {
    currentStatus = 'auth_failure';
    logger.error('Auth failure: ' + msg);
  });

  client.on('disconnected', reason => {
    currentStatus = 'disconnected';
    lastQr = null;
    logger.warn('WhatsApp client disconnected: ' + reason);
  });

  // Listen to incoming messages for automatic thank you auto-reply
  const autoReplyService = require('./autoReplyService');
  client.on('message', async (msg) => {
    try {
      await autoReplyService.handleInboundMessage(client, msg);
    } catch (err) {
      logger.error('Auto-reply handler error: ' + err.message);
    }
  });

  await client.initialize();
  return client;
}

function getStatus() {
  return {
    status: currentStatus,
    qr: lastQr,
    isReady: currentStatus === 'ready'
  };
}

async function isRegisteredNumber(number) {
  if (!client) throw new Error('WhatsApp client not initialized');
  return client.isRegisteredUser(number);
}

async function fetchMediaAsMessageMedia(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const contentType = response.headers['content-type'] || mime.lookup(url) || 'application/octet-stream';
  const extension = mime.extension(contentType) || 'bin';
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  const filename = `media.${extension}`;
  return new MessageMedia(contentType, base64, filename);
}

async function sendMessage(number, message, mediaUrl) {
  if (!client) throw new Error('WhatsApp client not initialized');

  if (mediaUrl) {
    const media = await fetchMediaAsMessageMedia(mediaUrl);
    return client.sendMessage(number, media, { caption: message });
  }

  return client.sendMessage(number, message);
}

const { formatPhoneToWhatsApp } = require('../utils/phoneFormatter');

async function verifyNumber(rawPhone) {
  if (!client || currentStatus !== 'ready') {
    throw new Error('WhatsApp client is not ready. Please pair your device first.');
  }

  const formattedJid = formatPhoneToWhatsApp(rawPhone);
  const isRegistered = await client.isRegisteredUser(formattedJid);
  
  return {
    isRegistered: Boolean(isRegistered),
    formattedJid
  };
}

async function sendSingleMessage({ phone, message, mediaUrl }) {
  if (!client || currentStatus !== 'ready') {
    throw new Error('WhatsApp client is not connected. Please pair your device first.');
  }

  const formattedJid = formatPhoneToWhatsApp(phone);
  const isRegistered = await client.isRegisteredUser(formattedJid);

  if (!isRegistered) {
    throw new Error(`The phone number ${phone} is not registered on WhatsApp.`);
  }

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
  getStatus,
  isRegisteredNumber,
  sendMessage,
  verifyNumber,
  sendSingleMessage,
  _getClient: () => client
};
