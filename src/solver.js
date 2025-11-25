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
    
      let { filledTrue, emptyTrue } = countTrueValues(dataCtx); //initialize control-values
      let lastFilled = filledTrue;

      while (emptyTrue > 0) { //performing the solving-functions as long there are empty true values
        wildcardExclusion(dataCtx); 
        nakedSingles(dataCtx);
        hiddenSingles(dataCtx);
        updateGridTrues(dataCtx);

        ({ filledTrue, emptyTrue } = countTrueValues(dataCtx)); //checking control values

          if (filledTrue === lastFilled) { //stop if no new trues available
            window.alert("Keine weiteren logischen Schritte möglich. BruteForce noch nicht implementiert.");
            break;
          }

          if (emptyTrue === 0) { //stop if there are no emptys left
            //window.alert("Glückwunsch - Sudoku vollständig gelöst!");

            if (isSudokuValid(dataCtx)) {
              window.alert("Sudoku vollständig gelöst und korrekt.");
            } else {
              window.alert("Gitter vollständig gefüllt, aber ungültig. Bitte Presets überprüfen.");
            }
            break;
          }

        lastFilled = filledTrue; //updating the control value
      }
    }

    // Prüft, ob ein Array mit 9 Elementen genau die Zahlen 1..9 enthält
function isUnitValid(unit) {
  if (!Array.isArray(unit) || unit.length !== 9) return false;
  const seen = new Set();
  for (const v of unit) {
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 9) return false;
    seen.add(v);
  }
  return seen.size === 9;
}

/**
 * Prüft das Sudoku-Endgitter auf Korrektheit:
 * - baut intern ein 9x9-Grid aus dataCtx (unter Verwendung von globalRow/globalCol)
 * - prüft jede Row, Col, Subgrid auf 1..9 genau einmal
 *
 * dataCtx: object { id: { globalRow, globalCol, trueValue, ... }, ... }
 */
