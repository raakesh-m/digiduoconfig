import { LevelConfig } from '../types';
import { DIGIDUO_LEVELS, getDigiDuoLevelConfig } from '../games/digiduo/DigiDuoConfig';

export const LEVELS: LevelConfig[] = DIGIDUO_LEVELS;

export const getLevelConfig = (levelId: number): LevelConfig => {
  return getDigiDuoLevelConfig(levelId);
};