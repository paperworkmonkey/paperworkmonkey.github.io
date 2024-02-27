// let feed_table, calculatedFeeds;
// let inputBox, outputBox, naloxegol, IBWBox, AdjBWBox, ActBWBox;
// let patientHeight, patientWeight, patientGender;
// let patientMaleGender, patientFemaleGender;
let naloxegolFactor = 1;
// let ABW, IBWM, IBWF, AdjBWM, AdjBWF;
// let energyRequirements, proteinRequirements;
let dailyEnergy, dailyProtein;
let useABW, useAdjBW, useIBW;

function preload() {
    feed_table = loadTable('data2.csv', 'csv', 'header');
}

function setup() {

    //inputBox = select('#read_in');
    //inputBox.changed(readInputBox);

    patientHeight = select('#patientHeight');
    patientHeight.changed(recalculate);

    patientWeight = select('#patientWeight')
    patientWeight.changed(recalculate);

    patientMaleGender = select('#patientMaleGender');
    patientMaleGender.mouseClicked(assignMaleGender);

    patientFemaleGender = select('#patientFemaleGender');
    patientFemaleGender.mouseClicked(assignFemaleGender);

    energyRequirements = select('#energyRequirements');
    //energyRequirements.changed(recalculate);
    energyRequirements.elt.addEventListener("input",recalculate,false);

    proteinRequirements = select('#proteinRequirements');
    //proteinRequirements = document.querySelector('#proteinRequirements')
    proteinRequirements.elt.addEventListener("input",recalculate,false);
    //proteinRequirements.changed(recalculate);

    naloxegol = select('#naloxegol');
    naloxegol.mousePressed(doNaloxegolCalculation);
    //naloxegol.changed(doNaloxegolCalculation);

    ABWselected = select('#ABWselected');
    ABWselected.mouseClicked(selectABW);

    IBWselected = select('#IBWselected');
    IBWselected.mouseClicked(selectIBW);

    AdjBWselected = select('#AdjBWselected');
    AdjBWselected.mouseClicked(selectAdjBW);

    IBWBox = select('#IBWBox');
    ActBWBox = select('#ActBWBox')
    AdjBWBox = select('#AdjBWBox');
    BMIBox = select('#BMIBox');
    dailyEnergyBox = select('#dailyEnergyBox');
    dailyProteinBox = select('#dailyProteinBox');

    outputBox = select('#outputBox');

    calculatedFeeds = deepCopyTable(feed_table);
    
    createHTMLTable(feed_table);
    
    renderTable(calculatedFeeds);

    //setup starting position
    // patientMaleGender.addClass('highlight');
    // patientFemaleGender.removeClass('highlight');
    // patientGender = "male";
    assignMaleGender();
    selectABW();
    recalculate();

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

function readInputBox(){
    //parse input box in this function
    let readWeight = float(inputBox.value());
    console.log("well that worked",readWeight);
    patientWeight.elt.value = readWeight;
    recalculate();
}

function assignMaleGender() {
    patientMaleGender.addClass('highlight');
    patientFemaleGender.removeClass('highlight');
    patientGender = "male";
    recalculate();
}

function assignFemaleGender() {
    patientFemaleGender.addClass('highlight');
    patientMaleGender.removeClass('highlight');
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
}

function recalculate() {
  
    ABW = (float(patientWeight.value()));
    IBWM = int(50 + 2.3 * ((float(patientHeight.value()) / 2.54 - 60)));
    IBWF = int(45.5 + 2.3 * ((float(patientHeight.value()) / 2.54 - 60)));
    AdjBWM = int(IBWM + (0.4 * (float(patientWeight.value()) - IBWM)));
    AdjBWF = int(IBWF + (0.4 * (float(patientWeight.value()) - IBWF)));

    //populate metrics table
    ActBWBox.html(int(patientWeight.value()) + " kg");
    BMIBox.html(int(float(patientWeight.value()) / ((float(patientHeight.value() / 100)) * (float(patientHeight.value() / 100)))));

    if (patientGender == "male") {
        IBWBox.html(IBWM + " kg");
        AdjBWBox.html(AdjBWM + " kg");
    } else {
        IBWBox.html(IBWF + " kg");
        AdjBWBox.html(AdjBWF + " kg");
    }

    //perform energy and protein calculations based on selected weight
    if (useABW) {
        dailyEnergy = int(ABW * float(energyRequirements.value()));
        dailyProtein = int(ABW * float(proteinRequirements.value()));
    }

    if (useIBW && patientGender == "male") {
        dailyEnergy = int(IBWM * float(energyRequirements.value()));
        dailyProtein = int(IBWM * float(proteinRequirements.value()));
    }

    if (useIBW && patientGender == "female") {
        dailyEnergy = int(IBWF * float(energyRequirements.value()));
        dailyProtein = int(IBWF * float(proteinRequirements.value()));
    }

    if (useAdjBW && patientGender == "male") {
        dailyEnergy = int(AdjBWM * float(energyRequirements.value()));
        dailyProtein = int(AdjBWM * float(proteinRequirements.value()));
    }

    if (useAdjBW && patientGender == "female") {
        dailyEnergy = int(AdjBWF * float(energyRequirements.value()));
        dailyProtein = int(AdjBWF * float(proteinRequirements.value()));
    }

    dailyEnergyBox.html(dailyEnergy);
    dailyProteinBox.html(dailyProtein);
    calculateFeedRatesAndVolumes();


}

function doNaloxegolCalculation() {
    if (naloxegol.checked()) {
        naloxegolFactor = 1;
    } else {
        naloxegolFactor = 24 / 21;
    }
    recalculate();
}

function selectABW() {
    ABWselected.addClass('highlight');
    IBWselected.removeClass('highlight');
    AdjBWselected.removeClass('highlight');
    useIBW = false;
    useABW = true;
    useAdjBW = false;
    recalculate();
}

function selectIBW() {
    ABWselected.removeClass('highlight');
    IBWselected.addClass('highlight');
    AdjBWselected.removeClass('highlight');
    useIBW = true;
    useABW = false;
    useAdjBW = false;
    recalculate();
}

function selectAdjBW() {
    ABWselected.removeClass('highlight');
    IBWselected.removeClass('highlight');
    AdjBWselected.addClass('highlight');
    useIBW = false;
    useABW = false;
    useAdjBW = true;
    recalculate();
}

function calculateFeedRatesAndVolumes() {
    // uses global dailyEnergy variable 

    // let something;
    // something = feed_table.matchRow(new RegExp('ml/hr'),1);
    // print(something.getString(0));
    let dailyvolumeRowIndex = 8;
    let rateRowIndex = 9;
    let energyDensityRowIndex = 0;
    let dailyFeedVolume, feedRate;

    //console.log(weight, energy);

    for (let n = 2; n < feed_table.columns.length; n++) {
        dailyFeedVolume = int((dailyEnergy) / feed_table.get(energyDensityRowIndex, n));
        calculatedFeeds.set(dailyvolumeRowIndex, n, dailyFeedVolume);

        feedRate = round((int(dailyFeedVolume) / 24) * naloxegolFactor, 0);
        calculatedFeeds.set(rateRowIndex, n, feedRate);
    }

    //calculate rest of table
    for (let i = 0; i < feed_table.rows.length - 2; i++) {
        for (let j = 2; j < feed_table.columns.length; j++) {
            let newValue = feed_table.get(i, j);
            let dailyFeedVolume = calculatedFeeds.get(dailyvolumeRowIndex, j);
            calculatedFeeds.set(i, j, int(float(newValue) * float(dailyFeedVolume)));
        }
    }

    renderTable(calculatedFeeds);

    //highlight protein if <90% required
    highlightProtein();
}

function highlightProtein() {
    let htmlTable = document.getElementById("data_table");
    for (i = 2; i < calculatedFeeds.columns.length; i++) {
        if (calculatedFeeds.get(1, i) < (0.9 * dailyProtein)){
            htmlTable.rows[2].cells[i].classList.add('highlight');
            //console.log("not engough in column" + i);
        }
        else {
            htmlTable.rows[2].cells[i].classList.remove('highlight');
        }
    }
}

function draw() {
    //recalculate();
}
