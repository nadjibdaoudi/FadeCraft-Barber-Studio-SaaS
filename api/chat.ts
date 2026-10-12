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

const reply = (res: any, content: string, modelUsed: string) =>
  res.status(200).json({ content, modelUsed });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
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
    'Live salon data (use it, and never invent numbers that are not here):',
    `- Walk-ins waiting: ${Number(ctx.walkInCount) || 0}`,
    `- Low-stock items: ${Number(ctx.lowStockCount) || 0}`,
    `- Barbers: ${Number(ctx.totalBarbers) || 0}`,
    `- Appointments on record: ${Number(ctx.appointmentsCount) || 0}`,
    `- Barber status: ${typeof ctx.activeBarbers === 'string' && ctx.activeBarbers ? ctx.activeBarbers.slice(0, 600) : 'none'}`
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

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
      const detail = data?.error?.message || `HTTP ${upstream.status}`;
      console.error('Gemini error:', upstream.status, detail);
      return reply(res, `The AI provider returned an error (${upstream.status}): ${detail}`, model);
    }

    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
      .join('')
      .trim();

    if (!text) {
      const blocked = data?.promptFeedback?.blockReason;
      return reply(
        res,
        blocked ? `The AI could not answer this request (${blocked}).` : 'The AI returned an empty answer. Please try again.',
        model
      );
    }

    return reply(res, text, model);
  } catch (err: any) {
    console.error('Chat function failed:', err);
    const timedOut = err?.name === 'AbortError';
    return reply(
      res,
      timedOut ? 'The AI took too long to answer. Please try again.' : 'Could not reach the AI provider. Please try again.',
      model
    );
  } finally {
    clearTimeout(timer);
  }
}
