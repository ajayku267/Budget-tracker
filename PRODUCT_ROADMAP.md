# MoneyGrow Product Roadmap

**Vision:** Make MoneyGrow a world-class, privacy-first expense tracker that helps people understand their money and decide what to do next.

**Product promise:** Fast everyday tracking, trustworthy financial insights, and user-owned data.

## Product principles

1. **Local-first by default.** Financial records stay on the device. No account or cloud sync required.
2. **Explicit consent.** Payment-notification import is optional and clearly explained. Never request SMS or Accessibility access for transaction capture.
3. **Accuracy before cleverness.** Show source and confidence, prevent duplicates, allow review and undo, and never present estimates as facts.
4. **Useful without a subscription.** Core manual tracking, budgets, and data export remain available in the free app.
5. **Global by design.** Support currencies, dates, number formats, accessibility, and localization without sacrificing simplicity.

## Phase 1 — Trust and reliability (Weeks 1–3)

- [ ] Audit transaction, balance, budget, savings-rate, and date-boundary calculations.
- [ ] Add tests for core calculations, month/year transitions, empty data, and invalid inputs.
- [ ] Improve payment-notification parsing with conservative matching and clear failure handling.
- [ ] Label transactions as manual or notification-imported.
- [ ] Add a review path for uncertain imports; make correction and deletion easy.
- [ ] Detect likely duplicates without silently deleting legitimate repeated payments.
- [x] Add manual transfers between named accounts; exclude them from income, expense, budget, and insight totals.
- [ ] Add transaction notes and reliable timestamps. (Machine-readable timestamps are stored; user-editable notes remain.)
- [x] Implement local backup and restore with validation and clear overwrite warnings. (Backups are plain JSON, not encrypted.)
- [ ] Verify database migrations and preserve existing user data.

**Exit criteria:** No known calculation regressions; backup/restore verified; imports are reviewable; no new sensitive permissions.

## Phase 2 — Everyday money companion (Weeks 4–6)

- [ ] Per-category budgets with configurable warning thresholds.
- [ ] Recurring bills, subscriptions, and salary reminders.
- [ ] Savings goals with progress and target dates.
- [ ] Month-over-month comparisons and category drill-downs.
- [ ] CSV import with column mapping, preview, validation, and duplicate checks.
- [ ] Quick-add flow and home-screen widget where practical.
- [ ] Clear empty states and accessible UI states.

**Exit criteria:** Common tasks are quick, imported data is previewed before saving, and users can understand and change every automated result.

## Phase 3 — Explainable intelligence (Weeks 7–10)

- [ ] Unusual-spending insights based on the user's own history and a minimum-data threshold.
- [ ] Cash-flow forecast with assumptions and uncertainty clearly shown.
- [ ] Optional on-device category suggestions that users can correct or undo.
- [ ] Monthly review with a few specific, actionable observations.
- [ ] Financial overview covering cash flow, budgets, goals, and recurring commitments.
- [ ] Avoid opaque or shaming financial-health scores.

**Exit criteria:** Every insight explains what data supports it; no fabricated certainty; user can dismiss or correct suggestions.

## Phase 4 — Global readiness (Weeks 11–16)

- [ ] Multi-currency transactions with explicit currency codes and safe conversion rules.
- [ ] Locale-aware dates, numbers, currency formatting, and time zones.
- [ ] Translation-ready strings and accessibility review.
- [ ] Country-by-country research into payment rails and lawful bank-data integrations.
- [ ] Consider optional encrypted sync only after a documented threat model, key recovery plan, and clear opt-in.
- [ ] Consider a web companion only after the Android experience is stable.

**Exit criteria:** Currency and locale handling are tested; no region-specific bank integration is presented as universal.

## UX direction

- A calm, premium, modern interface with strong hierarchy and minimal clutter.
- **Home:** available overview, this month's spending, budget progress, and next useful action.
- **Transactions:** search, filters, source labels, and a review queue for imported items.
- **Insights:** spending trends, category breakdowns, and period comparisons.
- **Goals & budgets:** progress, upcoming commitments, and clear thresholds.
- Keep dark/light themes, readable contrast, large touch targets, and useful empty/error states.

## Technical foundation

- Use versioned database migrations and preserve existing installations.
- Model accounts, transfers, categories, currency codes, transaction source, and timestamps explicitly.
- Keep calculations in testable units separate from UI rendering.
- Validate CSV input and backups before changing the database.
- Avoid logging financial details or raw notification contents.
- Keep notification access optional and explain that it can see notifications and may miss or misread some payment alerts. Never claim it imports historical transactions.
- Add automated build and test checks; manually verify on a physical Android device before calling a release production-ready.

## Sustainable business model

- Free: manual transactions, core budgets, search, basic insights, and export/backup.
- Optional Plus later: advanced reports, multiple savings goals, richer imports, and forecasting.
- Family features only after secure sharing is designed and tested.
- No selling financial data; avoid intrusive ads.

## Success metrics to validate with beta users

These are proposed targets, not current performance claims:

- At least 80% of new users complete setup and record a first transaction.
- Duplicate imported transactions approach zero.
- Fewer than 5% of imported transactions need correction after parser tuning.
- At least 99.5% crash-free sessions before broad release.
- At least 95% successful backup/restore in tested scenarios.
- Track week-1 and week-4 retention, task completion time, and user-reported trust.

## First 30 days

- **Week 1:** audit data model and calculations; identify high-risk bugs; get feedback from a small set of users.
- **Week 2:** implement reliability fixes, transfers, and local backup/restore.
- **Week 3:** improve budget/recurring flows and add automated tests.
- **Week 4:** run a small beta, fix the highest-impact issues, and prepare privacy/store materials.

## Release rule

Ship in small, testable increments. A successful CI build is necessary but not sufficient: verify migrations, calculations, notification import, backup/restore, and UI behavior on a real device before recommending a public release.
