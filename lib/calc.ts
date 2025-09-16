import type { BudgetData, CalculatedBudget, IncomeInputs } from "./types";

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function buildFromIncomeInputs(data: BudgetData, inputs: IncomeInputs): CalculatedBudget {
  const totalIncome = inputs.services + inputs.tips + inputs.retail;
  const servicesAndTips = inputs.services + inputs.tips;

  const incomeByName: Record<string, number> = {
    Services: inputs.services,
    Tips: inputs.tips,
    Retail: inputs.retail,
  };

  const incomeLines = data.income.map((line) => {
    const amount = incomeByName[line.line_item] ?? 0;
    const percent = totalIncome > 0 ? amount / totalIncome : 0;
    return { name: line.line_item, amount: roundCurrency(amount), percent };
  });

  // Direct expenses with overrides based on source amounts for certain lines
  const directExpenses = data.direct_expenses.map((line) => {
    let amount = 0;
    let baseAmount = servicesAndTips;
    let baseLabel = "Services + Tips";

    if (line.line_item === "Professional Supplies - Backbar") {
      baseAmount = inputs.services;
      baseLabel = "Services";
      amount = baseAmount * 0.15; // 15% of Services
    } else if (line.line_item === "Retail Cost of Goods Sold") {
      baseAmount = inputs.retail;
      baseLabel = "Retail";
      amount = baseAmount * 0.5; // 50% of Retail
    } else {
      // All other direct expenses are based on Services + Tips only
      amount = baseAmount * line.percent_of_income;
    }

    const rounded = roundCurrency(amount);
    const percentOfBase = baseAmount > 0 ? rounded / baseAmount : 0;
    return { name: line.line_item, amount: rounded, percent: percentOfBase, baseLabel };
  });

  const indirectExpenses = data.indirect_expenses.map((line) => {
    // Indirect expenses are based on Services + Tips, except Bank Charges & Merchant Fees which are based on Total Income (Services + Tips + Retail)
    const isBankFees = line.line_item === "Bank Charges & Merchant Fees";
    const baseAmount = isBankFees ? totalIncome : servicesAndTips;
    const baseLabel = isBankFees ? "Services + Tips + Retail" : "Services + Tips";
    const amount = baseAmount * line.percent_of_income;
    const rounded = roundCurrency(amount);
    const percentOfBase = baseAmount > 0 ? rounded / baseAmount : 0;
    return { name: line.line_item, amount: rounded, percent: percentOfBase, baseLabel };
  });

  const totalsDirect = sum(directExpenses.map((x) => x.amount));
  const totalsIndirect = sum(indirectExpenses.map((x) => x.amount));
  const totalExpenses = roundCurrency(totalsDirect + totalsIndirect);
  const netIncome = roundCurrency(totalIncome - totalExpenses);

  return {
    totalIncome: roundCurrency(totalIncome),
    incomeLines,
    directExpenses,
    indirectExpenses,
    totals: {
      directExpenses: roundCurrency(totalsDirect),
      indirectExpenses: roundCurrency(totalsIndirect),
      totalExpenses,
      netIncome,
    },
  };
}

