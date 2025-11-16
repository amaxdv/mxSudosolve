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
        const calcDiv = document.getElementById("calcTable");
    
        if (calcDiv) calcDiv.innerHTML = "";

        buildTable();
    }
  

    // ==== Buttons to start action ====
    export let sudokuMode = "idle";

    const sudokuModeDisplay = document.getElementById("sudokuMode"); //Display actual mode
        sudokuModeDisplay.textContent = sudokuMode;

    document.getElementById('prepMode').addEventListener('click', () => {
      sudokuMode = "prep";

      solveMode.disabled = false;      // jetzt darf der Nutzer weiter

      sudokuModeDisplay.textContent = sudokuMode;
      
    });

    document.getElementById('solveMode').addEventListener('click', () => {
      if (sudokuMode !== "prep") return;  // Sicherheitsgurt
        sudokuMode = "solve";
        

        scanGrid();

        sudokuModeDisplay.textContent = sudokuMode;

    });

    