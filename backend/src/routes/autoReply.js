const express = require('express');
const router = express.Router();
const autoReplyService = require('../services/autoReplyService');

// GET /api/auto-reply/config
router.get('/auto-reply/config', (req, res) => {
  return res.json(autoReplyService.getStats());
});

// POST /api/auto-reply/config
router.post('/auto-reply/config', (req, res) => {
  const { enabled, template, cooldownHours } = req.body || {};
  const updated = autoReplyService.updateConfig({ enabled, template, cooldownHours });
  return res.json({ success: true, config: updated });
});

// POST /api/auto-reply/clear-history
router.post('/auto-reply/clear-history', (req, res) => {
  const result = autoReplyService.clearCooldowns();
  return res.json({ success: true, ...result });
});

module.exports = router;