export function isSudokuValid(dataCtx) {
  if (!dataCtx || typeof dataCtx !== 'object') return false;

  // Erzeuge 9x9 Grid initialisiert mit null
  const grid = Array.from({ length: 9 }, () => Array(9).fill(null));

  // Fülle Grid mit trueValue aus dataCtx
  for (const cell of Object.values(dataCtx)) {
    const r = Number(cell.globalRow);
    const c = Number(cell.globalCol);
    const v = cell.trueValue;

    // Defensive checks: Indizes und value müssen vorhanden und gültig sein
    if (!Number.isInteger(r) || r < 0 || r > 8) {
      console.warn('isSudokuValid: ungültige globalRow für Zelle', cell);
      return false;
    }
    if (!Number.isInteger(c) || c < 0 || c > 8) {
      console.warn('isSudokuValid: ungültige globalCol für Zelle', cell);
      return false;
    }

    // Wenn value leer ist -> sofort ungültig (du rufst Validierung nur wenn emptyTrue===0, aber safety)
    if (v === null || v === undefined) {
      return false;
    }

    // Falls mehrere Zellen auf dieselbe Position fallen -> ungültig
    if (grid[r][c] !== null) {
      console.warn('isSudokuValid: Doppelbelegung an Position', r, c);
      return false;
    }

    // ensure numeric
    const num = Number(v);
    if (!Number.isInteger(num) || num < 1 || num > 9) return false;

    grid[r][c] = num;
  }

  // Prüfe Zeilen
  for (let r = 0; r < 9; r++) {
    if (!isUnitValid(grid[r])) return false;
  }

  // Prüfe Spalten
  for (let c = 0; c < 9; c++) {
    const col = [];
    for (let r = 0; r < 9; r++) col.push(grid[r][c]);
    if (!isUnitValid(col)) return false;
  }

  // Prüfe Subgrids 3x3
  for (let sgR = 0; sgR < 3; sgR++) {
    for (let sgC = 0; sgC < 3; sgC++) {
      const block = [];
      for (let r = sgR * 3; r < sgR * 3 + 3; r++) {
        for (let c = sgC * 3; c < sgC * 3 + 3; c++) {
          block.push(grid[r][c]);
        }
      }
      if (!isUnitValid(block)) return false;
    }
  }

  // alles ok
  return true;
}



    export function countTrueValues(dataCtx) {
    let filledTrue = 0;
    let emptyTrue = 0;

    for (const id in dataCtx) {
        if (dataCtx[id].trueValue != null) {
            filledTrue++;
        } else {
            emptyTrue++;
        }
    }
    console.log("Trues gefunden: ", filledTrue);
    console.log("Trues leer: ", emptyTrue)
    return { filledTrue, emptyTrue };
    }

    document.getElementById('solveButton').addEventListener('click', () => {
      //sudokuMode = "solving";
      //sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      //const changed = solverAlgorithm(dataCtx);
      solverAlgorithm(dataCtx);
      resetTable();

      //console.log("Solver-Step fertig. Changes?", changed);
    });

 
    // ==== Buttons to start action ====
    //export let sudokuMode = "idle";
 
    //const sudokuModeDisplay = document.getElementById("sudokuMode"); //Display actual mode
      //  sudokuModeDisplay.textContent = sudokuMode;
 
    document.getElementById('prepareButton').addEventListener('click', () => {
      //sudokuMode = "prep";
      //sudokuModeDisplay.textContent = sudokuMode;
 
      /*
      const enabledCells = document.querySelectorAll('.subgrid input'); 
        enabledCells.forEach(inputCell => {
          inputCell.disabled = false;
        });
 
      takeofButton.disabled = false;
      prepareButton.disabled = true;      
 
      testSetup();
      */

      const demo = document.getElementById('demoRadio').checked;
  const custom = document.getElementById('customRadio').checked;

  // Eingabe freigeben
  const enabledCells = document.querySelectorAll('.subgrid input');
  enabledCells.forEach(inputCell => {
    inputCell.disabled = false;
  });

  takeofButton.disabled = false;
  prepareButton.disabled = true;

  if (demo) {
    // Demo-Modus → sofort Testdaten laden
    testSetup();
  }

  if (custom) {
    // Custom-Modus → nur Eingabe freigeben, sonst nichts.
    // readPreset bleibt auf einem separaten Button.
    console.log("Custom-Modus aktiv, warte auf manuelle Eingabe.");
  }

});
 
  
 
    document.getElementById('takeofButton').addEventListener('click', () => {
      //sudokuMode = "scanGrid";
      //sudokuModeDisplay.textContent = sudokuMode;
      
      scanGrid();

      const dataCtx = window.sudokuCellContext;
 
      readPresets(dataCtx);

      resetTable();
 
      //trueVals.disabled = false;
      solveButton.disabled = false;
      takeofButton.disabled = true;
 
    });
 
    //++Invisble++
    document.getElementById('trueVals').addEventListener('click', () => {
      //sudokuMode = "searching Truth";
      //sudokuModeDisplay.textContent = sudokuMode;
 
      const dataCtx = window.sudokuCellContext;
      wildcardExclusion(dataCtx);

      resetTable();
    });

    document.getElementById('nakedSingle').addEventListener('click', () => {
      //sudokuMode = "naked";
      //sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      nakedSingles(dataCtx);

      resetTable();
    });

    document.getElementById('hiddenSingle').addEventListener('click', () => {
      //sudokuMode = "hidden";
      //sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      hiddenSingles(dataCtx);

      resetTable();
    });
 
    document.getElementById('colorCells').addEventListener('click', () => {
      //sudokuMode = "color";
      //sudokuModeDisplay.textContent = sudokuMode;
      
      const dataCtx = window.sudokuCellContext;
      updateGridTrues(dataCtx);
    });

    
 
    
