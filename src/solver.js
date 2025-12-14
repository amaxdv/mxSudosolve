import { resetTable } from './sudoku.js';
import { createTracking, applyTracking, printFinalReport } from './trackingdata.js';
import { introMsg, demoMsg1, demoMsg2, demoMsg3, startMsg, endMsg, msgResultA, msgResultB, msgResultC, msgResultD, unhideMessage, logCandidates } from './userexp.js';


document.addEventListener("DOMContentLoaded", () => {
    introMsg(); // show welcome Message
});

// === Buttons used in UI ===
  // ++ Button: Insert Data ++
  document.getElementById('prepareButton').addEventListener('click', () => {
    const demo = document.getElementById('demoRadio').checked; // start demo-mode

    const enabledCells = document.querySelectorAll('.subgrid input');
      enabledCells.forEach(inputCell => {
        inputCell.disabled = false;
        inputCell.style['background-color'] = '';
      });

    takeofButton.disabled = false;
    prepareButton.disabled = true;

    if (demo) {
      testSetup(); // load Demo-Data
      demoMsg1(); 
    } else {
      startMsg();
    }
  });

  // ++ Button: read Data ++
  document.getElementById('takeofButton').addEventListener('click', () => {
    const demo = document.getElementById('demoRadio').checked;
    
    if (demo) {
      demoMsg2();
    }

    scanGrid();

    const dataCtx = window.sudokuCellContext;
      
    window.solveMeta = { //tracking objects before initializing tracking
      presetsFound: 0,
      totalCells: 0
    };

    readPresets(dataCtx, window.solveMeta);

    resetTable();

    solveButton.disabled = false;
    takeofButton.disabled = true;
  });

  // ++ Button: Solve Riddle ++
  document.getElementById('solveButton').addEventListener('click', () => {
    const demo = document.getElementById('demoRadio').checked;

    const dataCtx = window.sudokuCellContext;
    const reportHtml = solverAlgorithm(dataCtx, window.solveMeta); // start algorithm and data-tracking

    if (demo) {
      demoMsg3(reportHtml);
      resetTable();
    } else {
      endMsg(reportHtml);
      resetTable();
    }

    solveButton.disabled = true;
    showReportButton.hidden = false;
  });

  // ++ Button: show report again ++
  document.getElementById('showReportButton').addEventListener('click', () => {
    unhideMessage();
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
    let presetsFound = 0; // tracking (presets)
    let totalCells = 0; // tracking (all available cells)

    for (const cellId in dataCtx) {
      totalCells++;
      const cell = dataCtx[cellId];

      if (cell.presetValue) {
        cell.trueValue = cell.presetValue;
        cell.validValue = [];

        presetsFound++;
      }
    }
    solveMeta.presetsFound = presetsFound;
    solveMeta.totalCells = totalCells;
  }

  export function solverAlgorithm(dataCtx, solveMeta = {}) {
    
    const tracking = createTracking(); // tracking
      Object.assign(tracking, solveMeta); // tracking (presets)

    let { filledTrue, emptyTrue } = countTrueValues(dataCtx); //initialize control-values
    let lastFilled = filledTrue;

    while (emptyTrue > 0) { //performing the solving-functions as long there are empty true values
      
      tracking.iterations++; // tracking (iterations)
      
      wildcardExclusion(dataCtx, tracking); // eliminate not possible values
      nakedSingles(dataCtx, tracking); // crawl remaining values for direct unique values
      hiddenSingles(dataCtx, tracking); // crawl remaining values for indirect unique values by logically exclusion
      //nakedPairs(dataCtx); // not yet implemented
      //nakedSingles(dataCtx); // not yet implemented
      //bruteForce(dataCtx); // not yet implemented

      updateGridTrues(dataCtx); //write found values back to grid and visualize

      ({ filledTrue, emptyTrue } = countTrueValues(dataCtx)); //checking control values

      // --- Evaluation possible Results ABCD ---
      if (emptyTrue === 0) { // complete (no emptys left): A & B
        tracking.filledCells = filledTrue; // tracking (filled cells)
        tracking.endTime = performance.now(); // tracking (duration) - set endtime before measuring duration

        if (isSudokuValid(dataCtx)) { // (A) complete and correct
          const { descState, descReason, descNotice } = msgResultA();
          const reportHtml = printFinalReport(tracking, descState, descReason, descNotice);
            return reportHtml;
        } else { // (B) complete but incorrect
          const { descState, descReason, descNotice } = msgResultB();
          const reportHtml = printFinalReport(tracking, descState, descReason, descNotice);
            return reportHtml;
        }    
        break;
      }
      
      if (filledTrue === lastFilled) { // Not complete (no changes between the last two iterations): C & D
        tracking.filledCells = filledTrue;
        tracking.endTime = performance.now();

        if (isSudokuConsistent(dataCtx)) { // ..(C) not complete but consistent
          const { descState, descReason, descNotice } = msgResultC();
          const reportHtml = printFinalReport(tracking, descState, descReason, descNotice);
            return reportHtml;
        } else { // ..(D) not complete and inconsistent
          const { descState, descReason, descNotice } = msgResultD();
          const reportHtml = printFinalReport(tracking, descState, descReason, descNotice);
            return reportHtml;
        } 
        break;
      }
      lastFilled = filledTrue; //updating the control value
    }
  }

    export function wildcardExclusion(dataCtx, tracking) {
      for (const id in dataCtx) {
        const cell = dataCtx[id];
      
        if (cell.trueValue !== null && cell.trueValue !== undefined && cell.trueValue !== "") {
          cell.validValue = [];
          continue;
        }

        let wildcards = [1,2,3,4,5,6,7,8,9]; // potencial unique values

        //scanning for uniquness in:
        wildcards = subgridRule(cell, dataCtx, wildcards, tracking); // subgrid
        wildcards = globalRowRule(cell, dataCtx, wildcards, tracking); // gloabal rows
        wildcards = globalColRule(cell, dataCtx, wildcards, tracking); // global cols

        cell.validValue = wildcards;
      }
    }
  
        export function subgridRule (cell, dataCtx, wildcards, tracking) {
          const before = cell.validValue.length; // tracking (wildcards)
          
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
          
          const after = wildcards.length // tracking (wildcards)
            applyTracking(tracking, "wildCardsExcluded", before - after); 
          
          return wildcards;
        }
    
        export function globalRowRule(cell, dataCtx, wildcards, tracking) {
          const before = cell.validValue.length; // tracking (wildcards)

          for (const id in dataCtx) {
            const other = dataCtx[id];
        
            if (other.globalRow === cell.globalRow && other.trueValue) {
              const v = Number(other.trueValue);
              wildcards = wildcards.filter(n => n !== v);
            }
          }
          const after = wildcards.length // tracking (wildcards)
            applyTracking(tracking, "wildCardsExcluded", before - after);
          
          return wildcards;
        }
    
        export function globalColRule(cell, dataCtx, wildcards, tracking) {
          const before = cell.validValue.length; // tracking (wildcards)
          
          for (const id in dataCtx) {
            const other = dataCtx[id];
        
            if (other.globalCol === cell.globalCol && other.trueValue) {
              const v = Number(other.trueValue);
              wildcards = wildcards.filter(n => n !== v);
            }
          }
          const after = wildcards.length // tracking (wildcards)
            applyTracking(tracking, "wildCardsExcluded", before - after);
          
            return wildcards;
        }
 
    export function nakedSingles(dataCtx, tracking) {
      let changed = false;
      let localCount = 0; // tracking (naked Singles)
 
      for (const id in dataCtx) {
        const cell = dataCtx[id];
        //const key = `${cell.subgrid[0]}-${cell.subgrid[1]}`;
 
        if (!cell.trueValue && Array.isArray(cell.validValue) && cell.validValue.length === 1) {
            cell.trueValue = cell.validValue[0];
            cell.validValue = []; 
            changed = true;

            localCount++; // tracking (naked Singles)
        }
      }
      cleaningValids(dataCtx); 
      
      applyTracking(tracking, "nakedSinglesFound", localCount); // tracking (naked Singles)
      
      return changed;
    }
 
    export function hiddenSingles(dataCtx, tracking) {
      let localCount = 0; // tracking (hidden Singles)
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

          localCount++; // tracking (hidden Singles)
        }
      }
      cleaningValids(dataCtx); 
        
      applyTracking(tracking, "hiddenSinglesFound", localCount); // tracking (naked Singles)
      
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

          if (grid[row][col] !== null) return false; // check duokicates in grid
            grid[row][col] = valNum;
      }

      const checkUnit = (unit) => { // ckeck row, col and subs für violations of rules
        const seen = new Set();

        for (const v of unit) {
            if (v === null) continue;  // Lücken ignorieren
            if (seen.has(v)) return false;  // doppelt -> Fehler
            seen.add(v);
        }
        return true;
    };

    for (let r = 0; r < 9; r++) { // rows
        if (!checkUnit(grid[r])) return false;
    }

    for (let c = 0; c < 9; c++) { // cols
        const col = [];
        for (let r = 0; r < 9; r++) col.push(grid[r][c]);
        if (!checkUnit(col)) return false;
    }

    for (let subR = 0; subR < 3; subR++) { // subgrids
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