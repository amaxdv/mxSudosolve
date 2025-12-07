// === Overlays ===
const overlay = document.getElementById("demoOverlay");
const dialog  = document.getElementById("demoDialog");

// === Message Control ===
export function displayMessage({ title = "", description = "", buttons = [] }) {
    dialog.innerHTML = ""; // clear window

    const closeBtn = document.createElement("div"); // Close Button
        closeBtn.className = "intro-close";
        closeBtn.innerHTML = "&times;";
        closeBtn.addEventListener("click", hideMessage);

        dialog.appendChild(closeBtn);

    if (title) { // Headline (if not empty)
        const headLine = document.createElement("h2");
        headLine.textContent = title;
        
        dialog.appendChild(headLine);
    }

    const text = document.createElement("p"); // text content
        text.innerHTML = description;

        dialog.appendChild(text);

    const actionBox = document.createElement("div"); // ??
        actionBox.className = "intro-actions";

    buttons.forEach(b => { // use and modify this later to add special Buttons (see also example for buttons-property in introMsg)
        const btn = document.createElement("button");
        btn.textContent = b.label;
        btn.addEventListener("click", () => {
            hideMessage();
            b.onClick && b.onClick();
        });
        actionBox.appendChild(btn);
    });
    
        dialog.appendChild(actionBox);

    overlay.classList.remove("hidden");
    }

export function hideMessage() { // hide the overlay
    overlay.classList.add("hidden"); 
}

export function showDialog({ title = "", description = "", buttons = [] }) {
    return new Promise(resolve => {
        displayMessage({
            title,
            description,
            buttons: buttons.length
                ? buttons
                : [{ label: "Weiter", onClick: resolve }] // backup if no button is defined
        });
    });
}

// === Messages ===
export function introMsg() {
    showDialog({
        title: "Willkommen bei sudoSolve.App",
        description: `
        Diese Web App löst Sudoku-Rätsel und benötigt dafür nur ausreichend gültige Eingaben. <br><br>
        Für neue Nutzer wird empfohlen, den Modus "Demo Daten" zu starten, um die Bedienung zu lernen. <br><br>
        Wähle dazu 'Demo Daten' und drücke den 'Starten'-Button. <br>
        `,
        //buttons: [{ label: "Schließen" }]
    });
}

export function demoMsg1() {
    return showDialog({
        title: "Demo-Tour 1/3",
        description: `
        Mit dem 'Starten-Button' wird die Eingabe aktiviert.<br>
        Anschließend überträgt man das zu lösende Sudoku Zelle für Zelle in das Raster der App.<br><br> 
        Hier wurden jetzt die Demo-Daten eingefügt.<br><br> 
        Drücke als nächstes auf den 'Daten lesen'-Button.
        `
    });
}

export function demoMsg2() {
    return showDialog({
        title: "Demo-Tour 2/3",
        description: `
        Durch das 'Daten lesen' erkennt die App eingetragenen Werte und markiert sie <span style="color: red">rot</span>.<br><br> 
        Diese 'Presets' gelten als 'wahre' Werte und stellen die Grundlage für den Lösungs-Algorithmus dar.<br><br>
        Drücke als nächstes auf den 'Sudoku lösen'-Button'.
        `
    });
}

export function demoMsg3() {
    return showDialog({
        title: "Demo-Tour 3/3",
        description: `
        Der Algorithmus verwendet ein regelbasiertes Prüfverfahren und hat für jede Zelle einen <span style="color: green">eindeutigen Wert</span> gefunden.<br><br> 
        Lade die Site neu und probiere den 'Eigene Daten'-Modus aus.
        `
    });
}

// === Debug Tools ===
export function logCandidates(dataCtx) {
    console.log("=== Candidate Log ===");

    Object.keys(dataCtx).forEach(id => {
        const cell = dataCtx[id];
        console.log(id, "Remaining:", cell.validValue, "True Value:", cell.trueValue);
    });
}