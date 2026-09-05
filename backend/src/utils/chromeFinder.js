const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const logger = require('./logger');

/**
 * Robustly finds an available Chrome/Chromium/Edge executable on the system.
 */
function findChromeExecutable() {
  // 1. Explicit env variable override
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.CHROME_BIN;
  if (envPath && fs.existsSync(envPath)) {
    logger.info(`Using Chrome binary from environment variable: ${envPath}`);
    return envPath;
  }

  // 2. Puppeteer resolved default path (only if it actually exists on disk)
  try {
    if (typeof puppeteer.executablePath === 'function') {
      const ppath = puppeteer.executablePath();
      if (ppath && fs.existsSync(ppath)) {
        logger.info(`Using Puppeteer bundled Chrome: ${ppath}`);
        return ppath;
      }
    }
  } catch (err) {
    // ignore
  }

  // 3. Platform-specific well-known paths
  const platform = process.platform;
  const candidates = [];

  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

    candidates.push(
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe')
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    );
  } else {
    // Linux
    candidates.push(
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium'
    );
  }

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      logger.info(`Found system browser binary: ${candidate}`);
      return candidate;
    }
  }

  logger.warn('No existing Chrome/Chromium binary found in standard paths. Falling back to default Puppeteer launcher.');
  return undefined;
}

module.exports = { findChromeExecutable };
