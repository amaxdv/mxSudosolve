import { resetTable } from './sudoku.js';
import { introMsg, demoMsg1, demoMsg2, demoMsg3, logCandidates } from './userexp.js';


document.addEventListener("DOMContentLoaded", () => {
    introMsg();
});

// === Buttons used in UI ===
  
  // ++ Insert Data ++
  document.getElementById('prepareButton').addEventListener('click', () => {
    const demo = document.getElementById('demoRadio').checked;
    const custom = document.getElementById('customRadio').checked;

    const enabledCells = document.querySelectorAll('.subgrid input');
      enabledCells.forEach(inputCell => {
      inputCell.disabled = false;
      });

    takeofButton.disabled = false;
    prepareButton.disabled = true;

    if (demo) {
      testSetup();

      demoMsg1(); // UX Component 
    }

    if (custom) {
      window.alert("Eingabe freigegeben. Bitte übertrage die Werte aus dem Sudoku, das du lösen willst, exakt in die entsprechenden Zellen des App-Rasters.");
    }
  });

  

  // ++ read Data ++
  document.getElementById('takeofButton').addEventListener('click', () => {
    const demo = document.getElementById('demoRadio').checked;
    const custom = document.getElementById('customRadio').checked;

    if (demo) {
      demoMsg2();
    }

    scanGrid();

    const dataCtx = window.sudokuCellContext;
    readPresets(dataCtx);

    resetTable(); // imported

    solveButton.disabled = false;
    takeofButton.disabled = true;
  });

  // ++ Solve Riddle ++
  document.getElementById('solveButton').addEventListener('click', () => {
    const demo = document.getElementById('demoRadio').checked;
    const custom = document.getElementById('customRadio').checked;

    if (demo) {
      demoMsg3();
    }

    const dataCtx = window.sudokuCellContext;
    solverAlgorithm(dataCtx);

    resetTable(); // imported
  });

