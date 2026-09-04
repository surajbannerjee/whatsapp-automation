const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsappService');
const logger = require('../utils/logger');

/**
 * POST /api/verify-number
 * body: { phone: string }
 */
router.post('/verify-number', async (req, res) => {
  const { phone } = req.body || {};

  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  try {
    const status = whatsapp.getStatus();
    if (!status.isReady) {
      return res.status(400).json({ 
        error: 'WhatsApp client is not connected. Please scan the QR code to connect your account first.' 
      });
    }

    const { isRegistered, formattedJid } = await whatsapp.verifyNumber(phone.trim());
    const cleanPhone = formattedJid.replace('@c.us', '');

    logger.info(`Number verification for ${phone} -> ${cleanPhone} (Registered: ${isRegistered})`);

    return res.json({
      success: true,
      registered: isRegistered,
      formattedPhone: cleanPhone
    });
  } catch (err) {
    logger.error(`Error verifying number ${phone}: ${err.message}`);
    return res.status(400).json({ error: err.message || 'Failed to verify phone number' });
  }
});

/**
 * POST /api/send-single
 * body: { phone: string, message: string, mediaUrl?: string }
 */
router.post('/send-single', async (req, res) => {
  const { phone, message, mediaUrl } = req.body || {};

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  try {
    const status = whatsapp.getStatus();
    if (!status.isReady) {
      return res.status(400).json({ 
        error: 'WhatsApp client is not connected. Please scan the QR code first.' 
      });
    }

    const result = await whatsapp.sendSingleMessage({
      phone: phone.trim(),
      message: message.trim(),
      mediaUrl: mediaUrl || undefined
    });

    logger.info(`Direct single message successfully dispatched to ${phone}`);
    return res.json(result);
  } catch (err) {
    logger.error(`Failed to send single message to ${phone}: ${err.message}`);
    return res.status(400).json({ error: err.message || 'Failed to send message' });
  }
});

module.exports = router;
