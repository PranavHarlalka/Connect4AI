# Connect Four AI — Project Plan

## Overview

A desktop Connect Four game built with **Python + Tkinter** where a human plays against an AI powered by the **Minimax algorithm with Alpha-Beta pruning**. The board is the classic 6-row × 7-column grid; the first player to connect four discs in a row (horizontal, vertical, or diagonal) wins.

---

## Project Structure

```
connect-four/
├── main.py          # Entry point — launches the Tkinter window
├── game.py          # Core game logic (board state, rules, win detection)
├── ai.py            # Minimax + Alpha-Beta pruning engine
├── gui.py           # Tkinter UI — canvas drawing, event handling
└── constants.py     # Shared constants (colors, board dimensions, depths)
```

---

## Module Breakdown

### `constants.py`
- Board dimensions: `ROWS = 6`, `COLS = 7`
- Player tokens: `HUMAN = 1`, `AI = 2`, `EMPTY = 0`
- Colors: background, human disc color, AI disc color, highlight
- AI search depth (e.g., `MAX_DEPTH = 5`)

---

### `game.py` — Core Logic
- `create_board()` → 6×7 NumPy/2D-list of zeros
- `drop_piece(board, row, col, piece)` → places a disc
- `is_valid_location(board, col)` → checks column not full
- `get_next_open_row(board, col)` → finds lowest empty row
- `winning_move(board, piece)` → checks all four directions
- `is_terminal_node(board)` → win or board full
- `get_valid_locations(board)` → list of playable columns
- `score_position(board, piece)` → heuristic scorer (see AI section)

---

### `ai.py` — Minimax with Alpha-Beta Pruning
- **`minimax(board, depth, alpha, beta, maximizing_player)`**
  - Base cases: terminal node or depth == 0 → return heuristic score
  - Maximizing (AI): iterate valid columns, simulate drop, recurse, prune with `beta ≤ alpha`
  - Minimizing (Human): same but prune with `alpha ≥ beta`
  - Returns `(best_col, best_score)`
- **Heuristic `score_position(board, piece)`**
  - Centre column preference (+3 per disc in centre)
  - Score every window of 4 cells across all directions
  - Window scoring: 4-in-a-row → +100, 3+empty → +5, 2+empty → +2, opponent 3-in-a-row → -4

---

### `gui.py` — Tkinter Interface
- **`GameWindow(tk.Tk)`** class
  - Canvas-based board: draw circles for each cell
  - `draw_board()` → render full grid + discs
  - `animate_drop()` → optional falling animation for disc
  - `on_click(event)` → map mouse x → column → trigger human move
  - `hover_hint(event)` → ghost disc preview on column hover
  - Status bar: whose turn, win/draw announcement
  - Buttons: **New Game**, **Quit**
  - Colour theme: dark navy background, yellow human disc, red AI disc

---

### `main.py` — Entry Point
- Instantiate `GameWindow`
- Wire together game state and GUI
- Start `tk.mainloop()`

---

## Game Flow

```
Start
  │
  ├─ Human clicks column
  │     ├─ Validate move
  │     ├─ Drop human disc (animate)
  │     ├─ Check win/draw
  │     └─ Trigger AI turn
  │
  └─ AI turn
        ├─ Run minimax(depth=5, maximizing=True)
        ├─ Drop AI disc (animate)
        ├─ Check win/draw
        └─ Return control to Human
```

---

## AI Difficulty & Performance

| Depth | Approx. positions explored | Feel         |
|-------|---------------------------|--------------|
| 3     | ~343                      | Easy         |
| 5     | ~16,807                   | Medium ✅    |
| 7     | ~823,543                  | Hard         |

Alpha-Beta pruning typically cuts explored nodes by **~50–70%**, making depth 5–6 very playable in real time.

---

## UI Mockup (ASCII)

```
┌─────────────────────────────────────┐
│        CONNECT FOUR                 │
│  Your turn (Yellow)        [New]    │
│ ┌───┬───┬───┬───┬───┬───┬───┐      │
│ │ ○ │   │   │   │   │   │   │      │
│ │   │   │ ● │   │   │   │   │      │
│ │   │ ○ │ ● │   │   │   │   │      │
│ │   │ ○ │ ● │ ○ │   │   │   │      │
│ │ ● │ ○ │ ● │ ○ │   │   │   │      │
│ │ ● │ ○ │ ○ │ ● │ ○ │   │   │      │
│ └───┴───┴───┴───┴───┴───┴───┘      │
│  1   2   3   4   5   6   7         │
└─────────────────────────────────────┘
  ○ = Human (Yellow)   ● = AI (Red)
```

---

## Implementation Milestones

- [ ] `constants.py` — define all shared values
- [ ] `game.py` — board logic, win detection, scoring heuristic
- [ ] `ai.py` — minimax with alpha-beta, move selection
- [ ] `gui.py` — Tkinter canvas, click/hover handling, animations
- [ ] `main.py` — wire everything together, launch app
- [ ] End-to-end test: human vs AI full game
- [ ] Polish: animations, status messages, restart flow

---

## Dependencies

- Python 3.9+
- `tkinter` (bundled with Python)
- `numpy` (optional, for board as 2D array — can use plain lists)

No external packages beyond the standard library are strictly required.
