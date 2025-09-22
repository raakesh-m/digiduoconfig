import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Level 1',
    gridRows: 6,
    gridCols: 8,
    startFilledRows: 3,
    numberRange: [1, 9],
    addRowLimit: 3,
    timeLimit: 120,
  },
  {
    id: 2,
    name: 'Level 2',
    gridRows: 7,
    gridCols: 9,
    startFilledRows: 4,
    numberRange: [1, 9],
    addRowLimit: 3,
    timeLimit: 120,
  },
  {
    id: 3,
    name: 'Level 3',
    gridRows: 8,
    gridCols: 10,
    startFilledRows: 4,
    numberRange: [1, 9],
    addRowLimit: 2,
    timeLimit: 120,
  },
];

export const getLevelConfig = (levelId: number): LevelConfig => {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) {
    throw new Error(`Level ${levelId} not found`);
  }
  return level;
};