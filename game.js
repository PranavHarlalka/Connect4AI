// ══════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════
const ROWS = 6, COLS = 7, WIN = 4;
const EMPTY = 0, HUMAN = 1, AI = 2;
const WIN_SCORE = 10_000_000;

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let board, gameOver, humanTurn;
let nodesEvaluated = 0, branchesPruned = 0;

const idx      = (r, c) => r * COLS + c;
const newBoard = ()     => new Array(ROWS * COLS).fill(EMPTY);

// ══════════════════════════════════════════
//  BOARD LOGIC
// ══════════════════════════════════════════
const isValidCol = (b, c) => b[idx(0, c)] === EMPTY;

function getNextRow(b, c) {
  for (let r = ROWS - 1; r >= 0; r--)
    if (b[idx(r, c)] === EMPTY) return r;
  return -1;
}

const drop = (b, r, c, p) => { b[idx(r, c)] = p; };

function winningMove(b, p) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - WIN; c++)
      if ([0,1,2,3].every(i => b[idx(r, c+i)] === p)) return true;
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - WIN; r++)
      if ([0,1,2,3].every(i => b[idx(r+i, c)] === p)) return true;
  for (let r = 0; r <= ROWS - WIN; r++)
    for (let c = 0; c <= COLS - WIN; c++)
      if ([0,1,2,3].every(i => b[idx(r+i, c+i)] === p)) return true;
  for (let r = 0; r <= ROWS - WIN; r++)
    for (let c = WIN - 1; c < COLS; c++)
      if ([0,1,2,3].every(i => b[idx(r+i, c-i)] === p)) return true;
  return false;
}

function getWinCells(b, p) {
  const s = new Set();
  const chk = cells => { if (cells.every(c => b[c] === p)) cells.forEach(c => s.add(c)); };
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - WIN; c++) chk([0,1,2,3].map(i => idx(r, c+i)));
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - WIN; r++) chk([0,1,2,3].map(i => idx(r+i, c)));
  for (let r = 0; r <= ROWS - WIN; r++) {
    for (let c = 0; c <= COLS - WIN; c++) chk([0,1,2,3].map(i => idx(r+i, c+i)));
    for (let c = WIN - 1; c < COLS; c++) chk([0,1,2,3].map(i => idx(r+i, c-i)));
  }
  return [...s];
}

const isFull     = b => b.every(v => v !== EMPTY);
const isTerminal = b => winningMove(b, AI) || winningMove(b, HUMAN) || isFull(b);
const validCols  = b => [...Array(COLS).keys()].filter(c => isValidCol(b, c));

// ══════════════════════════════════════════
//  EVALUATION
// ══════════════════════════════════════════
function evalWindow(w, p) {
  const o = p === AI ? HUMAN : AI;
  const pc = w.filter(v => v === p).length;
  const ec = w.filter(v => v === EMPTY).length;
  const oc = w.filter(v => v === o).length;
  if (pc === 4) return 100;
  if (pc === 3 && ec === 1) return 5;
  if (pc === 2 && ec === 2) return 2;
  if (oc === 3 && ec === 1) return -4;
  return 0;
}

function scorePos(b, p) {
  let s = 0;
  const cx = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) if (b[idx(r, cx)] === p) s += 3;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - WIN; c++)
      s += evalWindow([0,1,2,3].map(i => b[idx(r, c+i)]), p);
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - WIN; r++)
      s += evalWindow([0,1,2,3].map(i => b[idx(r+i, c)]), p);
  for (let r = 0; r <= ROWS - WIN; r++) {
    for (let c = 0; c <= COLS - WIN; c++)
      s += evalWindow([0,1,2,3].map(i => b[idx(r+i, c+i)]), p);
    for (let c = WIN - 1; c < COLS; c++)
      s += evalWindow([0,1,2,3].map(i => b[idx(r+i, c-i)]), p);
  }
  return s;
}

