const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Directs Puppeteer to store Chromium browser binaries inside the project cache
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
