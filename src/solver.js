// ===== Rules and Logics =====
    export function buildTable() {

      // +++ datasources +++
      const ctx = window.sudokuCellContext; //import the window-object 
      const calcDiv = document.getElementById("calcTable");

      if (!ctx || !calcDiv) return; //only continue if ctx or calcDiv is not false

      // +++ table and tableheader +++
      const table = document.createElement("table"); //create a table
      table.className = "tableStyle"; //give it a class

      const header = document.createElement("tr"); //describe a header-row
        ["Zelle", "Quadrant", "Zeile", "Spalte", "preset Value", "valid Value", "true Value"].forEach(title => { //Collection of row-names - for each row-name as title..
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
            cell.presetValue ?? "NULL", //hier Ergebnis aus Scan eintragen
            cell.validValue ?? "NULL",
            cell.trueValue ?? "NULL"
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

    // === crawling through grid ===
    export function scanGrid() {

        // +++ data sources +++
        const ctx = window.sudokuCellContext; // get window-object
        const allCells = document.querySelectorAll('.subgrid input'); // gathering inputs from subgrid

        allCells.forEach(inputCell => { // going through all inputs and..
            const cellValue = inputCell.value; // ..read the value and..
            const cellId = inputCell.dataset.id; // ..read the dataset.id and..

            let presetValue = null;

            const num = Number(cellValue);

            if (Number.isInteger(num) && num >= 1 && num <= 9) {
              presetValue = num;
            } 

            ctx[cellId].presetValue = presetValue;

            updateCellDOM(cellId, presetValue); // call the Update Function
        });

        resetTable(); // clear the table
        //buildTable(); // rebuild it

        console.log("Sudoku: Scan abgeschlossen."); 
    }

    export function updateCellDOM(cellId, presetValue) {
        const cell = document.querySelector(`input[data-id="${cellId}"]`); //??

        if (presetValue === null) {
            cell.classList.remove('preset');
            cell.disabled = false;
        } else {
            cell.classList.add('preset');
            cell.disabled = true;
            cell.value = presetValue;
        }
    }

    export function resetTable() {
        const calcDiv = document.getElementById("calcTable"); // get the Table from DOM
    
        if (calcDiv) calcDiv.innerHTML = "";

        buildTable();
    }
  
    export function searchTrueVal() {

      const dataCtx = window.sudokuCellContext; // get the data Context (initSudokuLogs? -> umbenennen)

      for (const cellId in dataCtx) { // for every "cellId" in data Context
        
        const cell = dataCtx[cellId]; // define a cell as object-property
        const pv = cell.presetValue; // assign the preset Property to cell

        cell.trueValue = cell.presetValue;

          // Wenn trueValue vorhanden ist → keine Kandidaten berechnen
          if (cell.trueValue !== null && cell.trueValue !== "" && cell.trueValue !== undefined) {
          cell.validValue = [];
          continue;
          }

          let wildCards = [1,2,3,4,5,6,7,8,9];

          for (const otherId in dataCtx) { // Check subgrid
            const other = dataCtx[otherId];

            const sameSubgrid = 
              other.subgrid[0] === cell.subgrid[0] && 
              other.subgrid[1] === cell.subgrid[1];

              if (sameSubgrid && other.trueValue) {
                wildCards = wildCards.filter(n => n !== Number(other.trueValue));
              }
          }

          for (const otherId in dataCtx) { // Check global row
            const other = dataCtx[otherId];

            if (other.globalRow === cell.globalRow && other.trueValue) {
              wildCards = wildCards.filter(n => n !== Number(other.trueValue));
            }
          }

          for (const otherId in dataCtx) { // Check global Col
            const other = dataCtx[otherId];

            if (other.globalCol === cell.globalCol && other.trueValue) {
              wildCards = wildCards.filter(n => n !== Number(other.trueValue));
            }
          }

      cell.validValue = wildCards;
      }

      resetTable();
    }

    export function testSetup() {
      const testValues = {
        "00A": 8, "00B": 7, "00D": 2, "00G": 5, "00H": 3,
        "01D": 6, "01F": 5,
        "02A": 6, "02B": 4, "02G": 9,
        "10A": 7, "10I": 3,
        "11A": 4, "11D": 2, "11E": 7, "11F": 3, "11I": 8,
        "12A": 5, "12I": 6, 
        "20C": 5, "20H": 1, "20I": 7,  
        "21D": 1, "21F": 9,
        "22B": 6, "22C": 3, "22F": 8, "22H": 9, "22I": 2  
      };

      for (const id in testValues) {
        const input = document.querySelector(`input[data-id="${id}"]`);
        if (input) {
          input.value = testValues[id];
        }
      }
    }

    // ==== Buttons to start action ====
    export let sudokuMode = "idle";

    const sudokuModeDisplay = document.getElementById("sudokuMode"); //Display actual mode
        sudokuModeDisplay.textContent = sudokuMode;

    document.getElementById('prepMode').addEventListener('click', () => {
      
      sudokuMode = "prep";
      sudokuModeDisplay.textContent = sudokuMode;

      const enabledCells = document.querySelectorAll('.subgrid input'); 
        enabledCells.forEach(inputCell => {
          inputCell.disabled = false;
        });

      solveMode.disabled = false;      // jetzt darf der Nutzer weiter

      testSetup();

    });

    document.getElementById('solveMode').addEventListener('click', () => {
      
      sudokuMode = "scanGrid";
      sudokuModeDisplay.textContent = sudokuMode;
      
      scanGrid();

      trueVals.disabled = false;

    });

    document.getElementById('trueVals').addEventListener('click', () => {
      sudokuMode = "searching Truth";

      sudokuModeDisplay.textContent = sudokuMode;

      searchTrueVal();
    });

    