// ══════════════════════════════════════════
//  MINIMAX (alpha-beta)
// ══════════════════════════════════════════
function minimax(b, depth, alpha, beta, max, track) {
  if (track) nodesEvaluated++;
  const term = isTerminal(b);
  if (depth === 0 || term) {
    if (term) {
      if (winningMove(b, AI))    return [null,  WIN_SCORE];
      if (winningMove(b, HUMAN)) return [null, -WIN_SCORE];
      return [null, 0];
    }
    return [null, scorePos(b, AI)];
  }
  const cols = validCols(b).sort((a, z) => Math.abs(a - 3) - Math.abs(z - 3));
  let best = cols[0];
  if (max) {
    let v = -Infinity;
    for (const c of cols) {
      const r = getNextRow(b, c), bc = b.slice(); drop(bc, r, c, AI);
      const [, sc] = minimax(bc, depth - 1, alpha, beta, false, track);
      if (sc > v) { v = sc; best = c; }
      alpha = Math.max(alpha, v);
      if (alpha >= beta) { if (track) branchesPruned++; break; }
    }
    return [best, v];
  } else {
    let v = Infinity;
    for (const c of cols) {
      const r = getNextRow(b, c), bc = b.slice(); drop(bc, r, c, HUMAN);
      const [, sc] = minimax(bc, depth - 1, alpha, beta, true, track);
      if (sc < v) { v = sc; best = c; }
      beta = Math.min(beta, v);
      if (alpha >= beta) { if (track) branchesPruned++; break; }
    }
    return [best, v];
  }
}

function getBest(b, depth) {
  nodesEvaluated = 0; branchesPruned = 0;
  const [col, score] = minimax(b, depth, -Infinity, Infinity, true, true);
  return { col, score };
}

// ══════════════════════════════════════════
//  DOM
// ══════════════════════════════════════════
const boardEl  = document.getElementById('board');
const statusEl = document.getElementById('status-bar');
const statusTx = document.getElementById('status-text');
const colBtns  = document.getElementById('col-btns');
const bannerEl = document.getElementById('banner');
const bannerTi = document.getElementById('banner-title');
const bannerSb = document.getElementById('banner-sub');
const getDepth = () => +document.getElementById('difficulty').value;

function setStatus(text, cls, dotColor) {
  statusEl.className = cls;
  statusTx.textContent = text;
  const dot = statusEl.querySelector('.dot');
  if (dot) dot.style.background = dotColor;
}
const setColsDisabled = dis =>
  document.querySelectorAll('.col-btn').forEach(b => b.disabled = dis);

// ══════════════════════════════════════════
//  RENDER BOARD
// ══════════════════════════════════════════
function renderBoard(animIdx = -1) {
  boardEl.querySelectorAll('.cell').forEach((cell, i) => {
    cell.dataset.piece = board[i];
    cell.classList.toggle('dropped', i === animIdx);
  });
}

function flashWin(cells, cb) {
  const dc = boardEl.querySelectorAll('.cell');
  cells.forEach(i => dc[i].classList.add('winning'));
  setTimeout(() => { cells.forEach(i => dc[i].classList.remove('winning')); cb?.(); }, 1300);
}

function showBanner(title, sub, color) {
  bannerTi.innerHTML = title;
  bannerTi.style.color = color || 'var(--text)';
  bannerSb.textContent = sub;
  bannerEl.classList.add('show');
}

// ══════════════════════════════════════════
//  GAME FLOW
// ══════════════════════════════════════════
function initGame() {
  board = newBoard(); gameOver = false; humanTurn = true;
  bannerEl.classList.remove('show');
  renderBoard();
  setStatus('Your Turn', 'human', 'var(--human)');
  setColsDisabled(false);
  syncBtns();
  renderViz();
}

function syncBtns() {
  document.querySelectorAll('.col-btn').forEach((btn, c) => {
    btn.disabled = !isValidCol(board, c) || gameOver;
  });
}

function handleHuman(col) {
  if (gameOver || !humanTurn || !isValidCol(board, col)) return;
  const row = getNextRow(board, col);
  drop(board, row, col, HUMAN);
  renderBoard(idx(row, col));
  syncBtns();
  if (winningMove(board, HUMAN)) {
    gameOver = true; humanTurn = false; setColsDisabled(true);
    flashWin(getWinCells(board, HUMAN), () => {
      setStatus('You Win', 'human', 'var(--human)');
      showBanner('You Win', 'Well played.', 'var(--human)');
    });
    renderViz(); return;
  }
  if (isFull(board)) {
    gameOver = true; setColsDisabled(true);
    setStatus('Draw', 'draw', 'var(--text-muted)');
    showBanner('Draw', 'No winner this time.'); renderViz(); return;
  }
  humanTurn = false; setColsDisabled(true);
  setStatus('AI is thinking…', 'thinking', '#7c6fcd');
  setTimeout(doAI, 80);
}

