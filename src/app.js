import { Sudoku } from './sudoku.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('mxSudosolve gestartet');

  // Beispiel: Erstelle eine Sudoku-Instanz
  const sudoku = new Sudoku();
  sudoku.printEmptyGrid();
});
