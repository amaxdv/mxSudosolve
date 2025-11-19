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
 
            updateGridPresets(cellId, presetValue);
        });
 
        resetTable(); // clear the table
        //buildTable(); // rebuild it
 
        console.log("Sudoku: Scan abgeschlossen."); 
    }
 
    export function updateGridPresets(cellId, presetValue) {
        const cell = document.querySelector(`input[data-id="${cellId}"]`); //??
 
        if (presetValue === null) { //nochmal angucken, kann man bestimmt was streichen
            cell.classList.remove('preset');
            cell.disabled = false;
        } else {
            cell.classList.add('preset');
            cell.disabled = true;
            cell.value = presetValue;
        }
    }
 
    export function updateGridTrues(dataCtx) {
      for (const cellId in dataCtx) {
        const cellData = dataCtx[cellId];
        const input = document.querySelector(`input[data-id="${cellId}"]`);
    
        if (!input) continue;
 
        // Presets NICHT anfassen
        if (cellData.presetValue !== null && cellData.presetValue !== undefined) {
          continue;
        }
 
        // Solver Werte setzen
        if (cellData.trueValue !== null && cellData.trueValue !== undefined) {
          input.value = cellData.trueValue;
          input.classList.add("solved");
          input.disabled = true;
        } else {
          // Kein solver value → reset
          input.value = "";
          input.classList.remove("solved");
        }
      }
    }
 
    export function resetTable() {
        const calcDiv = document.getElementById("calcTable"); // get the Table from DOM
    
        if (calcDiv) calcDiv.innerHTML = "";
 
        buildTable();
    }
  
    export function searchTrueVal() {
 
      const dataCtx = window.sudokuCellContext;
 
      readPresets(dataCtx);

      let changed = true; // using for sequencing the rule checking rounds

      while (changed) {
        wildcardExclusion(dataCtx);
        //innerCleanup(dataCtx);

        changed = nakedSinglesRound(dataCtx);

        if (!changed) {
          changed = hiddenSinglesRound(dataCtx);
        }
      }
      resetTable();
    }
 
    export function readPresets(dataCtx) {
 
      for (const cellId in dataCtx) {
        const cell = dataCtx[cellId];
 
        if (cell.presetValue) {
          cell.trueValue = cell.presetValue;
          cell.validValue = [];
        }
      }
    }
 
    export function wildcardExclusion(dataCtx) {
 
      for (const id in dataCtx) {
        const cell = dataCtx[id];
      

      if (cell.trueValue !== null && cell.trueValue !== undefined && cell.trueValue !== "") {
        cell.validValue = [];
        continue;
      }

      let wildcards = [1,2,3,4,5,6,7,8,9];

      wildcards = subgridRule(cell, dataCtx, wildcards);
      wildcards = globalRowRule(cell, dataCtx, wildcards);
      wildcards = globalColRule(cell, dataCtx, wildcards);
      //wildcards = innerClearityRule(cell, dataCtx, wildcards);
      //wildcards = nakedTrueRule(cell, dataCtx, wildcards);

      cell.validValue = wildcards;

      /*
      for (const cellId in dataCtx) {
        const cell = dataCtx[cellId];
 
        if (cell.trueValue) { // true values überspringen
          continue;
        }
 
        let wildcards = [1,2,3,4,5,6,7,8,9];
 
        for(const otherId in dataCtx) {
          const other = dataCtx[otherId];
 
          if (!other.trueValue) continue; //just processing with filled cells
 
          const val = Number(other.trueValue);
 
          // Subgrid Check
          const sameSubGrid =
            other.subgrid[0] === cell.subgrid[0] && 
            other.subgrid[1] === cell.subgrid[1];
 
          if (sameSubGrid) {
            wildcards = wildcards.filter(n => n !== val);
            continue;
          }
 
          // global Row Check
          if (other.globalRow === cell.globalRow) {
            wildcards = wildcards.filter(n => n !== val);
            continue;
          }
 
          // global Col Check
          if (other.globalCol === cell.globalCol) {
            wildcards = wildcards.filter(n => n !== val);
            continue;
          }
        }
 
        cell.wildcards = wildcards; //give all cells the wildcard to proceed in innerCleanup properly
        cell.validValue = wildcards;
      }
        */
    }
    }

    export function subgridRule (cell, dataCtx, wildcards) {
      for (const id in dataCtx) {
        const other = dataCtx[id];

        const sameSubgrid =
          other.subgrid[0] === cell.subgrid[0] &&
          other.subgrid[1] === cell.subgrid[1];

        if (sameSubgrid && other.trueValue) {
          const v = Number(other.trueValue);
          wildcards = wildcards.filter(n => n !== v);
        }
      }
      return wildcards;
    }

    export function globalRowRule(cell, dataCtx, wildcards) {
      for (const id in dataCtx) {
        const other = dataCtx[id];
    
        if (other.globalRow === cell.globalRow && other.trueValue) {
          const v = Number(other.trueValue);
          wildcards = wildcards.filter(n => n !== v);
        }
      }
      return wildcards;
    }

    export function globalColRule(cell, dataCtx, wildcards) {
      for (const id in dataCtx) {
        const other = dataCtx[id];
    
        if (other.globalCol === cell.globalCol && other.trueValue) {
          const v = Number(other.trueValue);
          wildcards = wildcards.filter(n => n !== v);
        }
      }
      return wildcards;
    }

    export function nakedSinglesRound(dataCtx) {
      let anyNewSingles = false;

      for (const id in dataCtx) {
        const cell = dataCtx[id];

        if (!cell.trueValue && cell.validValue.length === 1) {
          cell.trueValue = cell.validValue[0];
          anyNewSingles = true;
        }
      }
      return anyNewSingles;
    }

    export function hiddenSinglesRound(dataCtx) {
    let anySet = false;

    // Helper: Ein Bucket-Objekt für 1–9 anlegen
    function makeBuckets() {
        return {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]};
    }

    //
    // 1. SUBGRID
    //
    {
        const grids = {};

        // Buckets pro Subgrid vorbereiten
        for (const id in dataCtx) {
            const cell = dataCtx[id];
            if (!cell.trueValue) {
                const key = `${cell.subgrid.row}-${cell.subgrid.col}`;
                if (!grids[key]) grids[key] = makeBuckets();
                for (const v of cell.validValue) grids[key][v].push(id);
            }
        }

        // Hidden Singles erkennen
        for (const key in grids) {
            const bucket = grids[key];
            for (let v = 1; v <= 9; v++) {
                if (bucket[v].length === 1) {
                    const id = bucket[v][0];
                    const cell = dataCtx[id];
                    if (!cell.trueValue) {
                        cell.trueValue = v;
                        anySet = true;
                    }
                }
            }
        }
    }

    //
    // 2. ROWS
    //
    {
        const rows = {};

        for (const id in dataCtx) {
            const cell = dataCtx[id];
            if (!cell.trueValue) {
                const r = cell.row;
                if (!rows[r]) rows[r] = makeBuckets();
                for (const v of cell.validValue) rows[r][v].push(id);
            }
        }

        for (const r in rows) {
            const bucket = rows[r];
            for (let v = 1; v <= 9; v++) {
                if (bucket[v].length === 1) {
                    const id = bucket[v][0];
                    const cell = dataCtx[id];
                    if (!cell.trueValue) {
                        cell.trueValue = v;
                        anySet = true;
                    }
                }
            }
        }
    }

    //
    // 3. COLUMNS
    //
    {
        const cols = {};

        for (const id in dataCtx) {
            const cell = dataCtx[id];
            if (!cell.trueValue) {
                const c = cell.col;
                if (!cols[c]) cols[c] = makeBuckets();
                for (const v of cell.validValue) cols[c][v].push(id);
            }
        }

        for (const c in cols) {
            const bucket = cols[c];
            for (let v = 1; v <= 9; v++) {
                if (bucket[v].length === 1) {
                    const id = bucket[v][0];
                    const cell = dataCtx[id];
                    if (!cell.trueValue) {
                        cell.trueValue = v;
                        anySet = true;
                    }
                }
            }
        }
    }
