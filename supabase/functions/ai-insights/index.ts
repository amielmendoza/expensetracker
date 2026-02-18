import { getUserFromRequest, corsHeaders, errorResponse, jsonResponse } from '../_shared/auth.ts';
import { callClaude, parseJSON } from '../_shared/claude.ts';
import { getUserContext } from '../_shared/data.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    const { userId, supabase } = await getUserFromRequest(req);
    const body = await req.json();
    const refresh = body.refresh === true;

    // Check cache (6-hour TTL) unless refresh forced
    if (!refresh) {
      const { data: cached } = await supabase
        .from('ai_insights_cache')
        .select('insights, generated_at')
        .eq('user_id', userId)
        .single();

      if (cached) {
        const age = Date.now() - new Date(cached.generated_at).getTime();
        const sixHours = 6 * 60 * 60 * 1000;
        if (age < sixHours) {
          return jsonResponse(cached.insights);
        }
      }
    }

    // Build user context
    const context = await getUserContext(supabase, 3);
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Pre-compute anomaly data server-side
    const currentMonth = context.monthlySummary[0];
    const previousMonths = context.monthlySummary.slice(1);

    const avgMonthlyExpense = previousMonths.length > 0
      ? previousMonths.reduce((s, m) => s + m.totalExpenses, 0) / previousMonths.length
      : currentMonth?.totalExpenses || 0;

    const avgMonthlyIncome = previousMonths.length > 0
      ? previousMonths.reduce((s, m) => s + m.totalIncome, 0) / previousMonths.length
      : currentMonth?.totalIncome || 0;

    const projectedExpenses = currentMonth
      ? Math.round((currentMonth.totalExpenses / dayOfMonth) * daysInMonth)
      : 0;

    const anomalyData = {
      currentMonth: currentMonth || { month: '', totalExpenses: 0, totalIncome: 0, topCategories: [] },
      previousMonths,
      avgMonthlyExpense: Math.round(avgMonthlyExpense),
      avgMonthlyIncome: Math.round(avgMonthlyIncome),
      projectedExpenses,
      dayOfMonth,
      daysInMonth,
      daysRemaining: daysInMonth - dayOfMonth,
      recurringExpenses: context.recurringExpenses,
      accounts: context.accounts,
    };

    const contextSummary = JSON.stringify(anomalyData, null, 0);

    const response = await callClaude({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: `You are a financial analyst for a Filipino expense tracker. Analyze spending data and provide insights.
Currency is PHP (₱). Format amounts as ₱XX,XXX.

Given the user's financial data, return ONLY valid JSON:
{
  "anomalies": [
    {
      "type": "spike" | "unusual_transaction" | "pace_warning",
      "message": "human-readable alert",
      "severity": "info" | "warning" | "critical",
      "categoryName": "optional category"
    }
  ],
  "predictions": {
    "projectedMonthEnd": number,
    "projectedSavings": number,
    "projectedSavingsRate": number (0-100),
    "message": "one-sentence forecast"
  },
  "tips": ["actionable tip 1", "tip 2", "tip 3"]
}

Rules:
- Max 4 anomalies, ordered by severity (critical first)
- Max 3 tips, specific to their data (reference actual categories/amounts)
- If spending is on track, use "info" severity with positive message
- Compare current month pace against previous months' averages
- Be concise and encouraging, not alarming`,
      messages: [{ role: 'user', content: contextSummary }],
    });

    const insights = parseJSON<any>(response);
    insights.generatedAt = now.toISOString();

    // Cache the result (upsert)
    await supabase
      .from('ai_insights_cache')
      .upsert({
        user_id: userId,
        insights,
        generated_at: now.toISOString(),
      });

    return jsonResponse(insights);
  } catch (err: any) {
    console.error('ai-insights error:', err);
    if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse(err.message || 'Internal error', 500);
  }
});
