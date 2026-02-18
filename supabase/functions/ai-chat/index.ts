import { getUserFromRequest, corsHeaders, errorResponse } from '../_shared/auth.ts';
import { streamClaude } from '../_shared/claude.ts';
import { getUserContext } from '../_shared/data.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    const { supabase } = await getUserFromRequest(req);
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse('Messages array required', 400);
    }

    // Limit conversation history to last 10 messages
    const recentMessages = messages.slice(-10);

    // Build user context
    const context = await getUserContext(supabase, 3);
    const contextStr = JSON.stringify({
      monthlySummary: context.monthlySummary,
      recentExpenses: context.recentExpenses,
      recurringExpenses: context.recurringExpenses,
      accounts: context.accounts,
      averages: context.averages,
    }, null, 0);

    const systemPrompt = `You are a helpful personal finance assistant for a Filipino user tracking expenses in PHP (₱).
Use ₱ symbol and Philippine context (GCash, Maya, Jollibee, Grab, etc.).

Here is the user's financial data:
---
${contextStr}
---

Rules:
- Answer questions about their spending with specific numbers from the data above.
- Give actionable, personalized tips based on their actual patterns.
- Be concise but warm. Use bullet points for lists.
- If asked about data you don't have, say so honestly.
- Format currency as ₱XX,XXX.XX
- Never fabricate data points. Only reference what's in the context above.
- Keep responses under 300 words.`;

    // Stream the response
    const stream = await streamClaude({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 600,
      system: systemPrompt,
      messages: recentMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('ai-chat error:', err);
    if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse(err.message || 'Internal error', 500);
  }
});
