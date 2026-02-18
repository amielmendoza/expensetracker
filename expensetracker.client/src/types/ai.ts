export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
}

export interface ParsedExpense {
  amount: number | null;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  date: string | null;
  paymentMethod: number | null;
  accountId: string | null;
  accountName: string | null;
  confidence: number;
}

export interface ReceiptItem {
  name: string;
  amount: number;
}

export interface ReceiptScanResult {
  merchant: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string | null;
  suggestedCategory: string;
  suggestedCategoryId: string | null;
  confidence: number;
}

export interface SpendingAnomaly {
  type: 'spike' | 'unusual_transaction' | 'pace_warning';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  categoryId?: string;
  categoryName?: string;
}

export interface SpendingPrediction {
  projectedMonthEnd: number;
  projectedSavings: number;
  projectedSavingsRate: number;
  message: string;
}

export interface SpendingInsights {
  anomalies: SpendingAnomaly[];
  predictions: SpendingPrediction;
  tips: string[];
  generatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
