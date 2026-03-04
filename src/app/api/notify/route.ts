import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// All subscribers who have started the bot
const SUBSCRIBERS = [
  '353201749',  // Anil Chinchawale
  '434349539',  // AKXinFin
  '442140952',  // Ritesh
];

// Track sent signal IDs to avoid duplicates
const sentNotifications = new Set<string>();
// Track sent digest keys to avoid resending identical digests
const sentDigestKeys = new Set<string>();

interface Signal {
  id: string;
  title: string;
  severity: string;
  category?: string;
  region?: string;
  source: string;
  sourceUrl: string;
  timeAgo: string;
  timestamp?: string;
  summary?: string;
}

async function sendTelegramMessage(chatId: string, text: string, parseMode: string = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return { ok: false, error: 'Bot token not configured' };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Telegram send error:', error);
    return { ok: false, error: String(error) };
  }
}

// Broadcast to all subscribers
async function broadcastMessage(text: string) {
  const results = [];
  for (const chatId of SUBSCRIBERS) {
    const result = await sendTelegramMessage(chatId, text);
    results.push({ chatId, ok: result.ok });
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 150));
  }
  return results;
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
  }).replace(',', ' |');
}

function cleanTitle(title: string): string {
  // Strip HTML tags, truncate to ~80 chars
  return title.replace(/<[^>]+>/g, '').slice(0, 85).trim();
}

function buildDigestMessage(signals: Signal[], totalTracked: number): string {
  const SEP = '━━━━━━━━━━━━━━━━━━━━';

  // Group by severity
  const criticals = signals.filter(s => s.severity === 'CRITICAL');
  const highs = signals.filter(s => s.severity === 'HIGH');

  // Build header summary line
  const parts: string[] = [];
  if (criticals.length) parts.push(`🚨 ${criticals.length} CRITICAL`);
  if (highs.length) parts.push(`🔴 ${highs.length} HIGH`);
  const summaryLine = parts.join('  ');

  const timestamp = formatTimestamp();

  let msg = `🌐 <b>GLOBENEWS LIVE</b> | ${timestamp}\n`;
  msg += `${SEP}\n`;
  msg += `${summaryLine}\n`;
  msg += `${SEP}\n\n`;

  // CRITICAL section
  if (criticals.length > 0) {
    msg += `🚨 <b>CRITICAL</b>\n`;
    for (const s of criticals) {
      const title = cleanTitle(s.title);
      msg += `• ${title} — <i>${s.source}</i>\n`;
    }
    msg += '\n';
  }

  // HIGH section
  if (highs.length > 0) {
    msg += `🔴 <b>HIGH</b>\n`;
    for (const s of highs) {
      const title = cleanTitle(s.title);
      msg += `• ${title} — <i>${s.source}</i>\n`;
    }
    msg += '\n';
  }

  msg += `${SEP}\n`;
  msg += `📊 ${totalTracked} conflicts tracked\n`;
  msg += `🔗 <a href="https://globenews.live">globenews.live</a>`;

  return msg;
}

export async function GET(request: NextRequest) {
  // Fetch latest signals - use localhost for internal calls
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'http://127.0.0.1:3400'
    : request.nextUrl.origin;

  try {
    const response = await fetch(`${baseUrl}/api/signals?limit=20`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
    }

    const data = await response.json();
    const signals: Signal[] = data.signals || [];

    // All signals for tracked count
    const totalTracked = signals.length;

    // Filter for HIGH/CRITICAL that haven't been sent yet
    const newAlerts = signals.filter(
      (s) => ['CRITICAL', 'HIGH'].includes(s.severity) && !sentNotifications.has(s.id)
    );

    if (newAlerts.length === 0) {
      return NextResponse.json({
        checked: signals.length,
        newAlerts: 0,
        sent: false,
        reason: 'No new HIGH/CRITICAL signals',
        trackedIds: sentNotifications.size,
      });
    }

    // Deduplicate by digest key (sorted IDs) — prevents resending same set if cron fires twice
    const digestKey = newAlerts.map(s => s.id).sort().join('|');
    if (sentDigestKeys.has(digestKey)) {
      return NextResponse.json({
        checked: signals.length,
        newAlerts: newAlerts.length,
        sent: false,
        reason: 'Identical digest already sent',
        trackedIds: sentNotifications.size,
      });
    }

    // Build ONE consolidated digest (cap at top 8 to avoid message length issues)
    const toSend = newAlerts.slice(0, 8);
    const digestMessage = buildDigestMessage(toSend, totalTracked);

    // Send single digest to all subscribers
    const broadcastResults = await broadcastMessage(digestMessage);

    const anySuccess = broadcastResults.some(r => r.ok);

    if (anySuccess) {
      // Mark all included signals as sent
      for (const s of toSend) {
        sentNotifications.add(s.id);
      }
      sentDigestKeys.add(digestKey);

      // Keep sets manageable
      if (sentNotifications.size > 500) {
        const arr = Array.from(sentNotifications);
        arr.slice(0, 250).forEach(id => sentNotifications.delete(id));
      }
      if (sentDigestKeys.size > 100) {
        const arr = Array.from(sentDigestKeys);
        arr.slice(0, 50).forEach(k => sentDigestKeys.delete(k));
      }
    }

    return NextResponse.json({
      checked: signals.length,
      newAlerts: newAlerts.length,
      sentCount: toSend.length,
      sent: anySuccess,
      subscribers: SUBSCRIBERS.length,
      broadcast: broadcastResults,
      trackedIds: sentNotifications.size,
      preview: digestMessage.slice(0, 300) + '...',
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Manual alert send - broadcasts to all subscribers
  try {
    const body = await request.json();
    const { message, chatId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // If specific chatId provided, send only to that user
    if (chatId) {
      const result = await sendTelegramMessage(chatId, message, 'HTML');
      return NextResponse.json(result);
    }

    // Otherwise broadcast to all subscribers
    const results = await broadcastMessage(message);
    return NextResponse.json({
      ok: true,
      subscribers: SUBSCRIBERS.length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
