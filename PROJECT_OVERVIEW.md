# Aion Revenue Recorder Project Overview

## 1. Technical Architecture

The project is a **Single Page Application (SPA)** built with a modern React stack. It operates entirely client-side without a dedicated backend server, utilizing browser **LocalStorage** for data persistence.

### Technology Stack
*   **Core**: React 18, TypeScript 5.5, Vite 5
*   **State Management**: Zustand 4.5 (with `persist` middleware)
*   **UI Framework**: Tailwind CSS 3.4, Shadcn/ui (Radix UI), Lucide React
*   **Animation**: Framer Motion
*   **Internationalization**: i18next (en/zh-CN)
*   **Testing**: Vitest, React Testing Library
*   **Deployment**: Optimized for Cloudflare Pages

### Architecture Diagram (Conceptual)
```mermaid
graph TD
    User[User] --> UI[React Components (src/features)]
    UI --> Store[Zustand Store (useGameStore)]
    
    subgraph "State Management"
        Store --> AccountSlice[Account Slice]
        Store --> CharacterSlice[Character Slice]
        Store --> ServerSlice[Server Slice]
    end
    
    subgraph "Business Logic"
        UI --> RevCalc[RevenueCalculator Service]
        UI --> DataClean[DataCleaningService]
    end
    
    subgraph "Persistence layer"
        Store --> Middleware[Persist Middleware]
        Middleware --> LocalStorage[(Browser LocalStorage)]
    end
    
    subgraph "Shared"
        UI --> UIComp[Shared UI Components]
        UI --> Utils[Lib/Utils]
    end
```

## 2. Key Modules & Business Logic

The project follows a **Feature-based Directory Structure** (`src/features/*`), ensuring high cohesion.

### Core Modules
| Module | Description | Key Files |
| :--- | :--- | :--- |
| **Store** | Central state management combining all slices. | `src/store/useGameStore.ts`, `src/store/slices/*` |
| **Dungeon** | Calculates revenue based on difficulty and diminishing returns logic. | `src/features/dungeon/services/revenueCalculator.ts` |
| **Character** | Manages character stats, energy (Od), and weekly limits. | `src/features/character/*`, `createCharacterSlice.ts` |
| **Data Mgmt** | Handles data export (CSV/JSON), import, and cleaning. | `src/features/data-management/DataManagement.tsx` |
| **Server** | Multi-server support, filtering data by server ID. | `src/features/server/ServerSelection.tsx` |

### Key Business Logic
*   **Revenue Calculation**: `RevenueCalculator.ts` implements complex logic for:
    *   Base revenue per dungeon type/difficulty.
    *   **Diminishing Returns**: Calculates multipliers (Tier 1/2/3) based on weekly run counts.
*   **Energy Management**: `createCharacterSlice.ts` handles:
    *   Consuming Od Energy with overflow protection.
    *   Crafting/Buying energy (updates character limits AND adds entry to global expense logs).
*   **Data Isolation**: All data entities (`characters`, `logs`, `expenses`) include a `serverId` field to support multi-server profiles within a single LocalStorage entry.

## 3. Database Design (Local Schema)

Since there is no backend database, the schema is defined by TypeScript interfaces in `src/store/types.ts` and persisted as a JSON blob in LocalStorage under key `aion-revenue-storage`.

*   **Server**: `{ id, name, region }`
*   **Character**: `{ id, serverId, name, class, odEnergy, overflowEnergy, weeklyCounts... }`
*   **Log (Revenue)**: `{ id, characterId, serverId, dungeonType, difficulty, revenue, timestamp }`
*   **Expense**: `{ id, characterId, serverId, type, amount, timestamp }`

## 4. Known Issues & Technical Debt

Based on code analysis, the following areas may require attention:

### ⚠️ Scalability
*   **LocalStorage Limit**: All data is stored in a single JSON object in LocalStorage. As logs grow (e.g., thousands of entries over months), it may hit the browser's 5MB quota or cause performance issues during serialization/deserialization.
    *   *Mitigation*: The `DataManagement` module allows exporting CSV/JSON, but there is no automatic archival or IndexedDB implementation.

### 🛠 Code Maintainability
*   **Cross-Slice Logic Duplication**: In `createCharacterSlice.ts`, actions like `craftEnergy` manually construct `expense` objects and append them to the state. This logic implicitly duplicates how expenses might be handled in an `AccountSlice` action, leading to potential inconsistencies if the expense schema changes.
*   **Hardcoded Constants**: While `gameConstants.ts` exists, `RevenueCalculator.ts` contains static readonly values for specific dungeon revenues. These might be better moved to a central config file to allow easier updates when game patches change values.

### 🧪 Testing
*   **Coverage**: Unit tests exist for utilities (`utils.test.ts`) and revenue calculation (`revenueCalculator.test.ts`), but there appear to be no integration tests for the complex React interactions or the full Zustand store flows.

## 5. Summary
The project is well-structured, modern, and type-safe. It effectively solves the user's problem using a lightweight architecture. The primary long-term risk is data storage limits, but the current export features provide a reasonable workaround.
