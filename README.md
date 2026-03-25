# Connect Four AI

A browser-based Connect Four game featuring a human-versus-AI mode. The AI is powered by the **Minimax algorithm with Alpha-Beta pruning**, and a built-in visualizer lets you watch the AI's decision process in real time.

## Features

- **Classic Gameplay** — 6×7 grid with win detection across all four directions
- **Minimax AI** — evaluates future board states using a weighted heuristic (center control, 3-in-a-row, blocks)
- **Alpha-Beta Pruning** — prunes branches the AI can provably ignore, cutting evaluated nodes by 50–80%
- **AI Visualizer Panel** *(right side)*:
  - **Column Score Bar Chart** — shows the AI's evaluation score for each possible move
  - **Minimax Search Tree** — SVG tree with 2 levels (MAX / MIN) showing real α-β cut branches (✂ dashed red edges)
  - **Search Statistics** — live node count, branches pruned, best column & score
- **Difficulty Selector** — Easy (depth 2), Medium (depth 4), Hard (depth 6)
- **Drop Animation** — smooth disc fall with bounce easing
- **Win Flash** — winning cells pulse green before the result banner appears
- **Zero dependencies** — pure vanilla HTML, CSS, and JavaScript; no libraries or frameworks

## Quick Start

### Prerequisites

- Python 3.6+ (for the local server launcher)

> No `pip install` needed — only Python standard library is used.

### Running the Game

```bash
python main.py
```

This starts a local HTTP server on `http://localhost:8765` and automatically opens the game in your default browser. Press **Ctrl+C** in the terminal to stop the server.

## Project Structure

```
Connect4AI/
├── index.html   # HTML structure — links to style.css and game.js
├── style.css    # All styling: design tokens, layout, animations, responsive rules
├── game.js      # All logic: board engine, Minimax/α-β AI, visualizer rendering
└── main.py      # Python launcher: serves the files and opens the browser
```

## How the AI Works

The AI is the **maximizing player** in a zero-sum game tree. Given the current board state, it searches all valid move sequences up to a configurable depth using **Minimax with Alpha-Beta pruning**.

### Evaluation Heuristic

Leaf nodes (at the depth limit) are scored by `scorePos()`:

| Pattern | Score |
|---|---|
| Center column disc | +3 per disc |
| 4-in-a-row | +100 |
| 3-in-a-row + 1 empty | +5 |
| 2-in-a-row + 2 empty | +2 |
| Opponent 3-in-a-row + 1 empty | −4 |

### Alpha-Beta Pruning

At each MIN node (human responses), if the running minimum score drops at or below the best score the MAX player has already secured (`alpha`), the remaining siblings are **cut** — they cannot influence the final decision. This is visualized in the tree as **✂ dashed red branches** with dimmed nodes.

### Difficulty Depth Table

| Mode | Depth | Typical Nodes | Branches Pruned |
|---|---|---|---|
| Easy | 2 | ~80–150 | ~30% |
| Medium | 4 | ~500–2000 | ~60% |
| Hard | 6 | ~5000–50000 | ~75% |