function doAI() {
  const { col } = getBest(board, getDepth());
  const row = getNextRow(board, col);
  drop(board, row, col, AI);
  renderBoard(idx(row, col));
  syncBtns();
  if (winningMove(board, AI)) {
    gameOver = true; humanTurn = false; setColsDisabled(true);
    flashWin(getWinCells(board, AI), () => {
      setStatus('AI Wins', 'ai', 'var(--ai)');
      showBanner('AI Wins', 'Better luck next time.', 'var(--ai)');
    });
    renderViz(); return;
  }
  if (isFull(board)) {
    gameOver = true; setColsDisabled(true);
    setStatus('Draw', 'draw', 'var(--text-muted)');
    showBanner('Draw', 'No winner this time.'); renderViz(); return;
  }
  humanTurn = true;
  setStatus('Your Turn', 'human', 'var(--human)');
  setColsDisabled(false); syncBtns();
  renderViz();
}

// ══════════════════════════════════════════
//  BUILD DOM
// ══════════════════════════════════════════
function buildBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < ROWS * COLS; i++) {
    const d = document.createElement('div');
    d.className = 'cell'; d.dataset.piece = EMPTY;
    d.addEventListener('click', () => handleHuman(i % COLS));
    boardEl.appendChild(d);
  }
}

function buildColBtns() {
  colBtns.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const b = document.createElement('button');
    b.className = 'col-btn'; b.textContent = '↓';
    b.addEventListener('click', () => handleHuman(c));
    colBtns.appendChild(b);
  }
}

// ══════════════════════════════════════════
//  VISUALIZER CONTROLLER
// ══════════════════════════════════════════
let vizOn = true;
document.getElementById('btnViz').addEventListener('click', () => {
  vizOn = !vizOn;
  document.getElementById('visualizer').classList.toggle('hidden', !vizOn);
  document.getElementById('btnViz').textContent = vizOn ? 'Hide' : 'Show';
});

function renderViz() {
  if (!vizOn) return;
  renderBars();
  renderTree();
  renderStats();
}

// ══════════════════════════════════════════
//  1. BAR CHART
// ══════════════════════════════════════════
function renderBars() {
  const el = document.getElementById('bar-chart');
  el.innerHTML = '';
  const b = board.slice();
  const scores = [];
  let bestScore = -Infinity, bestCol = -1;

  for (let c = 0; c < COLS; c++) {
    if (!isValidCol(b, c)) { scores.push(null); continue; }
    const r = getNextRow(b, c), bc = b.slice(); drop(bc, r, c, AI);
    const [, sc] = minimax(bc, 2, -Infinity, Infinity, false, false);
    scores.push(sc);
    if (!gameOver && sc > bestScore) { bestScore = sc; bestCol = c; }
  }

  const valid = scores.filter(s => s !== null);
  let mn = Math.min(...valid), mx = Math.max(...valid);
  if (mn === mx) { mn -= 1; mx += 1; }
  const MAX_H = 110;

  scores.forEach((sc, c) => {
    const col = document.createElement('div'); col.className = 'bc-col';
    const crown = document.createElement('div'); crown.className = 'bc-crown';
    if (c === bestCol && !gameOver) crown.textContent = '▲';
    col.appendChild(crown);
    const wrap = document.createElement('div'); wrap.className = 'bc-wrap';
    const bar  = document.createElement('div'); bar.className  = 'bc-bar';
    if (sc === null) {
      bar.classList.add('inv'); bar.style.height = '3px';
    } else {
      const h = Math.max(3, Math.round(((sc - mn) / (mx - mn)) * MAX_H));
      bar.style.height = h + 'px';
      bar.classList.add(c === bestCol && !gameOver ? 'best' : sc > 0 ? 'pos' : sc < 0 ? 'neg' : 'zero');
    }
    wrap.appendChild(bar); col.appendChild(wrap);
    const score = document.createElement('div'); score.className = 'bc-score';
    score.textContent = sc === null ? '—' : sc > 999999 ? '+∞' : sc < -999999 ? '-∞' : sc;
    col.appendChild(score);
    const lbl = document.createElement('div'); lbl.className = 'bc-label';
    lbl.textContent = `C${c}`;
    col.appendChild(lbl);
    el.appendChild(col);
  });
}