window.alert("h");
    return anySet;
    
}


    /*
    export function nakedTrueRule(cell, dataCtx, wildcards) {
       // Subgrid-Key bestimmen
      const sgRow = cell.subgrid[0];
      const sgCol = cell.subgrid[1];

      // Alle naked Singles im Subgrid sammeln
      const nakedSingles = new Set();

      for (const id in dataCtx) {
        const other = dataCtx[id];

        const sameSubgrid =
          other.subgrid[0] === sgRow &&
          other.subgrid[1] === sgCol;

        if (!sameSubgrid) continue;

        if (Array.isArray(other.validValue) && other.validValue.length === 1) {
          nakedSingles.add(other.validValue[0]);
        }
      }

      // Wenn keine Singles → wildcards unverändert zurückgeben
      if (nakedSingles.size === 0) return wildcards;

      // Die nackten Singles sollen aus den Wildcards entfernt werden,
      // aber NUR wenn die aktuelle Zelle selbst kein Single ist.
      if (wildcards.length > 1) {
        wildcards = wildcards.filter(v => !nakedSingles.has(v));
      }
      console.log("hallo");
      return wildcards;
      
    }*/
/*
    export function innerClearityRule(cell, dataCtx, wildcards) {
      const subgridCells = Object.values(dataCtx).filter(c =>
        c.subgrid === cell.subgrid && (c.trueValue === null || c.trueValue === undefined)
      );

      const frequency = new Map();

      for (const sc of subgridCells) {
        const wc = sc.validValue ?? [];
        for (const w of wc) {
          frequency.set(w, (frequency.get(w) || 0) +1);
        }
      }

      //naked Trues
      const singletons = subgridCells
        .filter(sc => (sc.validValue?.length === 1))
        .map(sc => sc.validValue[0]);

        if (singletons.length > 0) {
          wildcards = wildcards.filter(w => !singletons.includes(w) || frequency.get(w) === 1);
        }

      //hidden trues
      const uniqueCandidates = [...frequency.entries()]
        .filter(([_, count]) => count === 1)
        .map(([num]) => num);

        if (uniqueCandidates.length > 0) {
          const intersecting = wildcards.filter(w => uniqueCandidates.includes(w));

          if (intersecting.length > 0) {
            return intersecting;
          } 
        }
        console.log("funktion ende");
        return wildcards;
    }
 
    export function innerCleanup(dataCtx) {
      let changed = false;
 
      for (const cellId in dataCtx) {
        
        
        const cell = dataCtx[cellId];
 
        if (!cell.trueValue && cell.wildcards && cell.wildcards.length === 1) {
          //const val = cell.wildcards[0]; //take the last wildard

          cell.trueValue = cell.wildcards[0];

          console.log("Wert von", cellId + ": " + cell.trueValue);

          cell.wildcards = [];
          changed = true;
 
          for (const otherId in dataCtx) {
            if (otherId === cellId) continue;
 
            const other = dataCtx[otherId];
 
            if (other.trueValue) continue;
 
            const sameRow = other.row === cell.row;
            const sameCol = other.col === cell.col;
            const sameSubGrid = other.subgrid === cell.subgrid;
 
            if (sameRow || sameCol || sameSubGrid) {
              const idx = other.wildcards.indexOf(cell.wildcards[0]);
 
              if (idx !== -1) {
                other.wildcards.splice(idx, 1);
                changed = true;
              }
            }
          }
        }
      }
      return changed;
    }
      */
 
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
 
      for (const id in testValues) { //write into grid
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
 
    document.getElementById('colorCells').addEventListener('click', () => {
      updateGridTrues(window.sudokuCellContext);
    });
 
    
