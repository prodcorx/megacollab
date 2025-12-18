### You will find many TODOs throughout the codebase. I keep mental notes i can search through while coding not to get side-tracked on little things. Then eventually I go through these :)

// make sure to also make it so that the ingest audiofiles prioritizes the files that have active clips for them on timeline

<!-- <img alt="showcase" src="https://mofalk.com/megascreen.jpg"> -->

in readme needs to be hosted on mega subdomain public assets :)

## 1. Collaborative Undo/Redo Strategy

### Goal

Implement a robust, fraud-resistant Undo/Redo system that works across multiple connected clients for a DAW-like experience.

### Strategy: Server-Side Centralized History

To ensure consistency and prevent fraud (state manipulation), the "Source of Truth" for history must live on the server.

#### 1. Architecture

- **Action Log:** The server maintains a stack of performed actions (`HistoryStack`).
- **Command Pattern:** Every state-changing operation (Create, Update, Delete) is intercepted.
- **Inverse Operations:** When an action is logged, we calculate and store the data needed to reverse it immediately.
  - _Example:_ If you move a clip from Beat 0 to Beat 4, we store `{ type: 'update', inverse: { start_beat: 0 } }`.

#### 2. "Smart" Rollback & Concurrency

Since multiple users can edit simultaneously, the state might change between an action and its undo.

- **Validation:** When Undo is requested, the server attempts to apply the inverse operation.
- **Conflict Handling:** If User A moves a clip, and User B deletes it, User A's "Undo" (trying to move it back) will fail gracefully because the clip no longer exists. This prevents "Zombie State" where undos recreate deleted items in incorrect states.

#### 3. Fraud Prevention

- **Server Authority:** Clients only send "Intent" (e.g., "Undo"). The server decides what gets undone.
- **Validation:** The server checks if the undo is valid for the current state.

### Proposed Changes

1.  **Database Layer (`server/database.ts`)**
    - Add `getClipSafe(id)`: Essential to fetch the previous state of an item before updating it, so we can generate the inverse data.
2.  **Server Logic (`server/server.ts` & `server/history.ts`)**
    - Create `HistoryManager` class to manage the stack.
    - Instrument socket handlers:
      - `Create` → Push `Delete` as inverse.
      - `Update` → Fetch old values → Update → Push `Update(oldValues)` as inverse.
      - `Delete` → Fetch clip → Delete → Push `Create(clip)` as inverse.
    - Add `get:undo` handler: Pops the history and executes the inverse action.
3.  **Shared Layer (`shared/events.ts`)**
    - Add `get:undo` to `CLIENT_REQUESTS`.
4.  **Client Layer (`src/App.vue` / `src/state.ts`)**
    - Add global keydown listener for `Ctrl+Z`.
    - Emit `get:undo` command.
