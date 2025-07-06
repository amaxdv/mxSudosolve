import { Sudoku } from './sudoku.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('mxSudosolve gestartet');

 const sudoku = new Sudoku(3); // Start mit n=3 (Standard 9x9)

  const gridContainer = document.getElementById('sudoku-grid');
  const sizeDisplay = document.getElementById('grid-size');
  const btnIncrease = document.getElementById('increase-size');
  const btnDecrease = document.getElementById('decrease-size');

  // Render initial grid
  renderGrid(sudoku, gridContainer);

  // Update size display
  sizeDisplay.textContent = `${sudoku.n * sudoku.n}x${sudoku.n * sudoku.n}`;

  // Event listeners for controls
  btnIncrease.addEventListener('click', () => {
    sudoku.increaseSize();
    sizeDisplay.textContent = `${sudoku.n * sudoku.n}x${sudoku.n * sudoku.n}`;
    renderGrid(sudoku, gridContainer);
  });

  btnDecrease.addEventListener('click', () => {
    sudoku.decreaseSize();
    sizeDisplay.textContent = `${sudoku.n * sudoku.n}x${sudoku.n * sudoku.n}`;
    renderGrid(sudoku, gridContainer);
  });
});

/**
 * Render the game grid dynamically into the DOM
 */
function renderGrid(sudoku, container) {

  container.innerHTML = ''; // Clear previous grid

  const gridSize = sudoku.n * sudoku.n;
  container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  sudoku.grid.forEach((subGridRow, subY) => {
    subGridRow.forEach((subGrid, subX) => {
      subGrid.forEach((cellRow, cellY) => {
        cellRow.forEach((cell, cellX) => {
          const cellElement = document.createElement('input');
          cellElement.type = 'text';
          cellElement.maxLength = 1;
          cellElement.className = 'cell';

          // Add subGrid position classes for styling
          const subGridClass = `subgrid-${subY}-${subX}`;
          cellElement.classList.add(subGridClass);

          // Set unique cell ID (e.g., 00A)
          const cellId = `${subY}${subX}${String.fromCharCode(65 + (cellY * sudoku.n + cellX))}`;
          cellElement.dataset.id = cellId;

          container.appendChild(cellElement);
        });
      });
    });
  });
}


