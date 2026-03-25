# Connect Four AI

A desktop Connect Four game built with **Python** and **Tkinter**, featuring a human-versus-AI mode. The AI opponent is powered by the **Minimax algorithm with Alpha-Beta pruning**.

## Features

- **Classic Gameplay**: 6-row × 7-column grid. First player to connect four discs horizontally, vertically, or diagonally wins.
- **Smart AI Opponent**: Uses the Minimax algorithm to calculate optimal moves.
- **Alpha-Beta Pruning**: Optimizes the AI's decision-making process, allowing it to look ahead multiple turns (depth 5 by default) while maintaining fast, responsive gameplay.
- **Graphical Interface**: Clean, canvas-based UI built entirely with Python's built-in Tkinter library.
  - Interactive clickable columns
  - Hover previews
  - Intuitive game flow

## Quick Start

### Prerequisites
- Python 3.9 or higher
- `numpy` (optional, but recommended for efficient board state representation)

### Running the Game
1. Clone or download this repository to your local machine.
2. Open a terminal or command prompt in the project directory.
3. Run the main application file:
   ```bash
   python main.py
   ```

## Project Architecture

- `main.py`: Application entry point. Initializes the user interface and starts the game loop.
- `game.py`: Core game logic handling the board state, physical mechanics (dropping pieces), and win detection.
- `ai.py`: The AI engine implementing the Minimax algorithm, Alpha-Beta pruning, and positional heuristic scoring.
- `gui.py`: Tkinter interface handling canvas drawing, event listening (mouse clicks/hovers), and visual updates.
- `constants.py`: Centralized configuration for game constants such as colors, board dimensions, and AI depth limits.

## How the AI Works

The AI acts as the maximizing player in a zero-sum game, evaluating future board states using the **Minimax algorithm**. By simulating all possible valid moves up to a defined depth (e.g., 5 moves ahead), it chooses the decision tree path that maximizes its advantage while minimizing yours.

To ensure the AI responds instantly without freezing the UI, it implements **Alpha-Beta pruning**. This optimization allows the algorithm to ignore entire branches of the decision tree that are demonstrably worse than a previously evaluated option, cutting down the total evaluated nodes by over 50%. The leaf nodes are evaluated using a custom heuristic function that heavily rewards controlling the central columns and building out unblocked groups of two or three pieces.