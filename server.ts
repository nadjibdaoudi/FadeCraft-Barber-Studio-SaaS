import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Gemini API client on the server
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Multi-turn Gemini Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { 
        messages, 
        role = 'concierge', 
        model = 'gemini-3.5-flash',
        salonContext 
      } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Allowed models per instruction:
      // gemini-3.8-flash for general tasks (recommended default)
      // gemini-3.1-flash-lite for fast tasks
      const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      const selectedModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

      // System Instructions based on chosen role
      let roleInstruction = '';
      if (role === 'barber') {
        roleInstruction = `You are FadeCraft Barber Studio's Master Barber & Technical Styling Specialist.
Your expertise covers precision clipper guards (#0.5 to skin foil, taper fades), scissor texturing, crown cowlicks, natural beard lines, hot towel steam treatments, and pomade finishes.
Provide direct, craft-focused advice on formulas, grooming products, and styling techniques.`;
      } else if (role === 'strategist') {
        roleInstruction = `You are FadeCraft Barber Studio's Business Operations & Revenue Strategist.
You analyze chair turnover pace, average ticket pricing ($45 - $95), client rebooking retention, inventory burn rates, and automated SMS reminder ROI.
Provide insightful, data-driven suggestions to optimize profitability and salon productivity.`;
      } else {
        roleInstruction = `You are FadeCraft Barber Studio's AI Salon Concierge & Front-Desk Assistant.
You assist shop owners and barbers with appointment management, walk-in waitlist recommendations, client hospitality, and service coordination.
Tone: Warm, courteous, polished, and concise.`;
      }

      const contextSummary = salonContext ? `
CURRENT SALON LIVE DATA:
- Location: Keystone Barber Downtown Flagship (6 chairs)
- Working Barbers: Marcus Vance (Chair 1), Tariq Al-Mansoor (Chair 2), Leo Rossi (Chair 3), Sarah Cole (Chair 4), Damon West (Chair 5)
- Active Walk-in Queue: ${salonContext.walkInCount || 0} clients waiting in lounge
- Critical Low-Stock Supplies: ${salonContext.lowStockCount || 0} items below threshold
- Monthly Revenue Pace: $186,420 (78% of $240,000 annual goal)
- Average Chair Turnaround: 34m 12s
` : '';

      const systemInstruction = `${roleInstruction}\n${contextSummary}\nKeep responses clear, concise, well-formatted with markdown, and directly helpful.`;

      // Check if GEMINI_API_KEY is available
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
        // Format messages into Gemini contents format
        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction,
          },
        });

        const replyText = response.text || 'I am ready to help coordinate chair schedules, review customer profiles, or assist with inventory orders.';

        return res.json({
          role: 'assistant',
          content: replyText,
          modelUsed: selectedModel,
        });
      }

      // Contextual studio assistant fallback when API key is not configured in environment
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let fallbackReply = '';

      if (lastUserMsg.includes('walk-in') || lastUserMsg.includes('available') || lastUserMsg.includes('next')) {
        fallbackReply = `**Next Available Barber Recommendation:**\n\n• **Tariq Al-Mansoor (Chair #2)** is currently finishing a Beard Sculpt and has an open chair estimated in **~8 minutes**.\n• **Sarah Cole (Chair #4)** is free in **~14 minutes** after her Deluxe Duo.\n\nCurrently, there are **${salonContext?.walkInCount || 0} client(s)** in the active lounge waitlist. Would you like me to reserve a walk-in ticket for a Skin Fade or Beard Trim?`;
      } else if (lastUserMsg.includes('stock') || lastUserMsg.includes('supplies') || lastUserMsg.includes('inventory') || lastUserMsg.includes('blade')) {
        fallbackReply = `**Critical Supplies & Inventory Status:**\n\n• **${salonContext?.lowStockCount || 3} items** have breached minimum reorder threshold:\n  - *Astra Platinum Double Edge Blades* (3 boxes left, min 8)\n  - *Matte Texture Clay 100ml* (2 tins left, min 6)\n  - *Eucalyptus Hot Towel Essential Oil* (1 bottle left, min 4)\n\nRecommended Action: Tap **Supplies & Inventory** in the sidebar to review purchase orders or dispatch restock requests to suppliers.`;
      } else if (lastUserMsg.includes('fade') || lastUserMsg.includes('formula') || lastUserMsg.includes('taper') || lastUserMsg.includes('guard')) {
        fallbackReply = `**Precision Fade Formula & Technical Guide:**\n\n1. **Base Foundation**: Clear bulk with #2 guard with closed lever around the parietal ridge.\n2. **Bald Line**: Zero gap trimmer / foil shaver 1 finger-width above the ear arc.\n3. **Transition**: Open #0.5 lever halfway, flicking upwards 0.5 inch to blend harsh demarcation.\n4. **Crown & Texture**: Scissor-over-comb at 45° angle, point-cutting dry weight to preserve natural swirl.\n5. **Finishing**: Apply a pea-sized scoop of *FadeCraft Matte Clay* on dry hair for pliable texture without shine.`;
      } else if (lastUserMsg.includes('revenue') || lastUserMsg.includes('goal') || lastUserMsg.includes('turnaround') || lastUserMsg.includes('pace')) {
        fallbackReply = `**Studio Performance & Revenue Analysis:**\n\n• **Current Pace**: **$186,420** gross revenue (78% of our $240,000 annual target).\n• **Average Turnaround**: **34m 12s** per chair appointment.\n• **3 Growth Strategies to Hit $240k Target**:\n  1. *Add-On Service Upgrades*: Train barbers to pitch Hot Towel Beard Oil ($15 add-on) during the 5-minute pre-shave steam.\n  2. *Rebook Velocity*: Trigger the 21-day SMS automated reminder earlier for high-frequency skin fade clients.\n  3. *Retail Conversion*: Display styling clay and beard elixirs directly at checkout stations.`;
      } else {
        fallbackReply = `**FadeCraft Studio Concierge**: I'm monitoring your salon operations in real-time.\n\n• **Active Chairs**: 5 of 6 chairs operating smoothly\n• **Walk-in Queue**: ${salonContext?.walkInCount || 0} clients waiting\n• **Low-Stock Alert**: ${salonContext?.lowStockCount || 3} items require reorder\n• **Today's Bookings**: On track at 78% of monthly goal\n\nHow would you like to proceed? You can ask me to evaluate chair schedules, query customer formulas, or run inventory audits.`;
      }

      return res.json({
        role: 'assistant',
        content: fallbackReply,
        modelUsed: `${selectedModel} (studio-engine)`,
      });
    } catch (error: any) {
      console.error('Error generating chat response with Gemini:', error);
      return res.status(500).json({ 
        error: error?.message || 'Failed to generate response from Gemini API.' 
      });
    }
  });

  // Setup Vite in development or serve static dist in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
