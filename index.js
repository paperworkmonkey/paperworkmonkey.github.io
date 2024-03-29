//need to ensure Nas restricted check box does something!


let feed_table, calculatedFeeds;
let inputBox, outputBox, naloxegol, NaRestrict, IBWBox, AdjBWBox, ActBWBox;
//let patientHeight, patientWeight, patientGender;
let patientMaleGender, patientFemaleGender;
let naloxegolFactor = 1;
let ABW, IBWM, IBWF, AdjBWM, AdjBWF;
let energyRequirements, proteinRequirements;
let dailyEnergy, dailyProtein;
let useABW, useAdjBW, useIBW;
let clickedHeader, clickedCellId;
const proteinInProsourceTF = 11;

function preload() {
    feed_table = loadTable('data2.csv', 'csv', 'header');
}

function setup() {

    //inputBox = select('#read_in');
    //inputBox.changed(readInputBox);

    patientHeight = document.getElementById("patientHeight");
    patientHeight.addEventListener('change', recalculate);

    patientWeight = document.getElementById("patientWeight")
    patientWeight.addEventListener('changed',recalculate);

    patientMaleGender = document.getElementById("patientMaleGender");
    patientMaleGender.addEventListener('click', assignMaleGender);

    patientFemaleGender = document.getElementById("patientFemaleGender");
    patientFemaleGender.addEventListener('click', assignFemaleGender);

    energyRequirements = document.getElementById("energyRequirements");
    energyRequirements.addEventListener("input", recalculate, false);

    proteinRequirements = document.getElementById("proteinRequirements");
    proteinRequirements.addEventListener("input", recalculate, false);

    naloxegol = document.getElementById("naloxegol");
    naloxegol.addEventListener('click', doNaloxegolCalculation);

    NaRestrict = document.getElementById(("NaRestrict"));
    NaRestrict.addEventListener('click', highlightSodium);

    ABWselected = document.getElementById("ABWselected");
    ABWselected.addEventListener('click', selectABW);

    IBWselected = document.getElementById("IBWselected");
    IBWselected.addEventListener('click', selectIBW);

    AdjBWselected = document.getElementById("AdjBWselected");
    AdjBWselected.addEventListener('click', selectAdjBW);

    IBWBox = document.getElementById("IBWBox");
    ActBWBox = document.getElementById("ActBWBox")
    AdjBWBox = document.getElementById("AdjBWBox");
    BMIBox = document.getElementById("BMIBox");
    dailyEnergyBox = document.getElementById("dailyEnergyBox");
    dailyProteinBox = document.getElementById("dailyProteinBox");

    outputBox = document.getElementById("outputBox");

    calculatedFeeds = deepCopyTable(feed_table);

    createHTMLTable(feed_table);
    renderTable(calculatedFeeds);

    // setup starting position
    assignMaleGender();
    selectABW();
    recalculate();
    highlight_column();

}

function createHTMLTable(data) {
    let htmlTable = "<table id='data_table' class='my_table'>";
    //let htmlTable = "<table class='my_table'>"
    // Add table headers
    htmlTable += "<tr>";
    for (let colHeader of data.columns) {
        htmlTable += "<th>" + colHeader + "</th>";
    }
    htmlTable += "</tr>";

    // Add table feed_table
    let tableRowType, rowClass;
    for (let row = 0; row < data.getRowCount(); row++) {
        // Alternate row colors
        let rowClassResult = row % 2;
        if (rowClassResult == 0) {
            rowClass = "even_row"
        }
        else {
            rowClass = "odd_row";
        }

        //create cells with unique identities
        htmlTable += '<tr class="' + rowClass + '">';
        for (let col = 0; col < data.columns.length; col++) {
            let cellId = "cell-" + row + "-" + col;
            try {
                //htmlTable += "<td id='" + cellId + "'>" + data.getString(row, col) + "</td>";
                htmlTable += "<td id='" + cellId + "'></td>";
            }
            //add a blank row if the table doesn't contain valid data
            catch (error) {
                htmlTable += "<td id='" + cellId + "'></td>";
            }
        }
        htmlTable += "</tr>";
    }
    htmlTable += "</table>";

    // Display HTML table
    document.getElementById("table1-container").innerHTML = htmlTable;
    renderTable(calculatedFeeds);
}

// function readInputBox() {
//     //parse input box in this function
//     let readWeight = float(inputBox.value());
//     console.log("well that worked", readWeight);
//     patientWeight.elt.value = readWeight;
//     recalculate();
// }

