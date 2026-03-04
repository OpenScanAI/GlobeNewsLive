#!/usr/bin/env node
/**
 * Iran War Alert Bot
 * Monitors signal feed for Iran-related news and sends Telegram alerts
 */

const TELEGRAM_BOT_TOKEN = '8762819044:AAG0Aguel739eHCSL-S8cixe08TfSOPiPnU';
const TELEGRAM_CHAT_ID = '353201749';
const FEED_URL = 'https://feed.xdc.network/api/signals';
const STATE_FILE = '/tmp/iran-alert-state.json';

const fs = require('fs');

// Iran-related keywords for filtering
const IRAN_KEYWORDS = [
  'iran', 'tehran', 'persian', 'irgc', 'khamenei', 'raisi',
  'hezbollah', 'houthi', 'houthis', 'ansar allah',
  'israel', 'idf', 'netanyahu', 'tel aviv', 'jerusalem', 'gaza', 'hamas',
  'strike', 'missile', 'drone attack', 'retaliation', 'escalation',
  'nuclear', 'enrichment', 'natanz', 'fordow', 'iaea',
  'red sea', 'hormuz', 'strait', 'tanker attack',
  'beirut', 'lebanon', 'syria', 'damascus', 'iraq', 'baghdad', 'yemen',
  'centcom', 'pentagon', 'aircraft carrier', 'b-52', 'f-35'
];

// Severity emojis
const SEVERITY_EMOJI = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🟢'
};

// Load last seen signal IDs
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { seenIds: [], lastCheck: null };
}

// Save state
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Check if signal is Iran-related
function isIranRelated(signal) {
  const text = `${signal.title} ${signal.summary || ''}`.toLowerCase();
  return IRAN_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

// Send Telegram message
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const data = await res.json();
    return data.ok;
  } catch (e) {
    console.error('Telegram error:', e.message);
    return false;
  }
}

// Format signal for Telegram
function formatSignal(signal) {
  const emoji = SEVERITY_EMOJI[signal.severity] || '⚪';
  const category = signal.category ? `[${signal.category.toUpperCase()}]` : '';
  
  let msg = `${emoji} <b>${signal.severity}</b> ${category}\n\n`;
  msg += `<b>${signal.title}</b>\n\n`;
  
  if (signal.summary) {
    msg += `${signal.summary.substring(0, 200)}...\n\n`;
  }
  
  msg += `📰 ${signal.source} • ${signal.timeAgo}\n`;
  
  if (signal.sourceUrl) {
    msg += `🔗 <a href="${signal.sourceUrl}">Read more</a>`;
  }
  
  return msg;
}

// Main function
async function checkAndAlert() {
  console.log(`[${new Date().toISOString()}] Checking for Iran-related signals...`);
  
  const state = loadState();
  
  try {
    const res = await fetch(FEED_URL);
    const data = await res.json();
    const signals = data.signals || [];
    
    // Filter Iran-related and unseen signals
    const iranSignals = signals.filter(s => 
      isIranRelated(s) && 
      !state.seenIds.includes(s.id) &&
      (s.severity === 'CRITICAL' || s.severity === 'HIGH')
    );
    
    console.log(`Found ${iranSignals.length} new Iran-related alerts`);
    
    // Send alerts for new signals (max 5 per run to avoid spam)
    const toSend = iranSignals.slice(0, 5);
    
    for (const signal of toSend) {
      const message = formatSignal(signal);
      const sent = await sendTelegram(message);
      
      if (sent) {
        state.seenIds.push(signal.id);
        console.log(`✓ Sent alert: ${signal.title.substring(0, 50)}...`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Keep only last 500 seen IDs
    if (state.seenIds.length > 500) {
      state.seenIds = state.seenIds.slice(-500);
    }
    
    state.lastCheck = new Date().toISOString();
    saveState(state);
    
    console.log(`[${new Date().toISOString()}] Check complete. ${toSend.length} alerts sent.`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

// Run
checkAndAlert();
