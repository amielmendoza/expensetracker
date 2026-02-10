export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Accounts: {
        Row: {
          id: string;
          name: string;
          type: number;
          icon: string;
          color: string;
          balance: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: number;
          icon: string;
          color: string;
          balance?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: number;
          icon?: string;
          color?: string;
          balance?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      Categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          is_default: boolean;
          parent_category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color: string;
          is_default?: boolean;
          parent_category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string;
          is_default?: boolean;
          parent_category_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      Expenses: {
        Row: {
          id: string;
          amount: number;
          description: string;
          category_id: string;
          date: string;
          payment_method: number;
          account_id: string | null;
          tags: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          description: string;
          category_id: string;
          date: string;
          payment_method: number;
          account_id?: string | null;
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          description?: string;
          category_id?: string;
          date?: string;
          payment_method?: number;
          account_id?: string | null;
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Expenses_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "Categories";
            referencedColumns: ["id"];
          }
        ];
      };
      Budgets: {
        Row: {
          id: string;
          category_id: string | null;
          amount: number;
          period: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          amount: number;
          period: number;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          amount?: number;
          period?: number;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Budgets_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "Categories";
            referencedColumns: ["id"];
          }
        ];
      };
      RecurringExpenses: {
        Row: {
          id: string;
          description: string;
          amount: number;
          category_id: string;
          frequency: number;
          next_due_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          amount: number;
          category_id: string;
          frequency: number;
          next_due_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          amount?: number;
          category_id?: string;
          frequency?: number;
          next_due_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "RecurringExpenses_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "Categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
