"use strict";

const puppeteer = require("puppeteer-core");
const fs = require("fs");

// @sparticuz/chromium is optional: only loaded on Linux (serverless/Docker PDF path).
// Local macOS/Windows dev uses system Chrome — avoids hard dependency on @sparticuz/chromium.

const CHROMIUM_HEAP_MB = Math.max(128, parseInt(process.env.PUPPETEER_JS_MAX_OLD_SPACE_SIZE || "512", 10));
const JS_FLAGS_HEAP = `--js-flags=--max-old-space-size=${CHROMIUM_HEAP_MB}`;
const MAX_RENDERS_BEFORE_RESTART = Math.max(1, parseInt(process.env.PDF_CHROMIUM_MAX_RENDERS || "50", 10));
const MAX_AGE_MS_BEFORE_RESTART = Math.max(60_000, parseInt(process.env.PDF_CHROMIUM_MAX_AGE_MS || "1800000", 10)); // 30 min default

const LOCAL_CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function getSparticuzChromium() {
    try {
        return require("@sparticuz/chromium");
    } catch {
        return null;
    }
}

const FALLBACK_CHROME_ARGS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
];

/**
 * @returns {Promise<{ executablePath: string, args: string[], headless: boolean | string }>}
 */
async function getLaunchConfig() {
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const sparticuz = process.platform === "linux" ? getSparticuzChromium() : null;
    const extraArgsFromBundled = sparticuz && Array.isArray(sparticuz.args) ? sparticuz.args : [];

    if (envPath && fs.existsSync(envPath)) {
        return {
            executablePath: envPath,
            args: [...extraArgsFromBundled, ...FALLBACK_CHROME_ARGS, JS_FLAGS_HEAP],
            headless: true,
        };
    }

    if (process.platform === "linux" && sparticuz) {
        return {
            executablePath: await sparticuz.executablePath(),
            args: [...extraArgsFromBundled, JS_FLAGS_HEAP],
            headless: sparticuz.headless,
        };
    }

    const executablePath = LOCAL_CHROME_CANDIDATES.find((p) => fs.existsSync(p));
    if (!executablePath) {
        throw new Error(
            "No Chrome/Chromium found for PDF rendering. Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH. " +
                "On Linux servers you may install @sparticuz/chromium."
        );
    }
    return {
        executablePath,
        args: [...extraArgsFromBundled, ...FALLBACK_CHROME_ARGS, JS_FLAGS_HEAP],
        headless: true,
    };
}

let _browserInstance = null;
let _browserLaunchPromise = null;
let _renderCount = 0;
let _browserLaunchedAt = 0;

async function getBrowser() {
    if (_browserInstance && _browserInstance.isConnected()) {
        return _browserInstance;
    }
    if (_browserLaunchPromise) return _browserLaunchPromise;

    _browserLaunchPromise = (async () => {
        const config = await getLaunchConfig();
        _browserInstance = await puppeteer.launch(config);
        _renderCount = 0;
        _browserLaunchedAt = Date.now();
        _browserInstance.on("disconnected", () => {
            _browserInstance = null;
            _browserLaunchPromise = null;
        });
        _browserLaunchPromise = null;
        return _browserInstance;
    })();
    return _browserLaunchPromise;
}

function recordRender() {
    _renderCount += 1;
    const ageMs = _browserLaunchedAt ? Date.now() - _browserLaunchedAt : 0;
    if (
        _renderCount >= MAX_RENDERS_BEFORE_RESTART ||
        ageMs >= MAX_AGE_MS_BEFORE_RESTART
    ) {
        closeBrowser().catch(() => { });
    }
}

async function closeBrowser() {
    if (_browserInstance) {
        await _browserInstance.close().catch(() => { });
        _browserInstance = null;
        _browserLaunchPromise = null;
    }
    _renderCount = 0;
    _browserLaunchedAt = 0;
}

process.on("SIGTERM", closeBrowser);
process.on("SIGINT", closeBrowser);

module.exports = {
    getBrowser,
    closeBrowser,
    recordRender,
};
