export class Sudoku {
  constructor(n = 3) {
    this.n = n;
    this.grid = this.createGrid();
  }

  createGrid() {
    const grid = [];
    for (let subY = 0; subY < this.n; subY++) {
      const row = [];
      for (let subX = 0; subX < this.n; subX++) {
        const subGrid = [];
        for (let cellY = 0; cellY < this.n; cellY++) {
          const rowCells = [];
          for (let cellX = 0; cellX < this.n; cellX++) {
            rowCells.push(null); // Empty cell
          }
          subGrid.push(rowCells);
        }
        row.push(subGrid);
      }
      grid.push(row);
    }
    return grid;
  }

  increaseSize() {
    if (this.n < 5) { // Optional: Limit max size
      this.n++;
      this.grid = this.createGrid();
    }
  }

  decreaseSize() {
    if (this.n > 3) {
      this.n--;
      this.grid = this.createGrid();
    }
  }
}