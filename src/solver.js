import { buildTable, resetTable } from './sudoku.js';

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
    }

    if (custom) {
      window.alert("Eingabe freigegeben - bitte vorgegebene Werte übertragen.");
    }
  });

  // ++ read Data ++
  document.getElementById('takeofButton').addEventListener('click', () => {
    
    scanGrid();

    const dataCtx = window.sudokuCellContext;
    readPresets(dataCtx);

    resetTable(); // imported

    solveButton.disabled = false;
    takeofButton.disabled = true;
  });

  // ++ Solve Riddle ++
  document.getElementById('solveButton').addEventListener('click', () => {
    
    const dataCtx = window.sudokuCellContext;
    solverAlgorithm(dataCtx);

    resetTable(); // imported
  });

// === Functions ===
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
    let { filledTrue, emptyTrue } = countTrueValues(dataCtx); //initialize control-values
    let lastFilled = filledTrue;

    while (emptyTrue > 0) { //performing the solving-functions as long there are empty true values
      wildcardExclusion(dataCtx); // eliminate not possible values
      nakedSingles(dataCtx); // crawl remaining values for direct unique values
      hiddenSingles(dataCtx); // crawl remaining values for indirect unique values by logically exclusion
      updateGridTrues(dataCtx); //write found values back to grod and visualize

      ({ filledTrue, emptyTrue } = countTrueValues(dataCtx)); //checking control values

        if (filledTrue === lastFilled) { //stop if no new trues available
          window.alert("Keine weiteren logischen Schritte möglich. BruteForce noch nicht implementiert.");
          break;
        }

        if (emptyTrue === 0) { //stop if there are no emptys left

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

    export function wildcardExclusion(dataCtx) {
  
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
            cell.validValue = []; 
            changed = true;
        }
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

//=== Buttons Hidden for Debugging ===
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