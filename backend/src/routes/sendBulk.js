const express = require('express');
const router = express.Router();

const whatsapp = require('../services/whatsappService');
const { formatPhoneToWhatsApp } = require('../utils/phoneFormatter');
const { delay } = require('../utils/delay');
const logger = require('../utils/logger');
const campaignManager = require('../services/campaignManager');

function randomDelayMs(min = 25000, max = 45000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * POST /api/send-bulk
 * body: { contacts: [{name, phone}], message: string, mediaUrl?: string }
 */
router.post('/send-bulk', async (req, res) => {
  const { contacts, message, mediaUrl } = req.body || {};

  if (!Array.isArray(contacts) || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid request body. Provide contacts array and message.' });
  }

  const MAX_BATCH = 20;
  if (contacts.length === 0) return res.status(400).json({ error: 'No contacts provided' });
  if (contacts.length > MAX_BATCH) return res.status(400).json({ error: `Batch size limit exceeded (max ${MAX_BATCH})` });

  // Create campaign and return id immediately. Processing runs in background.
  const campaign = campaignManager.createCampaign({ contacts });

  (async () => {
    try {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const name = contact.name || '';
        const rawPhone = contact.phone || '';

        try {
          const formatted = formatPhoneToWhatsApp(rawPhone);

          const exists = await whatsapp.isRegisteredNumber(formatted);
          if (!exists) {
            logger.warn(`Skipping unregistered number: ${formatted} (${name})`);
            campaignManager.updateResult(campaign.id, i, { status: 'unregistered' });
            continue;
          }

          // Personalize message for this recipient
          const personalizedMessage = message
            .replace(/\{\{\s*name\s*\}\}/gi, name || 'there')
            .replace(/\{\s*name\s*\}/gi, name || 'there')
            .replace(/\{\{\s*phone\s*\}\}/gi, rawPhone)
            .replace(/\{\s*phone\s*\}/gi, rawPhone);

          // Try send with up to 1 retry
          try {
            await whatsapp.sendMessage(formatted, personalizedMessage, mediaUrl);
            logger.info(`Sent to ${formatted} (${name})`);
            campaignManager.updateResult(campaign.id, i, { status: 'sent' });
          } catch (err) {
            logger.warn(`Send failed for ${formatted}, retrying: ${err.message}`);
            // retry once
            try {
              await delay(2000);
              await whatsapp.sendMessage(formatted, personalizedMessage, mediaUrl);
              campaignManager.updateResult(campaign.id, i, { status: 'sent' });
            } catch (err2) {
              logger.error(`Failed for ${rawPhone} (${name}): ${err2.message}`);
              campaignManager.updateResult(campaign.id, i, { status: 'failed', error: err2.message });
            }
          }

          // Random delay between 25-45s to reduce ban risk
          const waitMs = randomDelayMs(25000, 45000);
          await delay(waitMs);
        } catch (err) {
          logger.error(`Processing error for ${rawPhone} (${name}): ${err.message}`);
          campaignManager.updateResult(campaign.id, i, { status: 'failed', error: err.message });
        }
      }

      campaignManager.setStatus(campaign.id, 'completed');
      logger.info(`Campaign ${campaign.id} completed`);
    } catch (err) {
      logger.error('Campaign processing unexpected error: ' + err.message);
      campaignManager.setStatus(campaign.id, 'failed');
    }
  })();

  return res.json({ campaignId: campaign.id });
});

module.exports = router;
