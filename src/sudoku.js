export class Sudoku {
  constructor() {
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid() {
    // Create 9x9 Array with empty cells
    return Array.from({ length: 9 }, () => Array(9).fill(null));
  }

  printEmptyGrid() {
    console.table(this.grid);
  }
}
