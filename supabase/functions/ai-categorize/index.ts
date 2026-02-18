import { getUserFromRequest, corsHeaders, errorResponse, jsonResponse } from '../_shared/auth.ts';
import { callClaude, parseJSON } from '../_shared/claude.ts';
import { getUserCategories, getCategorizationHistory } from '../_shared/data.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    const { supabase } = await getUserFromRequest(req);
    const body = await req.json();
    const { mode } = body;

    const [categories, history] = await Promise.all([
      getUserCategories(supabase),
      getCategorizationHistory(supabase),
    ]);

    if (mode === 'suggest') {
      const { description } = body;
      if (!description || description.trim().length < 2) {
        return errorResponse('Description too short', 400);
      }

      const descLower = description.toLowerCase().trim();

      // Try local matching first (no AI call needed)
      const localMatch = history.find((h) => {
        const hDesc = h.description.toLowerCase();
        return hDesc === descLower || descLower.includes(hDesc) || hDesc.includes(descLower);
      });

      if (localMatch) {
        return jsonResponse({
          categoryId: localMatch.categoryId,
          categoryName: localMatch.categoryName,
          confidence: 0.9,
        });
      }

      // Fall back to Claude Haiku
      const categoryList = categories
        .filter((c) => c.type === 0 || c.type === 2) // Expense or Both
        .map((c) => `${c.id}: ${c.name}`)
        .join('\n');

      const patternExamples = history
        .slice(0, 20)
        .map((h) => `"${h.description}" → ${h.categoryName}`)
        .join('\n');

      const response = await callClaude({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: `You are a Philippine expense categorizer. Given a description, return the best matching category.

Available categories:
${categoryList}

User's past patterns:
${patternExamples}

Return ONLY valid JSON: {"categoryId": "...", "categoryName": "...", "confidence": 0.0-1.0}`,
        messages: [{ role: 'user', content: description }],
      });

      const result = parseJSON<{ categoryId: string; categoryName: string; confidence: number }>(response);
      return jsonResponse(result);

    } else if (mode === 'parse') {
      const { text } = body;
      if (!text || text.trim().length < 3) {
        return errorResponse('Text too short', 400);
      }

      const categoryList = categories
        .filter((c) => c.type === 0 || c.type === 2)
        .map((c) => `${c.id}: ${c.name}`)
        .join('\n');

      // Fetch accounts for matching
      const { data: accounts } = await supabase.from('Accounts').select('id, name, type');

      const accountList = (accounts || []).map((a: any) => `${a.id}: ${a.name}`).join('\n');

      const today = new Date().toISOString().split('T')[0];

      const response = await callClaude({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: `You parse natural language expense entries for a Philippine user. Extract structured data.
Currency is PHP (₱). Today is ${today}.

Categories:
${categoryList}

Accounts:
${accountList}

Payment methods: 0=Cash, 1=Card, 2=DigitalWallet, 3=BankTransfer

Parse the text and return ONLY valid JSON:
{
  "amount": number or null,
  "description": "cleaned description",
  "categoryId": "matched id" or null,
  "categoryName": "matched name" or null,
  "date": "YYYY-MM-DD" or null,
  "paymentMethod": number or null,
  "accountId": "matched id" or null,
  "accountName": "matched name" or null,
  "confidence": 0.0-1.0
}`,
        messages: [{ role: 'user', content: text }],
      });

      const result = parseJSON(response);
      return jsonResponse(result);
    }

    return errorResponse('Invalid mode. Use "suggest" or "parse".', 400);
  } catch (err: any) {
    console.error('ai-categorize error:', err);
    if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse(err.message || 'Internal error', 500);
  }
});
