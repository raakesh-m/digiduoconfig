export const GRID_SIZES = {
  SMALL: 6,
  LARGE: 9,
} as const;

export type GridSize = typeof GRID_SIZES[keyof typeof GRID_SIZES];

export const setGridSize = (size: GridSize) => {
  console.log(`Grid size would be set to ${size}x${size}`);
  return size;
};

export const getOptimalCellSize = (gridSize: number, screenWidth: number, screenHeight: number) => {
  const availableWidth = screenWidth * 0.9;
  const availableHeight = screenHeight * 0.6;

  return Math.min(
    (availableWidth - (gridSize + 1) * 8) / gridSize,
    (availableHeight - (gridSize + 1) * 8) / gridSize,
    45
  );
};