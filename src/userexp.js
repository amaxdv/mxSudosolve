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

export function unhideMessage() {
    overlay.classList.remove("hidden");
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
        Mit dem 'Starten-Button' wird die Eingabe aktiviert.<br><br>
        Anschließend überträgt man das zu lösende Sudoku Zelle für Zelle in das Raster der App.<br><br> 
        Hier wurden bereits Demo-Daten eingefügt.<br><br> 
        Drücke als nächstes auf den 'Daten lesen'-Button.
        `
    });
}

export function demoMsg2() {
    return showDialog({
        title: "Demo-Tour 2/3",
        description: `
        Durch das 'Daten lesen' erkennt die App <span style="color: red">eingetragenen Werte</span>.<br><br> 
        Diese 'Presets' gelten als 'wahr' und bilden die Grundlage für die anschließende Berechnung.<br><br>
        Drücke als nächstes auf den 'Sudoku lösen'-Button'.
        `
    });
}

export function demoMsg3(reportHtml) {
    return showDialog({
        title: "Demo-Tour 3/3",
        description: `
        Der Algorithmus hat für jede Zelle einen <span style="color: blue">eindeutigen Wert</span> gefunden.<br><br> 
        Am Ende wird das Ergebnis in einem Abschlussbericht beschrieben.<br><br>
        Lade die Site neu und probiere den 'Eigene Daten'-Modus aus. <br><br>
        ${reportHtml}
        `,
        buttons: [{label: "Ergebnis anzeigen"}]
    });
}

export function startMsg() {
    return showDialog({
        title: "Eingabe freigegeben",
        description: `Übertrage das zu lösende Sudoku in das Spielfeld.`
    });
}


export function endMsg(reportHtml) {
    return showDialog({
        title: "Abschlussbericht",
        description: `${reportHtml}`,
        buttons: [{label: "Ergebnis anzeigen"}]
    });
}

export function msgResultA() {
    return {
        descState: "Sudoku vollständig gelöst und korrekt.",
        descReason: "Alle Zellen enthalten gültige Werte.",
        descNotice: "Keine weiteren Hinweise."
    };
}

export function msgResultB() {
    return {
        descState: "Sudoku vollständig gefüllt, aber nicht gültig.",
        descReason: "Mindestens eine Regelverletzung in Block, Zeile oder Spalte.",
        descNotice: "Bitte die eingegebenen Presets überprüfen."
    };
}

export function msgResultC() {
    return {
        descState: "Sudoku unvollständig, aber widerspruchsfrei.",
        descReason: "Es konnten keine weiteren logischen Schritte mehr ausgeführt werden.",
        descNotice: "Notwendige Strategien sind noch nicht implementiert."
    };
}

export function msgResultD() {
    return {
        descState: "Sudoku unvollständig und ungültig.",
        descReason: "Mindestens ein Feld hat keine möglichen Kandidaten mehr oder eine Regel wurde verletzt.",
        descNotice: "Presets prüfen oder später verfügbare Strategien aktivieren."
    };
}


// === Debug Tools ===
export function logCandidates(dataCtx) {
    console.log("=== Candidate Log ===");

    Object.keys(dataCtx).forEach(id => {
        const cell = dataCtx[id];
        console.log(id, "Remaining:", cell.validValue, "True Value:", cell.trueValue);
    });
}