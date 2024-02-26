function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function deepCopyTable(table) {
    if (!table || !table.columns || !table.getRowCount) {
        console.error("Invalid table object.");
        return null;
    }

    let copiedTable = new p5.Table(); // Create a new empty table

    // Copy column headers
    for (let i = 0; i < table.columns.length; i++) {
        let column = table.columns[i];
        copiedTable.addColumn(column);
    }

    // Copy rows and their values
    for (let i = 0; i < table.getRowCount(); i++) {
        let newRow = copiedTable.addRow(); // Add a new row to the copied table
        let originalRow = table.getRow(i);
        
        for (let j = 0; j < table.columns.length; j++) {
            let value = originalRow.getString(j); // Use column index instead of name
            newRow.setString(j, value); // Set the value in the copied row using column index
        }
    }
    return copiedTable;
}