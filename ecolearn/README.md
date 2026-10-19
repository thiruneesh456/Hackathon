# EcoLearn — Smart Sustainability Learning Platform

EcoLearn is a responsive React + TypeScript demo application for sustainability learning, student engagement, eco-challenges, SDG exploration, and illustrative college analytics.

## Features

- Student dashboard with points, streak, daily actions, and recommendations
- Six short sustainability learning modules
- Interactive six-question multiple-choice quiz with automatic scoring and explanations
- Rule-based recommendations driven by quiz results (no live AI service)
- Daily eco-challenges with points and duplicate-reward prevention per challenge per calendar day
- Activity history saved in browser LocalStorage
- Impact tracker that separates recorded actions from verified environmental outcomes
- SDG explorer for goals 4, 6, 7, 12, 13, 14, and 15
- College analytics with charts and clearly labelled synthetic demo data
- Fictional leaderboard intentionally omitted from the first MVP to prioritize the core experience
- Responsive desktop sidebar and mobile navigation
- Profile name editor and reset-demo-data control

## Requirements

- Node.js 18+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Data and transparency

- Student progress is stored in this browser using `localStorage`; it is not synced to a server.
- Initial points and streak are demo starter values.
- College analytics figures and trend charts are synthetic examples, not real institutional data.
- Quiz scoring and lesson recommendations are rule-based. No AI API is connected.
- Environmental outcomes are not converted into water or carbon savings because no verified measurement method or conversion assumptions are configured.
- Challenge completions are self-reported. They are not independent verification of environmental impact.

Use the reset icon in the desktop sidebar (or reset button in mobile navigation) to clear the demo state. The app also offers a reset confirmation.

## Deploy to GitHub Pages

This Vite project uses a relative base path (`base: "./"`) for compatibility with project pages.

1. Push the project files to your GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose **GitHub Actions** as the build and deployment source.
4. Add a workflow at `.github/workflows/deploy.yml` using the example below.
5. Push to the default branch and check the Actions tab.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy EcoLearn to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

If your repository uses a different default branch, update `branches: [main]`.

## Suggested hackathon demo

1. Open Overview and explain the learning gap.
2. Take the sustainability quiz and submit all six answers.
3. Show how quiz results feed rule-based recommendations.
4. Complete an eco-challenge and show the points and activity history update.
5. Open My impact to explain what is counted versus what is not verified.
6. Open College analytics and clearly state that those charts use synthetic demo data.

## Next steps for a production version

- Add authentication and institution-approved backend storage.
- Replace synthetic analytics with consented, real institutional data.
- Add accessible content, language options, and more lesson modules.
- Establish transparent, sourced methods before estimating environmental savings.
- Add educator controls, reporting exports, and appropriate privacy safeguards.