// === Functions ===
  export function testSetup() {
      const testValues = {
        /*
        //Very Hard
        "00A": null, "00B": 7, "00C": null, "00D": null, "00E": 2, "00F": 4, "00G": null, "00H": null, "00I": null,
        "01A": null, "01B": null, "01C": null, "01D": null, "01E": null, "01F": null, "01G": null, "01H": 3, "01I": 6,
        "02A": 1, "02B": null, "02C": 9, "02D": null, "02E": 6, "02F": null, "02G": null, "02H": null, "02I": null,

        "10A": null, "10B": 6, "10C": null, "10D": 9, "10E": null, "10F": null, "10G": 8, "10H": null, "10I": 2,
        "11A": null, "11B": null, "11C": 9, "11D": null, "11E": 8, "11F": null, "11G": 6, "11H": null, "11I": null,
        "12A": 8, "12B": null, "12C": 2, "12D": null, "12E": null, "12F": 5, "12G": null, "12H": 1, "12I": null,

        "20A": null, "20B": null, "20C": null, "20D": null, "20E": 1, "20F": null, "20G": 4, "20H": null, "20I": 5,
        "21A": 4, "21B": 6, "21C": null, "21D": null, "21E": null, "21F": null, "21G": null, "21H": null, "21I": null,
        "22A": null, "22B": null, "22C": null, "22D": 7, "22E": 4, "22F": null, "22G": null, "22H": 9, "22I": null
        */
        
        //Easy
        "00A": 8,   "00B": 7,   "00C": null, "00D": 2,  "00E": null, "00F": null, "00G": 5,   "00H": 3,   "00I": null,
        "01A": null,"01B": null,"01C": null,"01D": 6,   "01E": null, "01F": 5,   "01G": null,"01H": null,"01I": null,
        "02A": 6,   "02B": 4,   "02C": null,"02D": null,"02E": null, "02F": null,"02G": 9,   "02H": null,"02I": null,

        "10A": 7,   "10B": null,"10C": null,"10D": null,"10E": null, "10F": null,"10G": null,"10H": null,"10I": 3,
        "11A": 4,   "11B": null,"11C": null,"11D": 2,   "11E": 7,   "11F": 3,   "11G": null,"11H": null,"11I": 8,
        "12A": 5,   "12B": null,"12C": null,"12D": null,"12E": null, "12F": null,"12G": null,"12H": null,"12I": 6,

        "20A": null,"20B": null,"20C": 5,   "20D": null,"20E": null, "20F": null,"20G": null,"20H": 1,   "20I": 7,
        "21A": null,"21B": null,"21C": null,"21D": 1,   "21E": null, "21F": 9,   "21G": null,"21H": null,"21I": null,
        "22A": null,"22B": 6,   "22C": 3,   "22D": null,"22E": null, "22F": 8,   "22G": null,"22H": 9,   "22I": 2
        

        /*
        //Template
        "00A": null, "00B": null, "00C": null, "00D": null, "00E": null, "00F": null, "00G": null, "00H": null, "00I": null,
        "01A": null, "01B": null, "01C": null, "01D": null, "01E": null, "01F": null, "01G": null, "01H": null, "01I": null,
        "02A": null, "02B": null, "02C": null, "02D": null, "02E": null, "02F": null, "02G": null, "02H": null, "02I": null,

        "10A": null, "10B": null, "10C": null, "10D": null, "10E": null, "10F": null, "10G": null, "10H": null, "10I": null,
        "11A": null, "11B": null, "11C": null, "11D": null, "11E": null, "11F": null, "11G": null, "11H": null, "11I": null,
        "12A": null, "12B": null, "12C": null, "12D": null, "12E": null, "12F": null, "12G": null, "12H": null, "12I": null,

        "20A": null, "20B": null, "20C": null, "20D": null, "20E": null, "20F": null, "20G": null, "20H": null, "20I": null,
        "21A": null, "21B": null, "21C": null, "21D": null, "21E": null, "21F": null, "21G": null, "21H": null, "21I": null,
        "22A": null, "22B": null, "22C": null, "22D": null, "22E": null, "22F": null, "22G": null, "22H": null, "22I": null
        */
      };
 
      for (const id in testValues) { //write into grid
        const input = document.querySelector(`input[data-id="${id}"]`);
        if (input) {
          input.value = testValues[id];
        }
      }
    }
 
  export function scanGrid() {
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

      console.log("Sudoku: Scan abgeschlossen."); 
  }
 
  export function updateGridPresets(cellId, presetValue) {
    const cell = document.querySelector(`input[data-id="${cellId}"]`); 

    if (presetValue === null) { 
        cell.classList.remove('preset');
        cell.disabled = false;
    } else {
        cell.classList.add('preset');
        cell.disabled = true;
        cell.value = presetValue;
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

  export function solverAlgorithm(dataCtx) {
    
    const tracking = createTracking();

    let { filledTrue, emptyTrue } = countTrueValues(dataCtx); //initialize control-values
    let lastFilled = filledTrue;

    while (emptyTrue > 0) { //performing the solving-functions as long there are empty true values
      
      tracking.iterations++;
      
      wildcardExclusion(dataCtx); // eliminate not possible values
      nakedSingles(dataCtx); // crawl remaining values for direct unique values
      hiddenSingles(dataCtx); // crawl remaining values for indirect unique values by logically exclusion

      //nakedPairs(dataCtx);
      //nakedSingles(dataCtx);

      //bruteForce(dataCtx);

      updateGridTrues(dataCtx); //write found values back to grid and visualize

      ({ filledTrue, emptyTrue } = countTrueValues(dataCtx)); //checking control values

      // --- Evaluation possible Results ABCD ---
      if (emptyTrue === 0) { // complete (no emptys left)

        // setze Endzeit bevor du die Dauer abfragst
        tracking.endTime = performance.now();
        const durationMs = (tracking.endTime - tracking.startTime);
        const durationStr = Number(durationMs).toFixed(2);

        if (isSudokuValid(dataCtx)) { // (A) complete and correct
          printFinalReport(tracking, "Vollständig und korrekt. Sudoku gelöst.");
          //console.log("A - Vollständig und korrekt. Sudoku gelöst.");
          //console.log(`Iterationen: ${tracking.iterations}, Zeit: ${tracking.duration.toFixed(2)} ms`);

        } else { // (B) complete but incorrect
          printFinalReport(tracking, "Vollständig, aber nicht korrekt. Bitte Presets prüfen.");
          //console.log("B - Vollständig, aber nicht korrekt. Bitte Presets prüfen.");
          //console.log(`Iterationen: ${tracking.iterations}, Zeit: ${tracking.duration.toFixed(2)} ms`);
        }
        //console.log(`Iterationen: ${tracking.iterations}, Zeit: ${durationStr} ms`);
        break;
      }
      
      if (filledTrue === lastFilled) { // Not complete (no changes between the last two iterations)
        
        // setze Endzeit bevor du die Dauer abfragst
        tracking.endTime = performance.now();
        const durationMs = (tracking.endTime - tracking.startTime);
        const durationStr = Number(durationMs).toFixed(2);

        if (isSudokuConsistent(dataCtx)) { // ..(C) not complete but consistent
          printFinalReport(tracking, "Unvollständig, aber korrekt. (keine weiteren logischen Schritte möglich)");
          //console.log("C - Unvollständig, aber korrekt. (keine weiteren logischen Schritte möglich)");
          //console.log(`Iterationen: ${tracking.iterations}, Zeit: ${tracking.duration.toFixed(2)} ms`);

        } else { // ..(D) not complete and inconsistent
          printFinalReport(tracking, "Unvollständig und nicht korrekt. (inkonsistente Eingaben oder Fehler)");
          //console.log("D - Unvollständig und nicht korrekt. (inkonsistente Eingaben oder Fehler)");
          //console.log(`Iterationen: ${tracking.iterations}, Zeit: ${tracking.duration.toFixed(2)} ms`);
        } 
        //console.log(`Iterationen: ${tracking.iterations}, Zeit: ${durationStr} ms`);
        break;
      }

      
        /*
        if (filledTrue === lastFilled) { //stop if no new trues available
          logCandidates(dataCtx);
          window.alert("Keine weiteren logischen Schritte möglich. BruteForce noch nicht implementiert.");
          break;
        }

        if (emptyTrue === 0) { //stop if there are no emptys left

          if (isSudokuValid(dataCtx)) {
            //logCandidates(dataCtx);
            //window.alert("Sudoku vollständig gelöst und korrekt.");
          } else {
            //logCandidates(dataCtx);
            window.alert("Gitter vollständig gefüllt, aber ungültig. Bitte Presets überprüfen.");
          }
          logCandidates(dataCtx);
          break;
        }
        */

      lastFilled = filledTrue; //updating the control value
    }
  }

    export function createTracking() {
      return {
        iterations: 0,
        startTime: performance.now(),
        endTime: null,
        get duration() {
          return (this.endTime !== null) ? (this.endTime - this.startTime) : null;
        }
      };
    }

    export function printFinalReport(tracking, message) {
      const durationMs = Number(tracking.endTime - tracking.startTime).toFixed(2);
      const iterations = tracking.iterations;

      console.log("=== Abschlussbericht ===");
      console.log(`Ergebnis: ${message}`);
      console.log(`Dauer: ${durationMs} ms`);
      console.log(`Gefüllte Zellen: -`);
      console.log("Begründung: -");
      console.log("Hinweis: -");
      console.log("--- Zusammenfassung ---");
      console.log(`Iterationen: ${iterations}`);
      console.log("Wildcard Exclusion: noch nicht getrackt");
      console.log("Naked Singles: noch nicht getrackt");
      console.log("Hidden Singles: noch nicht getrackt");
      console.log("Naked Pairs: noch nicht implementiert");
      console.log("Hidden Pairs: noch nicht implementiert");
      console.log("Brute Force: noch nicht implementiert");
    }

    export function wildcardExclusion(dataCtx) {
  
        //console.log("++ wildcards ++");

        for (const id in dataCtx) {
          const cell = dataCtx[id];
        
        if (cell.trueValue !== null && cell.trueValue !== undefined && cell.trueValue !== "") {
          cell.validValue = [];
          continue;
        }
  
        let wildcards = [1,2,3,4,5,6,7,8,9]; // potencial unique values
  
        //scanning for uniquness in:
        wildcards = subgridRule(cell, dataCtx, wildcards); // subgrid
        wildcards = globalRowRule(cell, dataCtx, wildcards); // gloabal rows
        wildcards = globalColRule(cell, dataCtx, wildcards); // global cols
  
        cell.validValue = wildcards;
        }
      }
  
        export function subgridRule (cell, dataCtx, wildcards) {
          //console.log("++ subgrid rule ++");
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
          //console.log("++ rows rule ++");
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
          //console.log("++ cols rule ++");
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
        const key = `${cell.subgrid[0]}-${cell.subgrid[1]}`;
 
        if (!cell.trueValue && Array.isArray(cell.validValue) && cell.validValue.length === 1) {
            cell.trueValue = cell.validValue[0];
            cell.validValue = []; 
            changed = true;
        }
        //console.log(`Naked Single im Subgrid ${key}:`,`→ ${cell.validValue}`);
      }
      cleaningValids(dataCtx);
      return changed;
    }
 
    export function hiddenSingles(dataCtx) {
      const subgrids = {}; // build a subgrid
        for (const id in dataCtx) { 
            const cell = dataCtx[id];
            const key = `${cell.subgrid[0]}-${cell.subgrid[1]}`;
    
            if (!subgrids[key]) subgrids[key] = [];
            subgrids[key].push({ id, cell });
        }
  
      let changed = false;
  
      for (const key in subgrids) { // check every subrgid
        const group = subgrids[key];
  
      const freq = {}; // count candidates (freq = { 1:[ids], 2:[ids], ... })
        for (const { id, cell } of group) {
          if (cell.trueValue) continue;
          if (!Array.isArray(cell.validValue)) continue;

          for (const v of cell.validValue) {
              if (!freq[v]) freq[v] = [];
              freq[v].push(id);  
          }
        }
  
        for (let digit = 1; digit <= 9; digit++) { // find hidden singles
          const ids = freq[digit];
            if (!ids) continue;
            if (ids.length !== 1) continue;

          const targetId = ids[0];
          const target = dataCtx[targetId];

          target.trueValue = digit;
          target.validValue = [];

          changed = true;

          console.log(`Hidden Single im Subgrid ${key}:`,`${digit} → ${targetId}`);
        }
      }
      cleaningValids(dataCtx);
      return changed;
    }

    export function cleaningValids(dataCtx) {
      const subgrids = {};

      for (const id in dataCtx) {
        const cell = dataCtx[id];
        const key = `${cell.subgrid[0]}-${cell.subgrid[1]}`;

        if (!subgrids[key]) subgrids[key] = [];
        subgrids[key].push({ id, cell });
      }

      let changed = false;

      for (const key in subgrids) {
        const group = subgrids[key];

        const placedValues = group.filter(entry => entry.cell.trueValue).map(entry => entry.cell.trueValue);

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

    export function updateGridTrues(dataCtx) {
      for (const cellId in dataCtx) {
        const cellData = dataCtx[cellId];
        const input = document.querySelector(`input[data-id="${cellId}"]`);
    
        if (!input) continue;

        if (cellData.presetValue !== null && cellData.presetValue !== undefined) { // spare presets
          continue;
        }
 
        if (cellData.trueValue !== null && cellData.trueValue !== undefined) { // write values
          input.value = cellData.trueValue;
          input.classList.add("solved");
          input.disabled = true;
        } else {
          input.value = "";
          input.classList.remove("solved");
        }
      }
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
 
    // checking if complete sudoku is valid
    export function isSudokuValid(dataCtx) { // +++ hardcoded 3x3 range +++
      
      const grid = Array.from({ length: 9 }, () => Array(9).fill(null)); // generate Array (hardcoded 3x3 range) and initilize with "null"
 
      for (const cell of Object.values(dataCtx)) { // fill with true values
        const row = Number(cell.globalRow);
        const col = Number(cell.globalCol);
        const val = cell.trueValue;
 
        if (grid[row][col] !== null) { // check consistency of grid
          console.warn('isSudokuValid: Doppelbelegung an Position', row, col);
          return false;
        }
 
        const valNum = Number(val); // ensure val is numeric
        if (!Number.isInteger(valNum) || valNum < 1 || valNum > 9) return false;
 
        grid[row][col] = valNum;
      }
 
      for (let row = 0; row < 9; row++) { // check rows
        if (!isUnitValid(grid[row])) return false; // calling validation for row
      }
 
      for (let col = 0; col < 9; col++) { // check cols
        const cols = [];
        for (let row = 0; row < 9; row++) cols.push(grid[row][col]);
        if (!isUnitValid(cols)) return false; // calling validation for col
      }
 
      for (let subRow = 0; subRow < 3; subRow++) { // check subgrids (hardcoded)
        for (let subCol = 0; subCol < 3; subCol++) {
          const subGrid = [];
          for (let row = subRow * 3; row < subRow * 3 + 3; row++) {
            for (let col = subCol * 3; col < subCol * 3 + 3; col++) {
              subGrid.push(grid[row][col]);
            }
          }
          if (!isUnitValid(subGrid)) return false; // calling validation for subgrid
        }
      }
      return true;
    }
 
    export function isUnitValid(unit) { // validate the recieved Element
      if (!Array.isArray(unit) || unit.length !== 9) return false;
 
      const seen = new Set();
 
      for (const value of unit) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 9) return false;
        seen.add(value);
      }
      return seen.size === 9;
    }

    //Checking if incomplete Sudoku is valid
   export function isSudokuConsistent(dataCtx) {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(null));

    for (const cell of Object.values(dataCtx)) {
        const row = Number(cell.globalRow);
        const col = Number(cell.globalCol);
        const val = cell.trueValue;

        if (val === null || val === undefined || val === "") {
            continue; // Lücken sind erlaubt!
        }

        const valNum = Number(val);
        if (!Number.isInteger(valNum) || valNum < 1 || valNum > 9) return false;

        // Prüfe Doppelbelegung im Grid
        if (grid[row][col] !== null) return false;
        grid[row][col] = valNum;
    }

    // Zeilen / Spalten / Blöcke prüfen auf Regelverletzungen (mit Lücken erlaubt)
    const checkUnit = (unit) => {
        const seen = new Set();
        for (const v of unit) {
            if (v === null) continue;  // Lücken ignorieren
            if (seen.has(v)) return false;  // doppelt -> Fehler
            seen.add(v);
        }
        return true;
    };

    // rows
    for (let r = 0; r < 9; r++) {
        if (!checkUnit(grid[r])) return false;
    }

    // cols
    for (let c = 0; c < 9; c++) {
        const col = [];
        for (let r = 0; r < 9; r++) col.push(grid[r][c]);
        if (!checkUnit(col)) return false;
    }

    // subgrids
    for (let subR = 0; subR < 3; subR++) {
        for (let subC = 0; subC < 3; subC++) {
            const block = [];
            for (let r = subR * 3; r < subR * 3 + 3; r++) {
                for (let c = subC * 3; c < subC * 3 + 3; c++) {
                    block.push(grid[r][c]);
                }
            }
            if (!checkUnit(block)) return false;
        }
    }

    return true;
} 


//=== Buttons Hidden for Debugging ===
/*
  document.getElementById('trueVals').addEventListener('click', () => {

    const dataCtx = window.sudokuCellContext;
    wildcardExclusion(dataCtx);

    resetTable();
  });

  document.getElementById('nakedSingle').addEventListener('click', () => {
    
    const dataCtx = window.sudokuCellContext;
    nakedSingles(dataCtx);

    resetTable();
  });

  document.getElementById('hiddenSingle').addEventListener('click', () => {
    
    const dataCtx = window.sudokuCellContext;
    hiddenSingles(dataCtx);

    resetTable();
  });

  document.getElementById('colorCells').addEventListener('click', () => {
    
    const dataCtx = window.sudokuCellContext;
    updateGridTrues(dataCtx);
  });
  */