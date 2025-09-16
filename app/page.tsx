"use client";

import { useMemo, useState } from "react";
import { Field, Input, Tabs, Select } from "./components/UI";
import { AppHeader } from "./components/AppHeader";
import { buildFromIncomeInputs, buildFromRent, getPeriodFactor, scaleBudget, type Period } from "@/lib/calc";
import type { BudgetData } from "@/lib/types";
import raw from "./data.json";

const data = raw as unknown as BudgetData;

type PeriodKey = "weekly" | "monthly" | "annual";
const PERIODS: PeriodKey[] = ["weekly", "monthly", "annual"];

export default function Home() {
  const [mode, setMode] = useState<"income" | "rent">("income");
  const [services, setServices] = useState(0);
  const [tips, setTips] = useState(0);
  const [retail, setRetail] = useState(0);
  const [rent, setRent] = useState(0);
  const [mobilePeriod, setMobilePeriod] = useState<Period>("weekly");

  const { weekly, monthly, annual } = useMemo(() => {
    const base = mode === "income" ? buildFromIncomeInputs(data, { services, tips, retail }) : buildFromRent(data, rent);
    return {
      weekly: scaleBudget(base, getPeriodFactor("weekly")),
      monthly: scaleBudget(base, getPeriodFactor("monthly")),
      annual: scaleBudget(base, getPeriodFactor("annual")),
    };
  }, [mode, services, tips, retail, rent]);

  const periodResults = { weekly, monthly, annual } as const;

  function lineNames(category: "incomeLines" | "directExpenses" | "indirectExpenses") {
    return weekly[category].map((l) => l.name);
  }

  function getAmount(period: PeriodKey, category: "incomeLines" | "directExpenses" | "indirectExpenses", name: string) {
    const line = periodResults[period][category].find((l) => l.name === name);
    return line ? line.amount : 0;
  }

  function getPercent(period: PeriodKey, category: "incomeLines" | "directExpenses" | "indirectExpenses", name: string) {
    const line = periodResults[period][category].find((l) => l.name === name);
    return line ? (line.percent * 100) : 0;
  }

  function formatPercentOneDecimal(n: number) {
    return `${n.toFixed(1)}%`;
  }

  function formatCurrency(n: number) {
    return `$${n.toLocaleString()}`;
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="pt-16 pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Inputs card with mode toggle inside */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Inputs</h3>
            <Tabs
              value={mode}
              onChange={(v) => setMode(v as "income" | "rent")}
              options={[
                { value: "income", label: "By Income" },
                { value: "rent", label: "By Rent" },
              ]}
            />
          </div>

          {mode === "income" ? (
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Services (weekly)">
                <Input prefix="$" value={services} onChange={setServices} />
              </Field>
              <Field label="Tips (weekly)">
                <Input prefix="$" value={tips} onChange={setTips} />
              </Field>
              <Field label="Retail (weekly)">
                <Input prefix="$" value={retail} onChange={setRetail} />
              </Field>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Rent (weekly)">
                <Input prefix="$" value={rent} onChange={setRent} />
              </Field>
            </div>
          )}
        </div>

        {/* Budget Breakdown */}
        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white shadow">
          {/* Header with title and mobile dropdown right-aligned */}
          <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Budget</h3>
            <div className="lg:hidden">
              <Select
                className="h-9 px-3 py-1.5 text-sm rounded-lg border-slate-200"
                value={mobilePeriod}
                onChange={(v) => setMobilePeriod(v as Period)}
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" },
                ]}
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-teal-50)] text-sm">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-700">Category</th>
                    <th className="text-right px-5 py-3 font-medium text-slate-700"></th>
                    {PERIODS.map((p) => (
                      <th key={p} className="text-right px-5 py-3 font-medium text-slate-700 capitalize">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Income Section */}
                  <tr>
                    <td colSpan={5} className="px-5 pt-6 pb-2 text-[11px] uppercase tracking-wide text-slate-700">Income</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="h-[1px] bg-[var(--color-teal-100)]" />
                  </tr>
                  {lineNames("incomeLines").map((name) => (
                    <tr key={name} className="border-t border-slate-100 bg-[var(--color-teal-50)]/60">
                      <td className="px-5 py-2 max-w-[320px] pr-10 align-top">
                        <div className="whitespace-normal break-words leading-tight">{name}</div>
                      </td>
                      <td className="px-5 py-2 text-right text-[var(--color-teal-700)] font-medium">{formatPercentOneDecimal(getPercent("weekly", "incomeLines", name))}</td>
                      {PERIODS.map((p) => (
                        <td key={p} className="px-5 py-2 text-right tabular-nums">{formatCurrency(getAmount(p, "incomeLines", name))}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-[var(--color-teal-100)] bg-[var(--color-teal-50)]">
                    <td className="px-5 py-2 font-medium">Total Income</td>
                    <td className="px-5 py-2" />
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(weekly.totalIncome)}</td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(monthly.totalIncome)}</td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(annual.totalIncome)}</td>
                  </tr>

                  {/* Direct Expenses */}
                  <tr>
                    <td colSpan={5} className="px-5 pt-8 pb-2 text-[11px] uppercase tracking-wide text-slate-700">Direct expenses</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="h-[1px] bg-[var(--color-teal-100)]" />
                  </tr>
                  {lineNames("directExpenses").map((name) => {
                    const baseLabel = weekly.directExpenses.find((l) => l.name === name)?.baseLabel ?? "";
                    return (
                      <tr key={name} className="border-t border-slate-100 bg-white">
                        <td className="px-5 py-2 max-w-[320px] pr-10 align-top">
                          <div className="whitespace-normal break-words leading-tight">{name}</div>
                          {baseLabel ? (
                            <div className="text-[11px] text-slate-500 mt-0.5">% Based on: {baseLabel}</div>
                          ) : null}
                        </td>
                        <td className="px-5 py-2 text-right text-[var(--color-teal-700)] font-medium">{formatPercentOneDecimal(getPercent("weekly", "directExpenses", name))}</td>
                        {PERIODS.map((p) => (
                          <td key={p} className="px-5 py-2 text-right tabular-nums">{formatCurrency(getAmount(p, "directExpenses", name))}</td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="border-t bg-[var(--color-teal-50)]">
                    <td className="px-5 py-2 font-medium">Total Direct Expenses</td>
                    <td className="px-5 py-2" />
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(weekly.totals.directExpenses)}</td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(monthly.totals.directExpenses)}</td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(annual.totals.directExpenses)}</td>
                  </tr>

                  {/* Indirect Expenses */}
                  <tr>
                    <td colSpan={5} className="px-5 pt-8 pb-2 text-[11px] uppercase tracking-wide text-slate-700">Indirect expenses</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="h-[1px] bg-[var(--color-teal-100)]" />
                  </tr>
                  {lineNames("indirectExpenses").map((name) => {
                    const baseLabel = weekly.indirectExpenses.find((l) => l.name === name)?.baseLabel ?? "";
                    return (
                      <tr key={name} className="border-t border-slate-100 bg-white">
                        <td className="px-5 py-2 max-w-[320px] pr-10 align-top">
                          <div className="whitespace-normal break-words leading-tight">{name}</div>
                          {baseLabel ? (
                            <div className="text-[11px] text-slate-500 mt-0.5">% Based on: {baseLabel}</div>
                          ) : null}
                        </td>
                        <td className="px-5 py-2 text-right text-[var(--color-teal-700)] font-medium">{formatPercentOneDecimal(getPercent("weekly", "indirectExpenses", name))}</td>
                        {PERIODS.map((p) => (
                          <td key={p} className="px-5 py-2 text-right tabular-nums">{formatCurrency(getAmount(p, "indirectExpenses", name))}</td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="border-t bg-[var(--color-teal-50)]">
                    <td className="px-5 py-2 font-medium">Total Indirect Expenses</td>
                    <td className="px-5 py-2" />
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(weekly.totals.indirectExpenses)}</td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(monthly.totals.indirectExpenses)}</td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{formatCurrency(annual.totals.indirectExpenses)}</td>
                  </tr>

                  {/* Savings Bonus */}
                  <tr className="border-t-2 border-[var(--color-teal-100)] bg-[var(--color-teal-50)]">
                    <td className="px-5 py-3 font-semibold">Savings Bonus</td>
                    <td className="px-5 py-3" />
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatCurrency(weekly.totals.netIncome)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatCurrency(monthly.totals.netIncome)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatCurrency(annual.totals.netIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile list (single period) */}
          <div className="lg:hidden">
            <div className="p-5 text-sm">
              <div className="bg-[var(--color-teal-50)] rounded-lg p-3">
                <div className="text-xs uppercase tracking-wide text-slate-700 mb-2">Income</div>
                <div className="divide-y divide-[var(--color-teal-100)]">
                  {lineNames("incomeLines").map((name) => (
                    <div key={name} className="flex items-start justify-between py-2 gap-4">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="shrink-0 inline-flex items-center justify-center h-5 px-1.5 rounded bg-[var(--color-teal-50)] text-[var(--color-teal-700)] text-[11px] font-medium">
                          {formatPercentOneDecimal(getPercent(mobilePeriod as PeriodKey, "incomeLines", name))}
                        </span>
                        <div className="whitespace-normal break-words leading-tight">{name}</div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div>{formatCurrency(getAmount(mobilePeriod as PeriodKey, "incomeLines", name))}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 font-medium bg-white px-2 rounded">
                    <div>Total Income</div>
                    <div className="tabular-nums">{formatCurrency(periodResults[mobilePeriod as PeriodKey].totalIncome)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-teal-100)]">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-700 mb-2">Direct expenses</div>
                  <div className="divide-y divide-[var(--color-teal-100)]">
                    {lineNames("directExpenses").map((name) => (
                      <div key={name} className="flex items-start justify-between py-2 gap-4">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="shrink-0 inline-flex items-center justify-center h-5 px-1.5 rounded bg-[var(--color-teal-50)] text-[var(--color-teal-700)] text-[11px] font-medium">
                            {formatPercentOneDecimal(getPercent(mobilePeriod as PeriodKey, "directExpenses", name))}
                          </span>
                          <div className="whitespace-normal break-words leading-tight">
                            {name}
                            {(periodResults[mobilePeriod as PeriodKey].directExpenses.find((l) => l.name === name)?.baseLabel ?? "") ? (
                              <div className="text-[11px] text-slate-500 mt-0.5">% Based on: {periodResults[mobilePeriod as PeriodKey].directExpenses.find((l) => l.name === name)?.baseLabel}</div>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <div>{formatCurrency(getAmount(mobilePeriod as PeriodKey, "directExpenses", name))}</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 font-medium bg-[var(--color-teal-50)] px-2 rounded">
                      <div>Total Direct Expenses</div>
                      <div className="tabular-nums">{formatCurrency(periodResults[mobilePeriod as PeriodKey].totals.directExpenses)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-teal-100)]">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-700 mb-2">Indirect expenses</div>
                  <div className="divide-y divide-[var(--color-teal-100)]">
                    {lineNames("indirectExpenses").map((name) => (
                      <div key={name} className="flex items-start justify-between py-2 gap-4">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="shrink-0 inline-flex items-center justify-center h-5 px-1.5 rounded bg-[var(--color-teal-50)] text-[var(--color-teal-700)] text-[11px] font-medium">
                            {formatPercentOneDecimal(getPercent(mobilePeriod as PeriodKey, "indirectExpenses", name))}
                          </span>
                          <div className="whitespace-normal break-words leading-tight">
                            {name}
                            {(periodResults[mobilePeriod as PeriodKey].indirectExpenses.find((l) => l.name === name)?.baseLabel ?? "") ? (
                              <div className="text-[11px] text-slate-500 mt-0.5">% Based on: {periodResults[mobilePeriod as PeriodKey].indirectExpenses.find((l) => l.name === name)?.baseLabel}</div>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <div>{formatCurrency(getAmount(mobilePeriod as PeriodKey, "indirectExpenses", name))}</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 font-medium bg-[var(--color-teal-50)] px-2 rounded">
                      <div>Total Indirect Expenses</div>
                      <div className="tabular-nums">{formatCurrency(periodResults[mobilePeriod as PeriodKey].totals.indirectExpenses)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-[var(--color-teal-100)] flex items-center justify-between font-semibold">
                <div>Savings Bonus</div>
                <div className="tabular-nums">{formatCurrency(periodResults[mobilePeriod as PeriodKey].totals.netIncome)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Savings Bonus footer */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/60 bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-600">Savings Bonus</div>
            <div className="text-lg font-semibold tabular-nums">{formatCurrency(periodResults[mobilePeriod as PeriodKey].totals.netIncome)}</div>
          </div>
          <div className="hidden lg:block">
            <Select
              className="h-9 px-3 py-1.5 text-sm rounded-lg border-slate-200"
              value={mobilePeriod}
              onChange={(v) => setMobilePeriod(v as Period)}
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
