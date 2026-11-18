// Put this file at: api/chat.ts   (the "api" folder is at the ROOT of the repo, next to package.json,
// NOT inside "src").
//
// It replaces the Express endpoint that only existed in AI Studio. Vercel serves the Vite build as
// static files, so without this function the browser gets 404 on /api/chat.
//
// Required environment variable on Vercel (Settings > Environment Variables):
//   GEMINI_API_KEY   your Google AI Studio key. Do NOT prefix it with VITE_ (that would expose it).
// Optional:
//   GEMINI_MODEL     force one model for every request (useful if a model name stops working)

const ALLOWED_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

const ROLE_PROMPTS: Record<string, string> = {
  concierge:
    'You are the front-desk concierge of a barbershop. Help staff with appointments, walk-in wait times, chair availability and client questions. Be brief, friendly and practical.',
  barber:
    'You are a master barber and educator. Advise on haircut formulas, guard progressions, fades, textures, beard work and product choice. Be specific and practical.',
  strategist:
    'You are a business strategist for a barbershop. Advise on revenue, chair utilization, pricing, retention and inventory. Base your advice on the numbers you are given and say clearly when data is missing.'
};

type ChatMessage = { role: string; content: string };

// Turn an untrusted value into a short list of short strings
const toList = (value: unknown, maxItems: number, maxLen = 160): string[] =>
  Array.isArray(value)
    ? value
        .filter((v) => typeof v === 'string')
        .slice(0, maxItems)
        .map((v: string) => v.slice(0, maxLen))
    : [];

const section = (title: string, items: string[], emptyText: string): string =>
  items.length > 0 ? `${title}:\n${items.map((i) => `  - ${i}`).join('\n')}` : `${title}: ${emptyText}`;

type MemberCheck = 'ok' | 'no_token' | 'no_config' | 'bad_token' | 'no_salon' | 'unreachable';

