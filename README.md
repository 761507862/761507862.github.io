# Aion 2 Revenue Recorder

Modern React Application for tracking Aion 2 gameplay resources and dungeon revenue.

## Features

- **Account Management**:
  - Global "Od Energy" pool tracking.
  - Weekly Dungeon Run counter with Diminishing Returns calculation.
  - Energy replenishment (+40 / +80).

- **Character Management**:
  - Independent character cards.
  - Weekly Energy Block tracking (Bought/Crafted).
  - Weekly Dungeon Task tracking (Awakening/Pet).

- **Revenue Calculation**:
  - **Expedition**: Star-based revenue (1/2/3 Stars).
  - **Transcendence**: Layer-based revenue (1-10 Layers).
  - **Diminishing Returns**: Automatic coefficient adjustment (1.0 -> 0.8 -> 0.6) based on weekly run count.
  - **Energy Cost**: Auto-deduct 80 Energy for revenue dungeons.

- **Technical Stack**:
  - React + TypeScript + Vite
  - Zustand (State Management + Persistence)
  - Tailwind CSS + Framer Motion (UI/UX)
  - Vitest (Unit Testing)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Tests**:
   ```bash
   npm test
   ```

## Architecture

- **`src/features`**: Domain-specific logic (Account, Character, Dungeon).
- **`src/store`**: Global state management using Zustand slices.
- **`src/shared`**: Reusable UI components and hooks.
- **`src/lib`**: Utilities.

## Deployment

### Option 1: Cloudflare Pages (Recommended for China)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3. Select this repository (`Aion2`).
4. Select **Vite** as the framework preset.
5. Click **Save and Deploy**.

### Option 2: GitHub Pages
This repository includes a GitHub Action to automatically deploy to GitHub Pages.
1. Go to your repository **Settings**.
2. Navigate to **Pages** sidebar menu.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The site will be deployed to `https://<your-username>.github.io/Aion2/` after the next push.

## License

Private Project.
