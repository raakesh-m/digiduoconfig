import {
  GameEngine,
  GenericGrid,
  GenericGridCell,
  GenericPair,
  GenericLevelConfig,
  GenericGameState,
  Position
} from '../../engine/types';

export interface DigiDuoLevelConfig extends GenericLevelConfig {
  startFilledRows: number;
  numberRange: [number, number];
  addRowLimit: number;
}

export interface DigiDuoGameState extends GenericGameState<number> {
  pairsFound: number;
  addRowsUsed: number;
  streak?: number;
  lastMatchTime?: number;
}

export class DigiDuoEngine implements GameEngine<number> {
  generateGrid(config: DigiDuoLevelConfig): GenericGrid<number> {
    const { gridRows, gridCols, startFilledRows, numberRange } = config;
    const [minNum, maxNum] = numberRange;

    const cells: GenericGridCell<number>[][] = [];

    for (let row = 0; row < gridRows; row++) {
      const cellRow: GenericGridCell<number>[] = [];
      for (let col = 0; col < gridCols; col++) {
        const shouldFill = row < startFilledRows;
        const value = shouldFill
          ? Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
          : 0;

        cellRow.push({
          value,
          position: { row, col },
          isDulled: false,
          id: `${row}-${col}`,
        });
      }
      cells.push(cellRow);
    }

    this.ensureSolvablePairs(cells, config);

    return {
      cells,
      rows: gridRows,
      cols: gridCols,
    };
  }

  isValidPair(cell1: GenericGridCell<number>, cell2: GenericGridCell<number>): boolean {
    return cell1.value === cell2.value || cell1.value + cell2.value === 10;
  }

  findValidPairs(grid: GenericGrid<number>): GenericPair<number>[] {
    const pairs: GenericPair<number>[] = [];
    const activeCells = grid.cells.flat().filter(cell => cell.value > 0 && !cell.isDulled);

    for (let i = 0; i < activeCells.length; i++) {
      for (let j = i + 1; j < activeCells.length; j++) {
        if (this.isValidPair(activeCells[i], activeCells[j])) {
          pairs.push({
            cell1: activeCells[i],
            cell2: activeCells[j],
          });
        }
      }
    }

    return pairs;
  }

  applyMatch(grid: GenericGrid<number>, cell1: GenericGridCell<number>, cell2: GenericGridCell<number>): GenericGrid<number> {
    const newCells = grid.cells.map(row =>
      row.map(cell => {
        if (cell.id === cell1.id || cell.id === cell2.id) {
          return { ...cell, isDulled: true };
        }
        return cell;
      })
    );

    return {
      ...grid,
      cells: newCells,
    };
  }

  isLevelComplete(grid: GenericGrid<number>): boolean {
    const activeCells = grid.cells.flat().filter(cell => cell.value > 0 && !cell.isDulled);
    return activeCells.length === 0;
  }

  canStillWin(gameState: DigiDuoGameState): boolean {
    const validPairs = this.findValidPairs(gameState.grid);

    if (validPairs.length > 0) return true;

    const digiDuoLevel = gameState.level as DigiDuoLevelConfig;
    if (gameState.addRowsUsed < digiDuoLevel.addRowLimit) {
      const hasEmptyRows = gameState.grid.cells.some(row =>
        row.every(cell => cell.value === 0)
      );
      if (hasEmptyRows) return true;
    }

    return false;
  }

  calculateScore(cell1: GenericGridCell<number>, cell2: GenericGridCell<number>, gameState: DigiDuoGameState): number {
    const baseScore = (cell1.value + cell2.value) * 10;
    const streak = gameState.streak || 1;
    const streakMultiplier = Math.min(streak, 5);
    return baseScore * streakMultiplier;
  }

  onSpecialAction(gameState: DigiDuoGameState, action: string, params?: any): DigiDuoGameState {
    if (action === 'addRow') {
      const digiDuoLevel = gameState.level as DigiDuoLevelConfig;

      if (gameState.addRowsUsed >= digiDuoLevel.addRowLimit) {
        return gameState;
      }

      const newGrid = this.addNewRow(gameState.grid, digiDuoLevel);
      return {
        ...gameState,
        grid: newGrid,
        addRowsUsed: gameState.addRowsUsed + 1,
      };
    }

    return gameState;
  }

  private addNewRow(grid: GenericGrid<number>, config: DigiDuoLevelConfig): GenericGrid<number> {
    const { numberRange } = config;
    const [minNum, maxNum] = numberRange;
    let targetRow = -1;
    for (let row = 0; row < grid.rows; row++) {
      const isEmpty = grid.cells[row].every(cell => cell.value === 0);
      if (isEmpty) {
        targetRow = row;
        break;
      }
    }

    if (targetRow === -1) return grid;

    const newCells = grid.cells.map((row, rowIndex) => {
      if (rowIndex === targetRow) {
        return row.map(cell => ({
          ...cell,
          value: Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum,
          isDulled: false,
        }));
      }
      return [...row];
    });

    const newRow = newCells[targetRow];
    if (newRow && newRow.length >= 2) {
      const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      const pairIndex1 = Math.floor(Math.random() * newRow.length);
      let pairIndex2 = Math.floor(Math.random() * newRow.length);
      while (pairIndex2 === pairIndex1) {
        pairIndex2 = Math.floor(Math.random() * newRow.length);
      }

      newRow[pairIndex1].value = num;
      newRow[pairIndex2].value = Math.random() > 0.5 ? num : (10 - num);
    }

    return {
      ...grid,
      cells: newCells,
    };
  }

  private ensureSolvablePairs(cells: GenericGridCell<number>[][], config: DigiDuoLevelConfig): void {
    const { startFilledRows, gridCols, numberRange } = config;
    const [minNum, maxNum] = numberRange;

    let pairsCreated = 0;
    const targetPairs = Math.min(3, Math.floor((startFilledRows * gridCols) / 4));

    for (let row = 0; row < startFilledRows && pairsCreated < targetPairs; row++) {
      for (let col = 0; col < gridCols - 1 && pairsCreated < targetPairs; col += 2) {
        const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        cells[row][col].value = num;
        cells[row][col + 1].value = 10 - num;
        pairsCreated++;
      }
    }
  }

  getFilledRowsCount(grid: GenericGrid<number>): number {
    let count = 0;
    for (const row of grid.cells) {
      if (row.some(cell => cell.value > 0)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
}