// Checks, with the user's own token, that this is a signed-in user who belongs to a salon.
// The database rules decide: an outsider gets no row back.
async function checkMember(token: string): Promise<MemberCheck> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return 'no_config';
  if (!token) return 'no_token';
  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/shop_members?select=role&limit=1`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }
    });
    if (r.status === 401 || r.status === 403) return 'bad_token';
    if (!r.ok) return 'unreachable';
    const rows = await r.json();
    return Array.isArray(rows) && rows.length > 0 ? 'ok' : 'no_salon';
  } catch {
    return 'unreachable';
  }
}

const AUTH_ERRORS: Record<Exclude<MemberCheck, 'ok'>, { status: number; error: string }> = {
  no_token: { status: 401, error: 'No sign-in token was sent. Reload the page and sign in again.' },
  no_config: { status: 500, error: 'The server is missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.' },
  bad_token: { status: 401, error: 'Your sign-in session is invalid or expired. Sign out and sign in again.' },
  no_salon: { status: 403, error: 'Your account is not linked to a salon.' },
  unreachable: { status: 502, error: 'Could not verify your account with the database.' }
};

const reply = (res: any, content: string, modelUsed: string) =>
  res.status(200).json({ content, modelUsed });

type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; kind: 'timeout' | 'network' | 'http' | 'blocked' | 'empty'; status?: number; detail?: string };

// One call to Gemini with its own time limit. Never throws.
async function callGemini(
  model: string,
  apiKey: string,
  systemText: string,
  contents: unknown[],
  timeoutMs: number
): Promise<GeminiResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
        }),
        signal: controller.signal
      }
    );

    const data: any = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return { ok: false, kind: 'http', status: upstream.status, detail: data?.error?.message || `HTTP ${upstream.status}` };
    }

    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
      .join('')
      .trim();

    if (!text) {
      const blocked = data?.promptFeedback?.blockReason;
      return blocked ? { ok: false, kind: 'blocked', detail: String(blocked) } : { ok: false, kind: 'empty' };
    }

    return { ok: true, text };
  } catch (err: any) {
    return { ok: false, kind: err?.name === 'AbortError' ? 'timeout' : 'network', detail: err?.message };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const check = await checkMember(token);
  if (check !== 'ok') {
    const failure = AUTH_ERRORS[check];
    return res.status(failure.status).json({ error: failure.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  const requestedModel = typeof body.model === 'string' ? body.model : ALLOWED_MODELS[0];
  const model =
    process.env.GEMINI_MODEL || (ALLOWED_MODELS.includes(requestedModel) ? requestedModel : ALLOWED_MODELS[0]);

  if (!apiKey) {
    // Shown inside the chat window so the problem is visible instead of a bare status code.
    return reply(
      res,
      'The AI service is not configured yet: GEMINI_API_KEY is missing on the server. Add it in Vercel (Settings > Environment Variables) and redeploy.',
      model
    );
  }

  // Validate and trim the conversation
  const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const cleaned = incoming
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  // Gemini needs the conversation to start with a user turn (the UI starts with the assistant greeting)
  while (cleaned.length > 0 && cleaned[0].role !== 'user') cleaned.shift();
  if (cleaned.length === 0) {
    return res.status(400).json({ error: 'No user message provided' });
  }

  // Merge consecutive messages from the same side, as Gemini expects alternating turns
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  cleaned.forEach((m) => {
    const geminiRole = m.role === 'user' ? 'user' : 'model';
    const last = contents[contents.length - 1];
    if (last && last.role === geminiRole) {
      last.parts[0].text += '\n' + m.content;
    } else {
      contents.push({ role: geminiRole, parts: [{ text: m.content }] });
    }
  });

  const role = typeof body.role === 'string' && ROLE_PROMPTS[body.role] ? body.role : 'concierge';
  const ctx = body.salonContext && typeof body.salonContext === 'object' ? body.salonContext : {};

  const systemText = [
    ROLE_PROMPTS[role],
    'Reply in the same language the user writes in. Keep answers short unless asked for detail.',
    'Live salon data (use it, and never invent numbers that are not here).',
    'If a list below is empty, say that nothing is recorded yet. Never claim things are fine, well-stocked or on track when there is simply no data.',
    `- Walk-ins waiting: ${Number(ctx.walkInCount) || 0}`,
    `- Low-stock items: ${Number(ctx.lowStockCount) || 0}`,
    `- Barbers: ${Number(ctx.totalBarbers) || 0}`,
    `- Appointments on record: ${Number(ctx.appointmentsCount) || 0}`,
    `- Barber status: ${typeof ctx.activeBarbers === 'string' && ctx.activeBarbers ? ctx.activeBarbers.slice(0, 600) : 'none'}`,
    section(
      `Inventory (${Number(ctx.inventoryItemCount) || 0} items recorded)`,
      toList(ctx.inventory, 30),
      'no inventory items are recorded yet'
    ),
    section('Services', toList(ctx.services, 20), 'no services are recorded yet'),
    section("Today's appointments", toList(ctx.todayAppointments, 15), 'none today'),
    section('Walk-ins waiting', toList(ctx.waitingWalkIns, 10), 'nobody is waiting')
  ].join('\n');

  // Try the requested model first. If it is slow or unavailable, try the other one once.
  const order = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [model, ...ALLOWED_MODELS.filter((m) => m !== model)];
  const primaryMs = Number(process.env.CHAT_TIMEOUT_MS) || 25000;
  const tried: string[] = [];
  let lastModel = model;
  let failure: Extract<GeminiResult, { ok: false }> = { ok: false, kind: 'empty' };

  for (let i = 0; i < order.length; i++) {
    const current = order[i];
    const result = await callGemini(current, apiKey, systemText, contents, i === 0 ? primaryMs : Math.round(primaryMs * 0.8));
    if (result.ok) return reply(res, result.text, current);

    console.error('Gemini failed:', current, result.kind, result.status ?? '', result.detail ?? '');
    tried.push(current);
    lastModel = current;
    failure = result;

    // A different model cannot fix a bad key, a bad request or a blocked prompt
    if (result.kind === 'blocked') break;
    if (result.kind === 'http' && [400, 401, 403].includes(result.status ?? 0)) break;
  }

  const message =
    failure.kind === 'timeout'
      ? `The AI took too long to answer (tried: ${tried.join(', ')}). Please try again.`
      : failure.kind === 'network'
        ? `Could not reach the AI provider (tried: ${tried.join(', ')}). Please try again.`
        : failure.kind === 'http'
          ? `The AI provider returned an error (${failure.status}) from ${lastModel}: ${failure.detail}`
          : failure.kind === 'blocked'
            ? `The AI could not answer this request (${failure.detail}).`
            : 'The AI returned an empty answer. Please try again.';

  return reply(res, message, lastModel);
}
