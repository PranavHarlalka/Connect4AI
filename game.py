import constants

def create_board():
    return [[constants.EMPTY for _ in range(constants.COLS)] for _ in range(constants.ROWS)]

def drop_piece(board, row, col, piece):
    board[row][col] = piece

def is_valid_location(board, col):
    return board[constants.ROWS - 1][col] == constants.EMPTY

def get_next_open_row(board, col):
    for r in range(constants.ROWS):
        if board[r][col] == constants.EMPTY:
            return r
    return -1

def winning_move(board, piece):
    # Check horizontal locations for win
    for c in range(constants.COLS - 3):
        for r in range(constants.ROWS):
            if board[r][c] == piece and board[r][c+1] == piece and board[r][c+2] == piece and board[r][c+3] == piece:
                return True

    # Check vertical locations for win
    for c in range(constants.COLS):
        for r in range(constants.ROWS - 3):
            if board[r][c] == piece and board[r+1][c] == piece and board[r+2][c] == piece and board[r+3][c] == piece:
                return True

    # Check positively sloped diagonals
    for c in range(constants.COLS - 3):
        for r in range(constants.ROWS - 3):
            if board[r][c] == piece and board[r+1][c+1] == piece and board[r+2][c+2] == piece and board[r+3][c+3] == piece:
                return True

    # Check negatively sloped diagonals
    for c in range(constants.COLS - 3):
        for r in range(3, constants.ROWS):
            if board[r][c] == piece and board[r-1][c+1] == piece and board[r-2][c+2] == piece and board[r-3][c+3] == piece:
                return True
                
    return False

def get_valid_locations(board):
    valid_locations = []
    for col in range(constants.COLS):
        if is_valid_location(board, col):
            valid_locations.append(col)
    return valid_locations

def is_terminal_node(board):
    return winning_move(board, constants.HUMAN) or winning_move(board, constants.AI) or len(get_valid_locations(board)) == 0