export function buildFromRent(data: BudgetData, monthlyRentAmount: number): CalculatedBudget {
  // Rent Expense percent is given in data.indirect_expenses as 0.09
  const rentPercent = data.indirect_expenses.find((x) => x.line_item === "Rent Expense")?.percent_of_income ?? 0.09;
  if (rentPercent <= 0) {
    throw new Error("Rent percent not found or invalid");
  }

  const totalIncome = monthlyRentAmount / rentPercent;

  // Split income based on provided percentages in data.income
  const incomeLines = data.income.map((line) => {
    const amount = totalIncome * line.percent_of_income;
    return { name: line.line_item, amount: roundCurrency(amount), percent: line.percent_of_income };
  });

  // Determine services, tips, and retail amounts from income distribution
  const servicesPercent = data.income.find((l) => l.line_item === "Services")?.percent_of_income ?? 0;
  const tipsPercent = data.income.find((l) => l.line_item === "Tips")?.percent_of_income ?? 0;
  const retailPercent = data.income.find((l) => l.line_item === "Retail")?.percent_of_income ?? 0;
  const servicesAmount = totalIncome * servicesPercent;
  const tipsAmount = totalIncome * tipsPercent;
  const servicesAndTips = servicesAmount + tipsAmount;
  const retailAmount = totalIncome * retailPercent;

  const directExpenses = data.direct_expenses.map((line) => {
    let amount = 0;
    let baseAmount = servicesAndTips;
    let baseLabel = "Services + Tips";

    if (line.line_item === "Professional Supplies - Backbar") {
      baseAmount = servicesAmount;
      baseLabel = "Services";
      amount = baseAmount * 0.15; // 15% of Services
    } else if (line.line_item === "Retail Cost of Goods Sold") {
      baseAmount = retailAmount;
      baseLabel = "Retail";
      amount = baseAmount * 0.5; // 50% of Retail
    } else {
      // All other direct expenses are based on Services + Tips only
      amount = baseAmount * line.percent_of_income;
    }

    const rounded = roundCurrency(amount);
    const percentOfBase = baseAmount > 0 ? rounded / baseAmount : 0;
    return { name: line.line_item, amount: rounded, percent: percentOfBase, baseLabel };
  });

  const indirectExpenses = data.indirect_expenses.map((line) => {
    // Indirect expenses are based on Services + Tips, except Bank Charges & Merchant Fees which are based on Total Income (Services + Tips + Retail)
    const isBankFees = line.line_item === "Bank Charges & Merchant Fees";
    const baseAmount = isBankFees ? totalIncome : servicesAndTips;
    const baseLabel = isBankFees ? "Services + Tips + Retail" : "Services + Tips";
    const amount = baseAmount * line.percent_of_income;
    const rounded = roundCurrency(amount);
    const percentOfBase = baseAmount > 0 ? rounded / baseAmount : 0;
    return { name: line.line_item, amount: rounded, percent: percentOfBase, baseLabel };
  });

  const totalsDirect = sum(directExpenses.map((x) => x.amount));
  const totalsIndirect = sum(indirectExpenses.map((x) => x.amount));
  const totalExpenses = roundCurrency(totalsDirect + totalsIndirect);
  const netIncome = roundCurrency(totalIncome - totalExpenses);

  return {
    totalIncome: roundCurrency(totalIncome),
    incomeLines,
    directExpenses,
    indirectExpenses,
    totals: {
      directExpenses: roundCurrency(totalsDirect),
      indirectExpenses: roundCurrency(totalsIndirect),
      totalExpenses,
      netIncome,
    },
  };
}

export type Period = "weekly" | "monthly" | "annual";

export function getPeriodFactor(period: Period): number {
  // Base inputs are weekly. Convert weekly -> desired period.
  switch (period) {
    case "weekly":
      return 1;
    case "monthly":
      return 52 / 12; // average weeks per month
    case "annual":
      return 52; // weeks per year
    default:
      return 1;
  }
}

export function scaleBudget(budget: CalculatedBudget, factor: number): CalculatedBudget {
  const scale = (n: number) => roundCurrency(n * factor);
  return {
    totalIncome: scale(budget.totalIncome),
    incomeLines: budget.incomeLines.map((x) => ({ ...x, amount: scale(x.amount) })),
    directExpenses: budget.directExpenses.map((x) => ({ ...x, amount: scale(x.amount) })),
    indirectExpenses: budget.indirectExpenses.map((x) => ({ ...x, amount: scale(x.amount) })),
    totals: {
      directExpenses: scale(budget.totals.directExpenses),
      indirectExpenses: scale(budget.totals.indirectExpenses),
      totalExpenses: scale(budget.totals.totalExpenses),
      netIncome: scale(budget.totals.netIncome),
    },
  };
}


