export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_id: string
          bank: string | null
          created_at: string | null
          currency: string | null
          current_balance: number | null
          entity_id: string
          is_active: boolean | null
          name: string
          opening_balance: number | null
          type: string
        }
        Insert: {
          account_id?: string
          bank?: string | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          entity_id: string
          is_active?: boolean | null
          name: string
          opening_balance?: number | null
          type: string
        }
        Update: {
          account_id?: string
          bank?: string | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          entity_id?: string
          is_active?: boolean | null
          name?: string
          opening_balance?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      categories: {
        Row: {
          category_id: string
          color_hex: string | null
          icon: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          type: string
        }
        Insert: {
          category_id?: string
          color_hex?: string | null
          icon?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          type: string
        }
        Update: {
          category_id?: string
          color_hex?: string | null
          icon?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          bank: string | null
          card_id: string
          closing_day: number | null
          color_hex: string | null
          created_at: string | null
          due_day: number | null
          entity_id: string
          is_active: boolean | null
          limit_total: number | null
          name: string
          network: string | null
        }
        Insert: {
          bank?: string | null
          card_id?: string
          closing_day?: number | null
          color_hex?: string | null
          created_at?: string | null
          due_day?: number | null
          entity_id: string
          is_active?: boolean | null
          limit_total?: number | null
          name: string
          network?: string | null
        }
        Update: {
          bank?: string | null
          card_id?: string
          closing_day?: number | null
          color_hex?: string | null
          created_at?: string | null
          due_day?: number | null
          entity_id?: string
          is_active?: boolean | null
          limit_total?: number | null
          name?: string
          network?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string
          is_active: boolean | null
          name: string
          tax_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id?: string
          is_active?: boolean | null
          name: string
          tax_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string
          is_active?: boolean | null
          name?: string
          tax_id?: string | null
          type?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          card_id: string | null
          category_id: string | null
          created_at: string | null
          description: string
          entity_id: string
          installment_amount: number
          installment_id: string
          remaining_installments: number
          start_date: string
          status: string | null
          total_amount: number
          total_installments: number
        }
        Insert: {
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          entity_id: string
          installment_amount: number
          installment_id?: string
          remaining_installments: number
          start_date: string
          status?: string | null
          total_amount: number
          total_installments: number
        }
        Update: {
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          entity_id?: string
          installment_amount?: number
          installment_id?: string
          remaining_installments?: number
          start_date?: string
          status?: string | null
          total_amount?: number
          total_installments?: number
        }
        Relationships: [
          {
            foreignKeyName: "installments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "installments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "installments_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      invoices: {
        Row: {
          card_id: string
          created_at: string | null
          cycle_end: string
          cycle_start: string
          due_date: string
          entity_id: string
          invoice_id: string
          payment_date: string | null
          reference_month: string
          status: string | null
          total_amount: number | null
        }
        Insert: {
          card_id: string
          created_at?: string | null
          cycle_end: string
          cycle_start: string
          due_date: string
          entity_id: string
          invoice_id?: string
          payment_date?: string | null
          reference_month: string
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          card_id?: string
          created_at?: string | null
          cycle_end?: string
          cycle_start?: string
          due_date?: string
          entity_id?: string
          invoice_id?: string
          payment_date?: string | null
          reference_month?: string
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "invoices_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      life_events: {
        Row: {
          category: string | null
          created_at: string | null
          entity_id: string
          event_id: string
          monthly_impact: number | null
          name: string
          scenario_id: string | null
          start_date: string | null
          status: string | null
          target_date: string | null
          total_cost: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          entity_id: string
          event_id?: string
          monthly_impact?: number | null
          name: string
          scenario_id?: string | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          total_cost?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          entity_id?: string
          event_id?: string
          monthly_impact?: number | null
          name?: string
          scenario_id?: string | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "life_events_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
          {
            foreignKeyName: "life_events_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      net_worth_snapshots: {
        Row: {
          created_at: string | null
          date: string
          entity_id: string
          net_worth: number
          notes: string | null
          snapshot_id: string
          total_assets: number
          total_liabilities: number
        }
        Insert: {
          created_at?: string | null
          date: string
          entity_id: string
          net_worth: number
          notes?: string | null
          snapshot_id?: string
          total_assets: number
          total_liabilities: number
        }
        Update: {
          created_at?: string | null
          date?: string
          entity_id?: string
          net_worth?: number
          notes?: string | null
          snapshot_id?: string
          total_assets?: number
          total_liabilities?: number
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_snapshots_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      purchase_decisions: {
        Row: {
          annual_return_rate: number | null
          available_income: number
          created_at: string | null
          decision: string | null
          decision_id: string
          entity_id: string
          impact_pct: number | null
          item_cost: number
          item_name: string
          months_fast: number | null
          months_moderate: number | null
          months_safe: number | null
          notes: string | null
          opp_cost_10y: number | null
          opp_cost_1y: number | null
          opp_cost_20y: number | null
          opp_cost_5y: number | null
          scenario_type: string | null
        }
        Insert: {
          annual_return_rate?: number | null
          available_income: number
          created_at?: string | null
          decision?: string | null
          decision_id?: string
          entity_id: string
          impact_pct?: number | null
          item_cost: number
          item_name: string
          months_fast?: number | null
          months_moderate?: number | null
          months_safe?: number | null
          notes?: string | null
          opp_cost_10y?: number | null
          opp_cost_1y?: number | null
          opp_cost_20y?: number | null
          opp_cost_5y?: number | null
          scenario_type?: string | null
        }
        Update: {
          annual_return_rate?: number | null
          available_income?: number
          created_at?: string | null
          decision?: string | null
          decision_id?: string
          entity_id?: string
          impact_pct?: number | null
          item_cost?: number
          item_name?: string
          months_fast?: number | null
          months_moderate?: number | null
          months_safe?: number | null
          notes?: string | null
          opp_cost_10y?: number | null
          opp_cost_1y?: number | null
          opp_cost_20y?: number | null
          opp_cost_5y?: number | null
          scenario_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_decisions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      recurrences: {
        Row: {
          account_id: string | null
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string | null
          description: string
          end_date: string | null
          entity_id: string
          frequency: string
          is_active: boolean | null
          recurrence_id: string
          start_date: string
          type: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          end_date?: string | null
          entity_id: string
          frequency: string
          is_active?: boolean | null
          recurrence_id?: string
          start_date: string
          type: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          end_date?: string | null
          entity_id?: string
          frequency?: string
          is_active?: boolean | null
          recurrence_id?: string
          start_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurrences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "recurrences_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "recurrences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "recurrences_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          balance: number | null
          created_at: string | null
          description: string | null
          entity_id: string
          goal_id: string
          icon: string | null
          name: string
          status: string | null
          target_amount: number
          target_date: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          description?: string | null
          entity_id: string
          goal_id?: string
          icon?: string | null
          name: string
          status?: string | null
          target_amount: number
          target_date?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          description?: string | null
          entity_id?: string
          goal_id?: string
          icon?: string | null
          name?: string
          status?: string | null
          target_amount?: number
          target_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      savings_transfers: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          direction: string
          entity_id: string
          from_account_id: string | null
          from_goal_id: string | null
          notes: string | null
          to_account_id: string | null
          to_goal_id: string | null
          transfer_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          direction: string
          entity_id: string
          from_account_id?: string | null
          from_goal_id?: string | null
          notes?: string | null
          to_account_id?: string | null
          to_goal_id?: string | null
          transfer_id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          direction?: string
          entity_id?: string
          from_account_id?: string | null
          from_goal_id?: string | null
          notes?: string | null
          to_account_id?: string | null
          to_goal_id?: string | null
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_transfers_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
          {
            foreignKeyName: "savings_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "savings_transfers_from_goal_id_fkey"
            columns: ["from_goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "savings_transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "savings_transfers_to_goal_id_fkey"
            columns: ["to_goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["goal_id"]
          },
        ]
      }
      scenario_changes: {
        Row: {
          amount: number | null
          category_id: string | null
          change_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          entity_id: string
          frequency: string | null
          impact_sign: string | null
          scenario_id: string
          start_date: string | null
          type: string
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          change_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          entity_id: string
          frequency?: string | null
          impact_sign?: string | null
          scenario_id: string
          start_date?: string | null
          type: string
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          change_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          entity_id?: string
          frequency?: string | null
          impact_sign?: string | null
          scenario_id?: string
          start_date?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_changes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "scenario_changes_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
          {
            foreignKeyName: "scenario_changes_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string
          name: string
          scenario_id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id: string
          name: string
          scenario_id?: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string
          name?: string
          scenario_id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          actual_amount: number | null
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          entity_id: string
          estimated_amount: number | null
          installment_id: string | null
          installment_num: number | null
          is_estimated: boolean | null
          is_installment: boolean | null
          is_recurring: boolean | null
          notes: string | null
          payment_date: string | null
          recurrence_id: string | null
          status: string
          transaction_id: string
          type: string
        }
        Insert: {
          account_id?: string | null
          actual_amount?: number | null
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          entity_id: string
          estimated_amount?: number | null
          installment_id?: string | null
          installment_num?: number | null
          is_estimated?: boolean | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          payment_date?: string | null
          recurrence_id?: string | null
          status?: string
          transaction_id?: string
          type: string
        }
        Update: {
          account_id?: string | null
          actual_amount?: number | null
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          entity_id?: string
          estimated_amount?: number | null
          installment_id?: string | null
          installment_num?: number | null
          is_estimated?: boolean | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          payment_date?: string | null
          recurrence_id?: string | null
          status?: string
          transaction_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
          {
            foreignKeyName: "transactions_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["installment_id"]
          },
          {
            foreignKeyName: "transactions_recurrence_id_fkey"
            columns: ["recurrence_id"]
            isOneToOne: false
            referencedRelation: "recurrences"
            referencedColumns: ["recurrence_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums\"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
