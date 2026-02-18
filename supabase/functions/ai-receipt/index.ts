import { getUserFromRequest, corsHeaders, errorResponse, jsonResponse } from '../_shared/auth.ts';
import { callClaude, parseJSON } from '../_shared/claude.ts';
import { getUserCategories } from '../_shared/data.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    const { supabase } = await getUserFromRequest(req);
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return errorResponse('No image provided', 400);
    }

    // Validate base64 size (~5MB max after encoding)
    if (image.length > 7_000_000) {
      return errorResponse('Image too large. Max 5MB.', 400);
    }

    const categories = await getUserCategories(supabase);
    const categoryList = categories
      .filter((c) => c.type === 0 || c.type === 2)
      .map((c) => `${c.id}: ${c.name}`)
      .join('\n');

    const today = new Date().toISOString().split('T')[0];

    const response = await callClaude({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      system: `You are a receipt parser for a Philippine expense tracker. Extract data from the receipt image.
Currency is PHP (₱). Today is ${today}. If the year is not visible, assume 2026.

User's expense categories:
${categoryList}

Return ONLY valid JSON:
{
  "merchant": "store/restaurant name",
  "items": [{"name": "item", "amount": 0.00}],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "date": "YYYY-MM-DD" or null,
  "suggestedCategory": "category name",
  "suggestedCategoryId": "category id" or null,
  "confidence": 0.0-1.0
}`,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: image },
          },
          { type: 'text', text: 'Parse this receipt and extract the structured data.' },
        ],
      }],
    });

    const result = parseJSON(response);
    return jsonResponse(result);
  } catch (err: any) {
    console.error('ai-receipt error:', err);
    if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse(err.message || 'Internal error', 500);
  }
});
