export type BudgetLine = {
  category: string;
  line_item: string;
  percent_of_income: number; // 0..1 of total income
};

export type BudgetData = {
  income: BudgetLine[];
  direct_expenses: BudgetLine[];
  indirect_expenses: BudgetLine[];
};

export type IncomeInputs = {
  services: number;
  tips: number;
  retail: number;
};

export type CalculatedBudget = {
  totalIncome: number;
  incomeLines: Array<{ name: string; amount: number; percent: number }>;
  directExpenses: Array<{ name: string; amount: number; percent: number }>;
  indirectExpenses: Array<{ name: string; amount: number; percent: number }>;
  totals: {
    directExpenses: number;
    indirectExpenses: number;
    totalExpenses: number;
    netIncome: number;
  };
};


