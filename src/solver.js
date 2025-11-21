import { buildTable, resetTable } from './sudoku.js';

    // === crawling through grid ===
    export function scanGrid() {
 
        // +++ data sources +++
        const dataCtx = window.sudokuCellContext; // get window-object
        const allCells = document.querySelectorAll('.subgrid input'); // gathering inputs from subgrid
 
        allCells.forEach(inputCell => { // going through all inputs and..
            const cellValue = inputCell.value; // ..read the value and..
            const cellId = inputCell.dataset.id; // ..read the dataset.id and..
 
            let presetValue = null;
 
            const num = Number(cellValue);
 
            if (Number.isInteger(num) && num >= 1 && num <= 9) {
              presetValue = num;
            } 
 
            dataCtx[cellId].presetValue = presetValue;
 
            updateGridPresets(cellId, presetValue);
        });
 
        resetTable(); // clear the table
 
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

      cell.validValue = wildcards;

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

    export function nakedSingles(dataCtx) {
      let changed = false;

      for (const id in dataCtx) {
        const cell = dataCtx[id];

        if (!cell.trueValue && Array.isArray(cell.validValue) && cell.validValue.length === 1) {
            cell.trueValue = cell.validValue[0];
            cell.validValue = []; // nach festlegung keine Kandidaten mehr
            changed = true;
        }
      }
      cleaningValids(dataCtx);
      return changed;
    }

    export function hiddenSingles(dataCtx) {
    const subgrids = {};

    // 1. Subgrids mit IDs aufbauen
    for (const id in dataCtx) {
        const cell = dataCtx[id];
        const key = `${cell.subgrid[0]}-${cell.subgrid[1]}`;

        if (!subgrids[key]) subgrids[key] = [];
        subgrids[key].push({ id, cell });
    }

    let changed = false;

    // 2. Jedes Subgrid prüfen
    for (const key in subgrids) {
        const group = subgrids[key];

        // a) Kandidatenzählung
        const freq = {};  
        // freq = { 1:[ids], 2:[ids], ... }

        for (const { id, cell } of group) {
            if (cell.trueValue) continue;
            if (!Array.isArray(cell.validValue)) continue;

            for (const v of cell.validValue) {
                if (!freq[v]) freq[v] = [];
                freq[v].push(id);  // merken, wo der Kandidat vorkommt
            }
        }

        // b) Hidden Singles finden
        for (let digit = 1; digit <= 9; digit++) {
            const ids = freq[digit];
            if (!ids) continue;
            if (ids.length !== 1) continue;

            // Hidden Single gefunden
            const targetId = ids[0];
            const target = dataCtx[targetId];

            target.trueValue = digit;
            target.validValue = [];

            changed = true;

            console.log(
                `Hidden Single im Subgrid ${key}:`,
                `${digit} → ${targetId}`
            );
        }
    }
    cleaningValids(dataCtx);
    return changed;
}


    export function cleaningValids(dataCtx) {
      const subgrids = {};

    // Subgrids sammeln, aber diesmal id mitnehmen
    for (const id in dataCtx) {
        const cell = dataCtx[id];
        const key = `${cell.subgrid[0]}-${cell.subgrid[1]}`;

        if (!subgrids[key]) subgrids[key] = [];
        subgrids[key].push({ id, cell });
    }

    let changed = false;

    for (const key in subgrids) {
        const group = subgrids[key];

        const placedValues = group
            .filter(entry => entry.cell.trueValue)
            .map(entry => entry.cell.trueValue);

        for (const { id, cell } of group) {

            if (cell.trueValue || !Array.isArray(cell.validValue)) continue;

            const original = [...cell.validValue];

            cell.validValue = cell.validValue.filter(v => !placedValues.includes(v));

            if (cell.validValue.length !== original.length) {
                changed = true;

                const removed = original.filter(v => !cell.validValue.includes(v));
                console.log(id, ": entfernte:", removed);
            }
        }
    }

    return changed;
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
 
      for (const id in testValues) { //write into grid
        const input = document.querySelector(`input[data-id="${id}"]`);
        if (input) {
          input.value = testValues[id];
        }
      }
    }

    export function solverAlgorithm(dataCtx) {
    let changed = false;

      // 1. wildcardExclusion
      if (typeof wildcardExclusion === "function") {
          if (wildcardExclusion(dataCtx)) changed = true;
      }

      // 2. nakedSingles
      if (nakedSingles(dataCtx)) changed = true;

      // 3. hiddenSingles
      if (hiddenSingles(dataCtx)) changed = true;

      // 4. updateGridTrues (schreibt die trueValues in die Inputs)
      if (typeof updateGridTrues === "function") {
          updateGridTrues(dataCtx);
          // updateGridTrues gibt meist kein changed zurück – das ist okay.
      }

      // 5. Sudoku-Fertigkeitsprüfung (Platzhalter)
      /*
      if (typeof checkSudokuCompleted === "function") {
          const solved = checkSudokuCompleted(dataCtx);
          if (solved) console.log("Sudoku vollständig gelöst.");
      } else {
          console.log("checkSudokuCompleted() fehlt noch.");
      }*/

      return changed;
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

      const dataCtx = window.sudokuCellContext;
 
      readPresets(dataCtx);

      resetTable();
 
      trueVals.disabled = false;
 
    });
 
    document.getElementById('trueVals').addEventListener('click', () => {
      sudokuMode = "searching Truth";
      sudokuModeDisplay.textContent = sudokuMode;
 
      const dataCtx = window.sudokuCellContext;
      wildcardExclusion(dataCtx);

      resetTable();
    });

    document.getElementById('nakedSingle').addEventListener('click', () => {
      sudokuMode = "naked";
      sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      nakedSingles(dataCtx);

      resetTable();
    });

    document.getElementById('hiddenSingle').addEventListener('click', () => {
      sudokuMode = "hidden";
      sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      hiddenSingles(dataCtx);

      resetTable();
    });
 
    document.getElementById('colorCells').addEventListener('click', () => {
      sudokuMode = "color";
      sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      updateGridTrues(dataCtx);
    });

    document.getElementById('solverAlgorithm').addEventListener('click', () => {
      sudokuMode = "solving";
      sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      const changed = solverAlgorithm(dataCtx);
      resetTable();

      console.log("Solver-Step fertig. Changes?", changed);
    });
 
    