// ══════════════════════════════════════════
//  2. MINIMAX TREE — with real α-β pruning
// ══════════════════════════════════════════
function renderTree() {
  const svgEl    = document.getElementById('tree-svg');
  const b        = board.slice();

  // ── Layout constants ──
  const NR      = 22;    // node radius
  const L2_SHOW = 3;    // L2 branches to potentially show (up to L2_SHOW−1 evaluated + rest pruned)
  const L2_GAP  = 64;   // x spacing between L2 siblings
  const LVL_H   = 112;  // y between levels
  const PAD_X   = 48;   // left/right padding (space for level labels)
  const PAD_Y   = 16;   // top padding

  const vc      = validCols(b);
  const numL1   = vc.length;
  const L1_SLOT = Math.max(NR * 2 + 20, L2_SHOW * L2_GAP + 8);
  const svgW    = Math.max(520, PAD_X * 2 + numL1 * L1_SLOT);
  const svgH    = PAD_Y + NR + LVL_H + NR + LVL_H + NR + 30;

  const rootX = svgW / 2;
  const rootY = PAD_Y + NR;

  // ── Build tree with REAL alpha-beta pruning tracking ──
  // Structure: ROOT (–) → L1 AI moves (MAX) → L2 Human responses (MIN)
  // rootAlpha = best score the MAX player has secured so far (starts –∞)
  // At each L1 node (MIN): track runningMin. When rootAlpha >= runningMin → prune remaining L2 siblings.
  const tNodes = [];  // { x, y, type, col, score, pruned }
  const tEdges = [];  // { x1, y1, x2, y2, pruned }
  tNodes.push({ x: rootX, y: rootY, type: 'root' });

  let rootAlpha   = -Infinity;
  let bestL1Score = -Infinity;

  vc.forEach((aiCol, li) => {
    const slotX = PAD_X + li * L1_SLOT + L1_SLOT / 2;
    const l1Y   = rootY + LVL_H;

    // Board after AI plays aiCol
    const bcAI = b.slice();
    drop(bcAI, getNextRow(bcAI, aiCol), aiCol, AI);

    // Human response candidates up to L2_SHOW
    const humanVC = validCols(bcAI)
      .sort((a, z) => Math.abs(a - 3) - Math.abs(z - 3))
      .slice(0, L2_SHOW);

    // Simulate MIN player with α-β pruning
    let runningMin = Infinity;
    let cutFired   = false;
    const l2Data   = [];

    humanVC.forEach(hcol => {
      if (cutFired) {
        // Branch is pruned — still shown but greyed + scissor mark
        l2Data.push({ col: hcol, score: null, pruned: true });
        return;
      }
      const bcH = bcAI.slice();
      drop(bcH, getNextRow(bcH, hcol), hcol, HUMAN);
      const [, sc2] = minimax(bcH, 0, -Infinity, Infinity, true, false);
      l2Data.push({ col: hcol, score: sc2, pruned: false });
      if (sc2 < runningMin) runningMin = sc2;
      // α–β cutoff: MAX already has a better option → skip remaining Human moves
      if (rootAlpha >= runningMin) cutFired = true;
    });

    const l1Score = isFinite(runningMin) ? runningMin : scorePos(bcAI, AI);
    if (l1Score > bestL1Score) bestL1Score = l1Score;
    rootAlpha = Math.max(rootAlpha, l1Score); // update frontier after evaluating this L1

    tNodes.push({ x: slotX, y: l1Y, type: 'ai', col: aiCol, score: l1Score });
    tEdges.push({ x1: rootX, y1: rootY + NR, x2: slotX, y2: l1Y - NR, pruned: false });

    const showN  = l2Data.length;
    const startX = slotX - ((showN - 1) / 2) * L2_GAP;
    l2Data.forEach(({ col: hcol, score: sc2, pruned: isPruned }, hi) => {
      const x2 = showN === 1 ? slotX : startX + hi * L2_GAP;
      const y2 = l1Y + LVL_H;
      tNodes.push({ x: x2, y: y2, type: 'human', col: hcol, score: sc2, pruned: isPruned });
      tEdges.push({ x1: slotX, y1: l1Y + NR, x2, y2: y2 - NR, pruned: isPruned });
    });
  });

  // ── Build SVG markup ──
  let svg = '';

  // Subtle horizontal guide lines
  [rootY, rootY + LVL_H, rootY + LVL_H * 2].forEach(gy => {
    svg += `<line x1="0" y1="${gy}" x2="${svgW}" y2="${gy}" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>`;
  });

  // Level labels on left margin
  const LBL = `font-size="10" font-family="'Segoe UI',sans-serif" font-weight="700" fill="#253650"`;
  svg += `<text x="${PAD_X-12}" y="${rootY+4}"           text-anchor="end" ${LBL}>ROOT</text>`;
  svg += `<text x="${PAD_X-12}" y="${rootY+LVL_H+4}"     text-anchor="end" ${LBL}>MAX</text>`;
  svg += `<text x="${PAD_X-12}" y="${rootY+LVL_H*2+4}"   text-anchor="end" ${LBL}>MIN</text>`;

  // ── Draw edges first (under nodes) ──
  tEdges.forEach(e => {
    if (e.pruned) {
      // Dashed dark-red for pruned edges
      svg += `<line x1="${e.x1.toFixed(1)}" y1="${e.y1.toFixed(1)}" x2="${e.x2.toFixed(1)}" y2="${e.y2.toFixed(1)}"
        stroke="#6b1c1c" stroke-width="1.6" stroke-dasharray="5,4" opacity="0.8"/>`;
    } else {
      svg += `<line x1="${e.x1.toFixed(1)}" y1="${e.y1.toFixed(1)}" x2="${e.x2.toFixed(1)}" y2="${e.y2.toFixed(1)}"
        stroke="#1c3860" stroke-width="1.6" opacity="0.85"/>`;
    }
  });

  // ✂ scissor badges on pruned edges
  tEdges.forEach(e => {
    if (!e.pruned) return;
    const mx = ((e.x1 + e.x2) / 2).toFixed(1);
    const my = ((e.y1 + e.y2) / 2).toFixed(1);
    svg += `<rect x="${+mx-11}" y="${+my-9}" width="22" height="17" rx="3"
      fill="#230808" stroke="#7b1c1c" stroke-width="1" opacity="0.95"/>`;
    svg += `<text x="${mx}" y="${+my+4}" text-anchor="middle" font-size="11" font-family="sans-serif">✂</text>`;
  });

  // ── Draw nodes ──
  tNodes.forEach((n, i) => {
    const isBestAI = n.type === 'ai' && !gameOver && n.score === bestL1Score;
    let fill, stroke, opacity = '1';

    if (n.pruned) {
      // Pruned: dark, dim, red tinted
      fill = '#130909'; stroke = '#401818'; opacity = '0.4';
    } else if (n.type === 'root') {
      fill = '#0b1e3f'; stroke = '#1e4890';
    } else if (n.type === 'ai') {
      fill   = isBestAI ? '#3e2f06' : '#221a06';
      stroke = isBestAI ? '#c9a332' : '#6a5018';
    } else {
      // Human / MIN
      fill = '#200a0a'; stroke = '#6a1a1a';
    }

    svg += `<g class="tnode" style="opacity:0" data-i="${i}">`;

    // Pulsing outer ring for best AI move
    if (isBestAI) {
      svg += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${NR+6}"
        fill="none" stroke="#c9a332" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.5"/>`;
    }

    svg += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${NR}"
      fill="${fill}" stroke="${stroke}" stroke-width="${isBestAI ? 2.2 : 1.4}" opacity="${opacity}"/>`;

    // Label text
    if (n.type === 'root') {
      svg += `<text x="${n.x.toFixed(1)}" y="${(n.y+4).toFixed(1)}"
        text-anchor="middle" font-size="9" fill="#3d6fa8" font-weight="700"
        font-family="'Segoe UI',sans-serif">ROOT</text>`;
    } else if (n.pruned) {
      // Pruned node: only show column label, very dim
      svg += `<text x="${n.x.toFixed(1)}" y="${(n.y+4).toFixed(1)}"
        text-anchor="middle" font-size="8" fill="#4a2020" opacity="0.7"
        font-family="'Segoe UI',sans-serif">C${n.col}</text>`;
    } else {
      const disp = n.score > 999999 ? '+∞' : n.score < -999999 ? '-∞'
                 : (n.score > 0 ? '+'+n.score : String(n.score));
      const sc   = n.type === 'ai' ? (isBestAI ? '#c9a332' : '#9a7a28') : '#8a2a2a';
      svg += `<text x="${n.x.toFixed(1)}" y="${(n.y-5).toFixed(1)}"
        text-anchor="middle" font-size="8.5" fill="#c0cce0" font-weight="600"
        font-family="'Segoe UI',sans-serif">C${n.col}</text>`;
      svg += `<text x="${n.x.toFixed(1)}" y="${(n.y+8).toFixed(1)}"
        text-anchor="middle" font-size="8.5" fill="${sc}"
        font-family="'Segoe UI',sans-serif">${disp}</text>`;
    }
    svg += `</g>`;
  });

  // ── Legend ──
  const LY = svgH - 13;
  const LS = `font-size="9" fill="#2a3f5c" font-family="'Segoe UI',sans-serif"`;
  svg += `<circle cx="${PAD_X}" cy="${LY}" r="5" fill="#221a06" stroke="#6a5018" stroke-width="1.5"/>`;
  svg += `<text x="${PAD_X+9}" y="${LY+3}" ${LS}>AI / MAX</text>`;
  svg += `<circle cx="${PAD_X+81}" cy="${LY}" r="5" fill="#200a0a" stroke="#6a1a1a" stroke-width="1.5"/>`;
  svg += `<text x="${PAD_X+90}" y="${LY+3}" ${LS}>Human / MIN</text>`;
  svg += `<circle cx="${PAD_X+182}" cy="${LY}" r="5" fill="#3e2f06" stroke="#c9a332" stroke-width="2"/>`;
  svg += `<text x="${PAD_X+191}" y="${LY+3}" ${LS}>Best move</text>`;
  svg += `<circle cx="${PAD_X+265}" cy="${LY}" r="5" fill="#130909" stroke="#401818" stroke-width="1.5" opacity="0.5"/>`;
  svg += `<text x="${PAD_X+274}" y="${LY+3}" ${LS}>Pruned (α-β cut)</text>`;

  svgEl.setAttribute('width',   svgW);
  svgEl.setAttribute('height',  svgH);
  svgEl.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svgEl.innerHTML = svg;

  // Staggered fade-in per node
  svgEl.querySelectorAll('.tnode').forEach((n, i) => {
    setTimeout(() => { n.style.transition = 'opacity 0.18s ease'; n.style.opacity = '1'; }, i * 90);
  });
}

// ══════════════════════════════════════════
//  3. STATS
// ══════════════════════════════════════════
function renderStats() {
  nodesEvaluated = 0; branchesPruned = 0;
  const { col, score } = getBest(board, 3);
  const n = nodesEvaluated, p = branchesPruned;
  const est = COLS ** 3;
  document.getElementById('s-nodes').textContent  = n.toLocaleString();
  document.getElementById('s-pruned').textContent = p.toLocaleString();
  document.getElementById('s-col').textContent    = gameOver ? '—' : `Col ${col}`;
  document.getElementById('s-score').textContent  = gameOver ? '—' :
    (score > 999999 ? '+∞' : score < -999999 ? '-∞' : score);
  document.getElementById('stats-tip').innerHTML =
    `Alpha-Beta pruning eliminated <strong>${p.toLocaleString()}</strong> branches, ` +
    `evaluating only <strong>${n.toLocaleString()}</strong> nodes vs ~${est.toLocaleString()} ` +
    `in an unpruned depth-3 tree — a <strong>${Math.round((1 - n/est)*100)}%</strong> reduction.`;
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.getElementById('btnNew').addEventListener('click', initGame);
document.getElementById('banner-btn').addEventListener('click', initGame);
buildBoard();
buildColBtns();
initGame();
