import { GameConfig } from '../../engine/types';
import { DigiDuoEngine, DigiDuoLevelConfig } from './DigiDuoEngine';

const GRID_CONFIG = {
  cols: 9,
  totalRows: 9,
  initialFilledRows: 6,
  get rows() { return this.totalRows; },
  get filledRows() { return this.initialFilledRows; }
};

export const DIGIDUO_LEVELS: DigiDuoLevelConfig[] = [
  {
    id: 1,
    name: 'Level 1',
    gridRows: GRID_CONFIG.rows,
    gridCols: GRID_CONFIG.cols,
    startFilledRows: GRID_CONFIG.filledRows,
    numberRange: [1, 9],
    addRowLimit: 3,
    timeLimit: 120,
  },
  {
    id: 2,
    name: 'Level 2',
    gridRows: GRID_CONFIG.rows,
    gridCols: GRID_CONFIG.cols,
    startFilledRows: GRID_CONFIG.filledRows,
    numberRange: [1, 9],
    addRowLimit: 3,
    timeLimit: 120,
  },
  {
    id: 3,
    name: 'Level 3',
    gridRows: GRID_CONFIG.rows,
    gridCols: GRID_CONFIG.cols,
    startFilledRows: GRID_CONFIG.filledRows,
    numberRange: [1, 9],
    addRowLimit: 2,
    timeLimit: 120,
  },
];

export const getDigiDuoLevelConfig = (levelId: number): DigiDuoLevelConfig => {
  const level = DIGIDUO_LEVELS.find(l => l.id === levelId);
  if (!level) {
    throw new Error(`DigiDuo Level ${levelId} not found`);
  }
  return level;
};

export const DIGIDUO_CONFIG: GameConfig<number> = {
  name: 'DigiDuo',
  engine: new DigiDuoEngine(),
  levels: DIGIDUO_LEVELS,
  gridConfig: {
    allowEmptyCells: true,
  },
  audioConfig: {
    enabled: true,
    sounds: {
      cellSelect: 'cellSelect',
      cellMatch: 'cellMatch',
      cellMismatch: 'cellMismatch',
      levelComplete: 'levelComplete',
      gameOver: 'gameOver',
      buttonPress: 'buttonPress',
      rowAdd: 'rowAdd',
      streak: 'streak',
      powerup: 'powerup',
    },
    volume: 0.7,
  },
  theme: {
    colors: {
      primary: '#00FFB3',
      secondary: '#8C1BFF',
      accent: '#FF007A',
      warning: '#FFD600',
      error: '#FF1744',
      background: '#000000',
      surface: 'rgba(255, 255, 255, 0.08)',
      text: '#FFFFFF',
      textSecondary: '#CBD5E1',
    },
  },
};