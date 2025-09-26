export interface Position {
  row: number;
  col: number;
}

export interface GenericGridCell<T = any> {
  value: T;
  position: Position;
  isDulled: boolean;
  id: string;
  metadata?: Record<string, any>;
}

export interface GenericGrid<T = any> {
  cells: GenericGridCell<T>[][];
  rows: number;
  cols: number;
  metadata?: Record<string, any>;
}

export interface GenericPair<T = any> {
  cell1: GenericGridCell<T>;
  cell2: GenericGridCell<T>;
}

export interface GenericLevelConfig {
  id: number;
  name: string;
  gridRows: number;
  gridCols: number;
  timeLimit: number;
  metadata?: Record<string, any>;
}

export interface GenericGameState<T = any> {
  grid: GenericGrid<T>;
  selectedCells: GenericGridCell<T>[];
  level: GenericLevelConfig;
  timeRemaining: number;
  score: number;
  isGameOver: boolean;
  isWon: boolean;
  metadata?: Record<string, any>;
}

export type GenericCellState = 'normal' | 'selected' | 'dulled' | 'invalid';

export interface GameEngine<T = any> {
  generateGrid(config: GenericLevelConfig): GenericGrid<T>;
  isValidPair(cell1: GenericGridCell<T>, cell2: GenericGridCell<T>): boolean;
  findValidPairs(grid: GenericGrid<T>): GenericPair<T>[];
  applyMatch(grid: GenericGrid<T>, cell1: GenericGridCell<T>, cell2: GenericGridCell<T>): GenericGrid<T>;
  isLevelComplete(grid: GenericGrid<T>): boolean;
  canStillWin(gameState: GenericGameState<T>): boolean;
  calculateScore(cell1: GenericGridCell<T>, cell2: GenericGridCell<T>, gameState: GenericGameState<T>): number;
  onSpecialAction?(gameState: GenericGameState<T>, action: string, params?: any): GenericGameState<T>;
}

export interface GridConfig<T = any> {
  cellRenderer?: (cell: GenericGridCell<T>, state: GenericCellState) => React.ReactNode;
  gridStyle?: any;
  cellStyle?: any;
  allowEmptyCells?: boolean;
  customValidation?: (cell1: GenericGridCell<T>, cell2: GenericGridCell<T>) => boolean;
}

export interface GameAudioConfig {
  enabled: boolean;
  sounds: {
    cellSelect?: string;
    cellMatch?: string;
    cellMismatch?: string;
    levelComplete?: string;
    gameOver?: string;
    buttonPress?: string;
    [key: string]: string | undefined;
  };
  volume: number;
}

export interface GameConfig<T = any> {
  name: string;
  engine: GameEngine<T>;
  levels: GenericLevelConfig[];
  gridConfig?: GridConfig<T>;
  audioConfig?: GameAudioConfig;
  theme?: {
    colors: Record<string, string>;
    fonts?: Record<string, any>;
  };
}