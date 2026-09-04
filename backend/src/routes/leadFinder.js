const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Clean and format phone numbers for Indian/International numbers
 */
function cleanPhoneNumber(rawPhone, defaultCountry = '91') {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  let digits = rawPhone.replace(/\D/g, '');
  while (digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length === 10) {
    digits = defaultCountry + digits;
  }

  return digits.length >= 10 ? digits : null;
}

/**
 * POST /api/leads/search
 * Body: { category: string, location: string, apiKey?: string }
 */
router.post('/search', async (req, res) => {
  const { category, location, apiKey } = req.body || {};

  if (!category || !location) {
    return res.status(400).json({ 
      error: 'Please provide both business category and target location.' 
    });
  }

  const serperKey = (apiKey || process.env.SERPER_API_KEY || '').trim();

  if (!serperKey) {
    return res.status(400).json({ 
      error: 'Serper.dev API Key is missing. Please provide your free API key or add SERPER_API_KEY to .env (Get free key at https://serper.dev).' 
    });
  }

  const query = `${category.trim()} in ${location.trim()}`;
  logger.info(`[Lead Finder] Searching Google Maps for query: "${query}" via Serper API`);

  try {
    const response = await axios.post(
      'https://google.serper.dev/maps',
      {
        q: query,
        gl: 'in',
        hl: 'en'
      },
      {
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const places = response.data?.places || [];
    const defaultCountry = (process.env.DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '');

    const validLeads = [];

    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      const rawPhone = place.phoneNumber || place.phone || '';
      const formattedPhone = cleanPhoneNumber(rawPhone, defaultCountry);

      if (formattedPhone) {
        validLeads.push({
          id: place.cid || `place_${i + 1}`,
          name: place.title || place.name || 'Unnamed Business',
          phone: formattedPhone,
          rawPhone: rawPhone || formattedPhone,
          rating: place.rating || null,
          reviews: place.ratingCount || place.reviews || 0,
          address: place.address || location,
          category: place.category || category,
          website: place.website || null,
          latitude: place.latitude || null,
          longitude: place.longitude || null
        });
      }
    }

    logger.info(`[Lead Finder] Found ${places.length} places, ${validLeads.length} with valid phone numbers.`);

    return res.json({
      success: true,
      query,
      totalFound: places.length,
      leadsWithPhone: validLeads.length,
      leads: validLeads
    });
  } catch (err) {
    logger.error(`[Lead Finder] Serper API error: ${err.message}`);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to search Google Maps';
    return res.status(err.response?.status || 500).json({ error: errorMessage });
  }
});

/**
 * POST /api/leads/export-csv
 * Body: { leads: [...] }
 */
router.post('/export-csv', (req, res) => {
  const { leads } = req.body || {};

  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: 'No leads provided to export.' });
  }

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const headers = ['Name', 'Phone', 'Address', 'Rating', 'Reviews', 'Category', 'Website'];
  const rows = leads.map(l => [
    escapeCsv(l.name),
    escapeCsv(l.phone),
    escapeCsv(l.address),
    escapeCsv(l.rating || ''),
    escapeCsv(l.reviews || 0),
    escapeCsv(l.category || ''),
    escapeCsv(l.website || '')
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="google_leads.csv"');
  return res.send(csvContent);
});

module.exports = router;
