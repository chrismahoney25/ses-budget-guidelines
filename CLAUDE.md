# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server
npm run dev

# Build the application
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint
```

## Application Architecture

This is a Next.js application for budget planning for self-employed stylists, built with React 19, TypeScript, and Tailwind CSS.

### Core Architecture

- **Next.js 15** with App Router
- **React 19** with client-side state management
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling

### Directory Structure

```
app/
├── components/           # Reusable UI components
│   ├── UI.tsx           # Core UI components (Input, Table, Card, etc.)
│   └── AppHeader.tsx    # Application header
├── data.json            # Budget configuration data
├── layout.tsx           # Root layout with fonts and styling
├── page.tsx             # Main budget calculator page
└── globals.css          # Global styles and Tailwind setup

lib/
├── calc.ts              # Budget calculation logic
└── types.ts             # TypeScript type definitions
```

### Key Concepts

**Budget Calculation Modes:**
- **Income-based**: User enters Services, Tips, and Retail amounts; expenses calculated as percentages
- **Rent-based**: User enters monthly rent; total income derived (rent = 9% of income), then income/expenses calculated

**Data Configuration:**
- All budget percentages and line items are defined in `app/data.json`
- Values are stored as percentages of total income (0-1 range)
- Three categories: income, direct_expenses, indirect_expenses

**Calculation Logic:**
- Base calculations are weekly
- Period scaling: weekly → monthly (×52/12) → annual (×52)
- All amounts are currency-rounded to 2 decimal places
- Located in `lib/calc.ts` with functions: `buildFromIncomeInputs`, `buildFromRent`, `scaleBudget`

**UI Components:**
- Custom component library in `app/components/UI.tsx`
- Styled with Tailwind CSS classes
- Dark mode support throughout
- Responsive design (mobile-first)

### Typography & Styling

- **Fonts**: Poppins (primary), Montserrat (display)
- **CSS**: Tailwind v4 with PostCSS
- **Theme**: Light/dark mode support with custom gradient background
- **Layout**: Responsive grid system, mobile-friendly

### State Management

React state with hooks for:
- Budget mode (income vs rent)
- Input values (services, tips, retail, rent)
- Time period selection (weekly, monthly, annual)
- Real-time budget calculations via `useMemo`

### Type Safety

Strong TypeScript implementation:
- `BudgetData`: Configuration structure from data.json
- `CalculatedBudget`: Computed budget results
- `IncomeInputs`: User input values
- `Period`: Time period enumeration