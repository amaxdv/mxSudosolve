import { buildTable, resetTable } from './solver.js';


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
                  inputCell.placeholder = inputCell.dataset.id; //~optional ID display 

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
      
      const cellContext = {};

      // --- Subgrids ---
      console.log('=== SubGrids Log ===');

      for (let gridRow = 0; gridRow < n; gridRow++) { //for every (big) row..
        for (let gridCol = 0; gridCol < n; gridCol++) { //..iterate through every (big) col and..
          const subGrid = gameGrid[gridRow][gridCol]; //..rebuild the grid-position from gameGrid and..
          const subGridElement = subGrid.getElement(); //..tage the subGrid-div-element from DOM and..
          const inputCells = subGridElement.querySelectorAll('input'); //select the input-element as nodelist-object and..
          
          const cellIds = Array.from(inputCells).map(cell => cell.dataset.id); //..generate a functional array with all subGrid-IDs

          //+++NEU für Logics+++
          Array.from(inputCells).forEach(cell => {
            const id = cell.dataset.id;

            cellContext[id] = {
              subgrid: [gridRow, gridCol],
              localRow: Number(cell.dataset.localRow),
              localCol: Number(cell.dataset.localCol),
              // weitere Felder kommen später..
              };
            });

            window.sudokuCellContext = cellContext; //..

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

      //Neu - send to LogicTable
      for (const id of globalRowCells) {
        window.sudokuCellContext[id].globalRow = rGlobal;
      }
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

      //Neu - send to LogicTable
      for (const id of globalColCells) {
        window.sudokuCellContext[id].globalCol = cGlobal;
      }
    }

    console.log('=== End of Grid Structure Log ===');

    buildTable();
    }
    
/* in neue Datei verschoben
    // ===== Rules and Logics =====
    export function solvingLogics() {

      // +++ datasources +++
      const ctx = window.sudokuCellContext; //import the window-object from above
      const calcDiv = document.getElementById("calcTable");

      if (!ctx || !calcDiv) return; //only continue if ctx or calcDiv is not false

      // +++ table and tableheader +++
      const table = document.createElement("table"); //create a table
      table.className = "tableStyle"; //give it a class

      const header = document.createElement("tr"); //describe a header-row
        ["Zelle", "Quadrant", "Zeile", "Spalte", "preset Value"].forEach(title => { //Collection of row-names - for each row-name as title..
          const th = document.createElement("th"); //create a th-tag..
          th.textContent = title; //name it like the title (row-name)..

          th.style.border = "1px solid black"; //styles
          th.style.padding = "4px";

          header.appendChild(th); //connect the tags to header
        });

      table.appendChild(header); //connect the header to table

      // +++ tablerows and -data +++
      for (const id in ctx) { // ??
        const cell = ctx[id];
        const tableRow = document.createElement("tr");

        const subString = `[${cell.subgrid[0]}|${cell.subgrid[1]}]`;

          const tableValues = [ // matching order with row-names
            id, // Zelle - wie geht das ohne "richtige" Definition - wo holt er die her??
            subString, // Quadrant
            cell.globalRow, // Zeile
            cell.globalCol, //Spalte
            cell.presetValue ?? "NULL" //hier Ergebnis aus Scan eintragen
          ];

          tableValues.forEach(val => {
            const td = document.createElement("td");
              td.textContent = val;

              td.style.border = "1px solid black"; // styles
              td.style.padding = "4px";

            tableRow.appendChild(td);
          });

        table.appendChild(tableRow);
      }

    calcDiv.appendChild(table);

    }

    */

    renderGameGrid();

// ==== Control Field - Buttons & Display-Elements ====
    document.getElementById('increase').addEventListener('click', () => {
      if (n < 5) { //upper cap grid size
        n++;
          renderGameGrid();
            gridSizeDisplay.textContent = n;
      } else {
        alert("Maximale Feldgröße erreicht.")
      }
      resetTable()
      //buildTable()
    });

    document.getElementById('decrease').addEventListener('click', () => {
      if (n > 1) { //lower cap grid size
        n--;
          renderGameGrid();
            gridSizeDisplay.textContent = n;
      } else {
        alert("Minimale Feldgröße erreicht.")
      }
      resetTable()
      //buildTable()
    });

    const gridSizeDisplay = document.getElementById("gridSizeId"); //Display actual Grid size
    gridSizeDisplay.textContent = n;

/*in neue Datei verschoben
// ==== Buttons to start action ====
    export let sudokuMode = "idle";

    document.getElementById('prepMode').addEventListener('click', () => {
      sudokuMode = "prep";
      console.log("Sudoku: Vorbereitungs-Modus aktiv.");

      solveMode.disabled = false;      // jetzt darf der Nutzer weiter
      
    });

    document.getElementById('solveMode').addEventListener('click', () => {
      if (sudokuMode !== "prep") return;  // Sicherheitsgurt
        sudokuMode = "solve";
        console.log("Sudoku: Lösungs-Modus gestartet.");

        scanGrid();

    });

    export function scanGrid() {
        console.log("Sudoku: Scan gestartet...");

          const ctx = window.sudokuCellContext;
          if (!ctx) return;

          const allCells = document.querySelectorAll('.subgrid input');

          allCells.forEach(inputCell => {
            const raw = inputCell.value.trim();
            const id = inputCell.dataset.id;

            let presetValue = null;

            const num = Number(raw);
            if (Number.isInteger(num) && num >= 1 && num <= 9) {
              presetValue = num;
            }

            ctx[id].presetValue = presetValue;
            updateCellDOM(id, presetValue);
          });

          console.log("Sudoku: Scan abgeschlossen.");

          // Tabelle neu erzeugen
          clearSudokuTable();
          solvingLogics();
    }

    function updateCellDOM(id, presetValue) {
        const cell = document.querySelector(`input[data-id="${id}"]`);
          if (!cell) return;

          if (presetValue === null) {
            cell.classList.remove('preset');
            cell.disabled = false;
          } else {
            cell.classList.add('preset');
            cell.disabled = true;
            cell.value = presetValue;
        }
}

function clearSudokuTable() {
  const calcDiv = document.getElementById("calcTable");
  if (calcDiv) calcDiv.innerHTML = "";
}
  */
