const { v4: uuidv4 } = require('uuid');

const campaigns = new Map();

function createCampaign({ contacts }) {
  const id = uuidv4();
  const results = contacts.map(c => ({ contact: c, status: 'pending' }));
  const entry = { id, contacts, results, status: 'running', createdAt: Date.now() };
  campaigns.set(id, entry);
  return entry;
}

function updateResult(campaignId, index, update) {
  const c = campaigns.get(campaignId);
  if (!c) return;
  c.results[index] = { ...c.results[index], ...update };
}

function setStatus(campaignId, status) {
  const c = campaigns.get(campaignId);
  if (!c) return;
  c.status = status;
}

function getCampaign(campaignId) {
  return campaigns.get(campaignId);
}

module.exports = { createCampaign, updateResult, setStatus, getCampaign };
