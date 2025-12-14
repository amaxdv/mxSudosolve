export function createTracking() {
    return {
        startTime: performance.now(), // tracking (duration)
        endTime: null,
        get duration() {
        return (this.endTime !== null) ? (this.endTime - this.startTime) : null;
        },

        iterations: 0, // tracking (iterations)

        filledCells: 0, // tracking (filled cells)
        presetsFound: 0, // tracking (number of presets)

        wildCardsExcluded: 0, // not in use
        nakedSinglesFound: 0, // tracking (naked singles)
        hiddenSinglesFound: 0 // tracking (hidden singles)
        
    };
}

export function applyTracking(tracking, key, count) {

    if (!tracking || typeof tracking !== "object") return;

    if (!tracking[key]) tracking[key] = 0;

    tracking[key] += count;
}

export function printFinalReport(tracking, descState, descReason, descNotice) {
    const durationMs = Number(tracking.endTime - tracking.startTime).toFixed(2);

    // format for table in message window
    return `
        <hr>
        <div class="solver-report">

            ${descState} <br><br>
            ${descReason}<br><br>
            ${descNotice}<br><br>

            <div class="report-grid">
                <div class="label">Dauer:</div>
                <div class="value">${durationMs} ms</div>

                <div class="label">Gefüllte Zellen:</div>
                <div class="value">${tracking.filledCells} / ${tracking.totalCells ?? "-"}</div>

                <div class="label">Davon Presets:</div>
                <div class="value">${tracking.presetsFound ?? 0}</div>

                <div class="label">Iterationen:</div>
                <div class="value">${tracking.iterations}</div>

                <div class="label">Gefundene Werte:</div>
                <div class="value">${tracking.filledCells - (tracking.presetsFound ?? 0)}</div>

                <!--<div class="label">FEHLEHAFT Wildcard Exclusion:</div>
                <div class="value">${tracking.wildCardsExcluded ?? 0}</div>-->

                <div class="label">davon Naked Singles:</div>
                <div class="value">${tracking.nakedSinglesFound ?? 0}</div>

                <div class="label">davon Hidden Singles:</div>
                <div class="value">${tracking.hiddenSinglesFound ?? 0}</div>

                <div class="label">davon Naked Pairs:</div>
                <div class="value">nicht implementiert</div>

                <div class="label">davon Hidden Pairs:</div>
                <div class="value">nicht implementiert</div>

                <div class="label">durch Brute-Force:</div>
                <div class="value">nicht implementiert</div>
            </div>
        </div>
    `;

    // Format for logs
    /*
    console.log("=== Abschlussbericht ===");
    console.log(`Ergebnis: ${message}`);
    console.log(`Dauer: ${durationMs} ms`);
    console.log(`Gefüllte Zellen: ${filledCellNumber}`);
    console.log("Begründung: -");
    console.log("Hinweis: -");
    console.log("--- Zusammenfassung ---");
    console.log(`Iterationen: ${iterations}`);
    console.log("Wildcard Exclusion: noch nicht getrackt");
    console.log(`Naked Singles gefunden: ${tracking.nakedSinglesFound}`);
    console.log("Hidden Singles: noch nicht getrackt");
    console.log("Naked Pairs: noch nicht implementiert");
    console.log("Hidden Pairs: noch nicht implementiert");
    console.log("Brute Force: noch nicht implementiert");
    */
}