function assignMaleGender() {
    patientMaleGender.classList.add('highlight');
    patientFemaleGender.classList.remove('highlight');
    patientGender = "male";
    recalculate();
}

function assignFemaleGender() {
    patientFemaleGender.classList.add('highlight');
    patientMaleGender.classList.remove('highlight');
    patientGender = "female"
    recalculate();
}

function renderTable(dataTable) {
    let dataTable1 = dataTable;
    let htmlTable = document.getElementById("data_table");

    for (let i = 1; i < htmlTable.rows.length; i++) {
        for (let j = 0; j < htmlTable.rows[i].cells.length; j++) {
            cellValue = (dataTable1.get(i - 1, j));
            htmlTable.rows[i].cells[j].textContent = cellValue;
        }
    }

    highlightProtein();
    highlightSodium();
}

function recalculate() {

    ABW = (float(patientWeight.value));
    IBWM = int(50 + 2.3 * ((float(patientHeight.value) / 2.54 - 60)));
    IBWF = int(45.5 + 2.3 * ((float(patientHeight.value) / 2.54 - 60)));
    AdjBWM = int(IBWM + (0.4 * (float(patientWeight.value) - IBWM)));
    AdjBWF = int(IBWF + (0.4 * (float(patientWeight.value) - IBWF)));

    //populate metrics table
    ActBWBox.textContent = int(patientWeight.value) + " kg";
    BMIBox.innerHTML = int(float(patientWeight.value) / ((float(patientHeight.value / 100)) * (float(patientHeight.value / 100))));

    if (patientGender == "male") {
        IBWBox.innerHTML = IBWM + " kg";
        AdjBWBox.innerHTML = AdjBWM + " kg";
    } else {
        IBWBox.innerHTML = IBWF + " kg";
        AdjBWBox.innerHTML = AdjBWF + " kg";
    }

    //perform energy and protein calculations based on selected weight
    if (useABW) {
        dailyEnergy = int(ABW * float(energyRequirements.value));
        dailyProtein = int(ABW * float(proteinRequirements.value));
    }

    if (useIBW && patientGender == "male") {
        dailyEnergy = int(IBWM * float(energyRequirements.value));
        dailyProtein = int(IBWM * float(proteinRequirements.value));
    }

    if (useIBW && patientGender == "female") {
        dailyEnergy = int(IBWF * float(energyRequirements.value));
        dailyProtein = int(IBWF * float(proteinRequirements.value));
    }

    if (useAdjBW && patientGender == "male") {
        dailyEnergy = int(AdjBWM * float(energyRequirements.value));
        dailyProtein = int(AdjBWM * float(proteinRequirements.value));
    }

    if (useAdjBW && patientGender == "female") {
        dailyEnergy = int(AdjBWF * float(energyRequirements.value));
        dailyProtein = int(AdjBWF * float(proteinRequirements.value));
    }

    dailyEnergyBox.innerHTML = dailyEnergy;
    dailyProteinBox.innerHTML = dailyProtein;
    calculateFeedRatesAndVolumes();
    highlightProtein();
    highlightSodium();


}

function doNaloxegolCalculation() {
    if (naloxegol.checked) {
        naloxegolFactor = 24 / 21.5;
    } else {
        naloxegolFactor = 1;
    }
    recalculate();
    //highlight_column();
}

function selectABW() {
    ABWselected.classList.add('highlight');
    IBWselected.classList.remove('highlight');
    AdjBWselected.classList.remove('highlight');
    useIBW = false;
    useABW = true;
    useAdjBW = false;
    recalculate();
}

function selectIBW() {
    ABWselected.classList.remove('highlight');
    IBWselected.classList.add('highlight');
    AdjBWselected.classList.remove('highlight');
    useIBW = true;
    useABW = false;
    useAdjBW = false;
    recalculate();
}

function selectAdjBW() {
    ABWselected.classList.remove('highlight');
    IBWselected.classList.remove('highlight');
    AdjBWselected.classList.add('highlight');
    useIBW = false;
    useABW = false;
    useAdjBW = true;
    recalculate();
}

