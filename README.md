## Stylist Budget Builder

A Next.js + Tailwind app to build a budget for a self-employed stylist using two flows:

- Income-based: enter Services, Tips, and Retail amounts; expenses are auto-calculated
- Rent-based: enter monthly Rent; total income is derived (Rent = 9% of income), then income and expenses are auto-calculated

### Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Data

Percentages and line items live in `app/data.json`. Values are treated as a percentage of total income (0..1). You can edit this file to tweak categories.

### Build & start

```bash
npm run build
npm start
```

### Notes

- Rent defaults to the percentage found in `app/data.json` for the `Rent Expense` line (currently 9%).
- The UI is responsive and mobile-friendly.
# ses-budget-guidelines
