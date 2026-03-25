import tkinter as tk
import math
import constants
from game import create_board, drop_piece, get_next_open_row, winning_move, is_valid_location, get_valid_locations, is_terminal_node
import ai

SQUARESIZE = 100
RADIUS = int(SQUARESIZE / 2 - 5)
width = constants.COLS * SQUARESIZE
height = (constants.ROWS + 1) * SQUARESIZE # Extra row at top for dropping piece

class GameWindow(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Connect Four AI")
        self.geometry(f"{width}x{height}")
        self.resizable(False, False)
        
        self.board = create_board()
        self.game_over = False
        self.turn = constants.HUMAN
        
        # UI Elements
        self.canvas = tk.Canvas(self, width=width, height=height, bg=constants.BG_COLOR)
        self.canvas.pack()
        
        self.canvas.bind("<Motion>", self.hover_hint)
        self.canvas.bind("<Button-1>", self.on_click)
        
        # Menu
        menubar = tk.Menu(self)
        self.config(menu=menubar)
        game_menu = tk.Menu(menubar, tearoff=0)
        game_menu.add_command(label="New Game", command=self.restart_game)
        game_menu.add_separator()
        game_menu.add_command(label="Exit", command=self.quit)
        menubar.add_cascade(label="Game", menu=game_menu)
        
        self.draw_board()

    def restart_game(self):
        self.board = create_board()
        self.game_over = False
        self.turn = constants.HUMAN
        self.draw_board()

    def draw_board(self):
        self.canvas.delete("all")
        # Draw the blue board
        self.canvas.create_rectangle(0, SQUARESIZE, width, height, fill=constants.BOARD_COLOR, outline=constants.BOARD_COLOR)
        
        for c in range(constants.COLS):
            for r in range(constants.ROWS):
                x_center = int(c * SQUARESIZE + SQUARESIZE / 2)
                y_center = int((constants.ROWS - r) * SQUARESIZE + SQUARESIZE / 2)
                
                if self.board[r][c] == constants.EMPTY:
                    color = constants.BG_COLOR
                elif self.board[r][c] == constants.HUMAN:
                    color = constants.HUMAN_COLOR
                else:
                    color = constants.AI_COLOR
                    
                self.canvas.create_oval(x_center - RADIUS, y_center - RADIUS, 
                                        x_center + RADIUS, y_center + RADIUS, 
                                        fill=color, outline=color)
        self.update()

    def hover_hint(self, event):
        if self.game_over or self.turn != constants.HUMAN:
            return
            
        x = event.x
        col = int(math.floor(x / SQUARESIZE))
        
        self.draw_board() # Redraw to clear previous hint
        
        if is_valid_location(self.board, col):
            x_center = int(col * SQUARESIZE + SQUARESIZE / 2)
            y_center = int(SQUARESIZE / 2)
            self.canvas.create_oval(x_center - RADIUS, y_center - RADIUS, 
                                    x_center + RADIUS, y_center + RADIUS, 
                                    fill=constants.HUMAN_COLOR, outline=constants.HUMAN_COLOR)
        self.update()

    def process_move(self, col, piece):
        if not is_valid_location(self.board, col):
            return False
            
        row = get_next_open_row(self.board, col)
        drop_piece(self.board, row, col, piece)
        self.draw_board()
        
        if winning_move(self.board, piece):
            self.game_over = True
            msg = "You Win!" if piece == constants.HUMAN else "AI Wins!"
            color = constants.HUMAN_COLOR if piece == constants.HUMAN else constants.AI_COLOR
            self.canvas.create_text(width/2, SQUARESIZE/2, text=msg, fill=color, font=("Helvetica", 40, "bold"))
            self.update()
            return True
            
        if len(get_valid_locations(self.board)) == 0:
            self.game_over = True
            self.canvas.create_text(width/2, SQUARESIZE/2, text="Draw!", fill="white", font=("Helvetica", 40, "bold"))
            self.update()
            return True
            
        return False

    def on_click(self, event):
        if self.game_over or self.turn != constants.HUMAN:
            return
            
        x = event.x
        col = int(math.floor(x / SQUARESIZE))
        
        if self.process_move(col, constants.HUMAN):
            return # Game over
            
        self.turn = constants.AI
        self.update() # Force update to show human move before AI thinks
        
        # Schedule AI move slightly delayed for better UX
        self.after(100, self.ai_move)

    def ai_move(self):
        if self.game_over:
            return
            
        # Run Minimax
        col, minimax_score = ai.minimax(self.board, constants.MAX_DEPTH, -math.inf, math.inf, True)
        
        if col is None:
            # Fallback if minimax fails for some reason
            valid_locations = get_valid_locations(self.board)
            if valid_locations:
                import random
                col = random.choice(valid_locations)
                
        if col is not None:
            self.process_move(col, constants.AI)
            
        if not self.game_over:
            self.turn = constants.HUMAN
            self.draw_board() # Reset hint