function calculateFeedRatesAndVolumes() {
    // uses global dailyEnergy variable 
    let dailyvolumeRowIndex = 8;
    let rateRowIndex = 9;
    let energyDensityRowIndex = 0;
    let dailyFeedVolume, feedRate;

    for (let n = 2; n < feed_table.columns.length; n++) {

        dailyFeedVolume = int((dailyEnergy) / feed_table.get(energyDensityRowIndex, n));
        calculatedFeeds.set(dailyvolumeRowIndex, n, dailyFeedVolume);
        //console.log("column " + n + ": " + dailyFeedVolume);

        feedRate = round((int(dailyFeedVolume) / 24) * naloxegolFactor, 0);
        calculatedFeeds.set(rateRowIndex, n, feedRate);
    }


    //calculate and display rest of table
    for (let i = 0; i < feed_table.rows.length - 3; i++) {
        for (let j = 2; j < feed_table.columns.length; j++) {
            let newValue = feed_table.get(i, j);
            let dailyFeedVolume = calculatedFeeds.get(dailyvolumeRowIndex, j);
            calculatedFeeds.set(i, j, int(float(newValue) * float(dailyFeedVolume)));
        }
    }

    //calculate and display prosource number required
    for (let j = 2; j < calculatedFeeds.columns.length; j++) {
        const proteinDelivered = calculatedFeeds.get(1, j);
        const proteinDeficit = dailyProtein - proteinDelivered;
        const prosourceRequired = round((proteinDeficit / proteinInProsourceTF), 0);
        calculatedFeeds.set(10, j, prosourceRequired);
    }

    renderTable(calculatedFeeds);

}

function highlightProtein() {
    let htmlTable = document.getElementById("data_table");
    for (i = 2; i < calculatedFeeds.columns.length; i++) {
        if (calculatedFeeds.get(1, i) < (0.9 * dailyProtein)) {
            htmlTable.rows[2].cells[i].classList.add('highlight');
            //console.log("not engough in column" + i);
        }
        else {
            htmlTable.rows[2].cells[i].classList.remove('highlight');
        }
    }
}

function highlightSodium() {
    let htmlTable = document.getElementById("data_table");
    if (NaRestrict.checked) {

        for (i = 2; i < calculatedFeeds.columns.length; i++) {
            // console.log(calculatedFeeds.get(6, i));
            // console.log(ABW);
            if (calculatedFeeds.get(6, i) > ABW) {
                htmlTable.rows[7].cells[i].classList.add('highlight');
                //console.log("not engough in column" + i);
            }
            else {
                htmlTable.rows[7].cells[i].classList.remove('highlight');
            }
        }
    }
    else {
        //console.log("no longer Na resitriced");
        for (i = 2; i < calculatedFeeds.columns.length; i++) {
            htmlTable.rows[7].cells[i].classList.remove('highlight');
        }
    }
}


function highlight_column() {
    var table = document.getElementById("data_table");
    var cells = table.getElementsByTagName("td");
    let prosourceString;
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        const parentTr = cell.parentElement;
        const clickedTdIndex = Array.from(parentTr.children).indexOf(cell);
        if (clickedTdIndex > 1) { // Check if the column index is greater than 1
            cell.onclick = function () {
                const columnHeader = table.querySelector(`th:nth-child(${clickedTdIndex + 1})`); // Find the corresponding column header
                //console.log(columnHeader);
                const columns = document.querySelectorAll(`td:nth-child(${clickedTdIndex + 1}), th:nth-child(${clickedTdIndex + 1})`);
                document.querySelectorAll('.selected').forEach(col => col.classList.remove('selected'));
                columns.forEach(col => {
                    col.classList.add('selected');
                });

                const rateCell = table.rows[table.rows.length - 2].cells[clickedTdIndex].textContent.trim();
                const prosourceCell = table.rows[table.rows.length - 1].cells[clickedTdIndex].textContent.trim();


                if (prosourceCell > 0) {
                    prosourceString = ", and " + prosourceCell + " prosource required";
                }
                else {
                    prosourceString = "";
                }

                let naloxegolString = "";
                if (naloxegol.checked) {
                    //console.log("nnaalloooxxeegggooolll")
                    naloxegolString = " over 21 hours"
                } else {
                    naloxegolString = " over 24 hours"
                }


                // Set outputBox text to the text content of the column header
                if (columnHeader) {
                    outputBox.innerHTML = columnHeader.textContent.trim() + ": target " + rateCell + " ml/hr" + naloxegolString + prosourceString;
                } else {
                    outputBox.innerHTML = "Column header not found";
                }
            }
        }
    }
}


// function draw() {
//     //recalculate();
// }
