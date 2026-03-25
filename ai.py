import copy
import math
import random
import constants
from game import is_valid_location, get_valid_locations, get_next_open_row, drop_piece, winning_move, is_terminal_node

def evaluate_window(window, piece):
    score = 0
    opp_piece = constants.HUMAN
    if piece == constants.HUMAN:
        opp_piece = constants.AI

    if window.count(piece) == 4:
        score += 100
    elif window.count(piece) == 3 and window.count(constants.EMPTY) == 1:
        score += 5
    elif window.count(piece) == 2 and window.count(constants.EMPTY) == 2:
        score += 2

    if window.count(opp_piece) == 3 and window.count(constants.EMPTY) == 1:
        score -= 4

    return score

def score_position(board, piece):
    score = 0

    # Score center column
    center_array = [board[r][constants.COLS//2] for r in range(constants.ROWS)]
    center_count = center_array.count(piece)
    score += center_count * 3

    # Score Horizontal
    for r in range(constants.ROWS):
        row_array = board[r]
        for c in range(constants.COLS - 3):
            window = row_array[c:c+constants.WINDOW_LENGTH]
            score += evaluate_window(window, piece)

    # Score Vertical
    for c in range(constants.COLS):
        col_array = [board[r][c] for r in range(constants.ROWS)]
        for r in range(constants.ROWS - 3):
            window = col_array[r:r+constants.WINDOW_LENGTH]
            score += evaluate_window(window, piece)

    # Score positive sloped diagonal
    for r in range(constants.ROWS - 3):
        for c in range(constants.COLS - 3):
            window = [board[r+i][c+i] for i in range(constants.WINDOW_LENGTH)]
            score += evaluate_window(window, piece)

    # Score negative sloped diagonal
    for r in range(constants.ROWS - 3):
        for c in range(constants.COLS - 3):
            window = [board[r+3-i][c+i] for i in range(constants.WINDOW_LENGTH)]
            score += evaluate_window(window, piece)

    return score


def minimax(board, depth, alpha, beta, maximizing_player):
    valid_locations = get_valid_locations(board)
    is_terminal = is_terminal_node(board)
    
    if depth == 0 or is_terminal:
        if is_terminal:
            if winning_move(board, constants.AI):
                return (None, 100000000000000)
            elif winning_move(board, constants.HUMAN):
                return (None, -10000000000000)
            else: # Game is over, no more valid moves
                return (None, 0)
        else: # Depth is zero
            return (None, score_position(board, constants.AI))
            
    if maximizing_player:
        value = -math.inf
        # Randomize column order to add variety to AI play
        column = random.choice(valid_locations)
        for col in valid_locations:
            row = get_next_open_row(board, col)
            b_copy = copy.deepcopy(board)
            drop_piece(b_copy, row, col, constants.AI)
            new_score = minimax(b_copy, depth-1, alpha, beta, False)[1]
            if new_score > value:
                value = new_score
                column = col
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return column, value

    else: # Minimizing player
        value = math.inf
        column = random.choice(valid_locations)
        for col in valid_locations:
            row = get_next_open_row(board, col)
            b_copy = copy.deepcopy(board)
            drop_piece(b_copy, row, col, constants.HUMAN)
            new_score = minimax(b_copy, depth-1, alpha, beta, True)[1]
            if new_score < value:
                value = new_score
                column = col
            beta = min(beta, value)
            if alpha >= beta:
                break
        return column, value
