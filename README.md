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

## License

Private Project.
