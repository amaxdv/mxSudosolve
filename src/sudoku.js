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