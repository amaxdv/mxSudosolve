//+++subGrid - build & render+++
    export class SubGrid {
        constructor(idPrefix = '') {
            this.idPrefix = idPrefix; //Proxy subgrid-ID to build cell-ID later
            this.cells = this.createSubGrid(); 
        }

        createSubGrid() {
          const container = document.createElement('div'); //div to hold subGrid
          container.className = 'subgrid'; //appending CSS class

          const letters = 'ABCDEFGHI'; //cell ID component

              for (let i = 0; i < 9; i++) {
                //Input-Cells + properties
                const inputCell = document.createElement('input'); 
                  inputCell.type = 'text'; //~change to 'number' if Optional ID display is enabled
                  inputCell.maxLength = 1;
                  inputCell.dataset.id = this.idPrefix + letters[i];
                  inputCell.value = inputCell.dataset.id; //~optional ID display 

                //Input-Cell Grid Positioning
                const localRow = Math.floor(i / 3); //localRow 0,1,2 = 0 / 3,4,5 = 1 / 6,7,8 = 2
                  inputCell.dataset.localRow = localRow; //assigning inputCell row-logic (based on 0)
                  inputCell.style.gridRow = localRow +1; //assinging inputCell row-style (based on 1)

                const localCol = i % 3; //localCol 0,3,6 = 0 / 1,4,7 = 1 / 2,5,8 = 2
                  inputCell.dataset.localCol = localCol;
                  inputCell.style.gridColumn = localCol +1;

                container.appendChild(inputCell);
              }

        return container; //returns the 9 input-cells as DOM-element (=> this.cells)
      }

      getElement() {
        return this.cells; //Output subGrid-container
      }
    }
    
    const pocContainer = document.getElementById('poc-container'); //linking container with ID in the DOM

    //+++gameGrid - build & render+++
    export let n = 3;
    export let gameGrid = {}; 

    export function renderGameGrid() {
      gameGrid = {}; //clearing gameGrid-Object from previous subGrids
      pocContainer.innerHTML = ''; //clearing the DOM from previous subGrids

      pocContainer.style.gridTemplateColumns = `repeat(${n}, auto)`; //repeat grid-cells n-times and auto-size
      pocContainer.style.gridTemplateRows = `repeat(${n}, auto)`;

      for (let gridRow = 0; gridRow < n; gridRow++) { //for every big-grid-row..
        gameGrid[gridRow] = {}; //..place space to save the subGrid-mapping..

        for (let gridCol = 0; gridCol < n; gridCol++) { //..and for every big-grid-col..
          const idPrefix = `${gridRow}${gridCol}`; //..and define and write the global-position ID-component..
          const subGrid = new SubGrid(idPrefix, gridRow, gridCol); //..and define subGrid-object with an instance of subGrid-class..
          gameGrid[gridRow][gridCol] = subGrid; //and save subGrid to gameGrid (e.g. gameGrid[0][0] = top left grid)..
          
          pocContainer.appendChild(subGrid.getElement()); //..and insert subGrid into DOM-container.
        }
      }
      initSudokuLogs()
    }

    // --- Logging / Rule Logic Anchor ---
    export function initSudokuLogs() {
      
      // --- Subgrids ---
      console.log('=== SubGrids Log ===');

      for (let gridRow = 0; gridRow < n; gridRow++) { //for every (big) row..
        for (let gridCol = 0; gridCol < n; gridCol++) { //..iterate through every (big) col and..
          const subGrid = gameGrid[gridRow][gridCol]; //..rebuild the grid-position from gameGrid and..
          const subGridElement = subGrid.getElement(); //..tage the subGrid-div-element from DOM and..
          const inputCells = subGridElement.querySelectorAll('input'); //select the input-element as nodelist-object and..
          
          const cellIds = Array.from(inputCells).map(cell => cell.dataset.id); //..generate a functional array with all subGrid-IDs

          console.log(`Subgrid [${gridRow},${gridCol}]:`,cellIds); //specify the subGrid and write the array.
        }
      }

    // --- Globale Rows & Cols loggen ---
    const subSize = 3;                //define subSizes as static 3x3 to calculate row and col positioning correctly
    const totalRows = n * subSize;    //total number of global rows
    const totalCols = n * subSize;   //total number of global cols

    // --- Rows ---
    console.log('=== Global Rows Log ===');

    for (let rGlobal = 0; rGlobal < totalRows; rGlobal++) { //for every global row of entire game grid..
      const gridRow = Math.floor(rGlobal / subSize); //..define a (big) row (subGrids in a row) and set them as three-number-pairs (0-2, 3-5, 6-8 ...) and..
      const localRow = rGlobal % subSize;            //..define another (little) row within subGrid with cyclical numarion (0,1,2) and.. 

      let globalRowCells = []; //..build an empty erray and..

      for (let gridCol = 0; gridCol < n; gridCol++) { //iterate through every global col and repeat the DOM to array mechanic from above
        const subGrid = gameGrid[gridRow][gridCol];
        const subGridElement = subGrid.getElement();
        const inputCells = subGridElement.querySelectorAll('input');

        const matchingCells = Array.from(inputCells) //generate a functional array from the collected input cells
          .filter(cell => Number(cell.dataset.localRow) === localRow) //browse the cells and keep only the mathing ones (with localRow)
            .map(cell => cell.dataset.id); //transform the filtered elements to pure strings with dataset ID

        globalRowCells.push(...matchingCells); //add to the initial empty array
      }

      console.log(`Global Row ${rGlobal}:`, globalRowCells); //specify the global row and write the array.
    }

    // --- Columns ---
    console.log('=== Global Cols Log ===');

    for (let cGlobal = 0; cGlobal < totalCols; cGlobal++) { //repeat the row mechanic for cols
      const gridCol = Math.floor(cGlobal / subSize);
      const localRow = cGlobal % subSize;

      let globalColCells = [];

      for (let gridRow = 0; gridRow < n; gridRow++) {
        const subGrid = gameGrid[gridRow][gridCol];
        const subGridElement = subGrid.getElement();
        const inputCells = subGridElement.querySelectorAll('input');

        const matchingCells = Array.from(inputCells)
          .filter(cell => Number(cell.dataset.localCol) === localRow)
          .map(cell => cell.dataset.id);

        globalColCells.push(...matchingCells);
      }
      
      console.log(`Global Col ${cGlobal}:`, globalColCells);
    }

    console.log('=== End of Grid Structure Log ===');
    }

    renderGameGrid();

//+++Control Field - Buttons & Display-Elements+++
    document.getElementById('increase').addEventListener('click', () => {
      if (n < 5) { //upper cap grid size
        n++;
          renderGameGrid();
            gridSizeDisplay.textContent = n;
      } else {
        alert("Maximale Feldgröße erreicht.")
      }
    });

    document.getElementById('decrease').addEventListener('click', () => {
      if (n > 1) { //lower cap grid size
        n--;
          renderGameGrid();
            gridSizeDisplay.textContent = n;
      } else {
        alert("Minimale Feldgröße erreicht.")
      }
    });

    const gridSizeDisplay = document.getElementById("gridSizeId"); //Display actual Grid size
    gridSizeDisplay.textContent = n;