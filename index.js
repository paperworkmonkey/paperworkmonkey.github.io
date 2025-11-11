// --- Full corrected script (live-updating sliders; outputBox updates) ---

let feed_table, calculatedFeeds;
let naloxegol, NaRestrict;
let IBWBox,
  AdjBWBox,
  ActBWBox,
  BMIBox,
  BMI27Box,
  dailyEnergyBox,
  dailyProteinBox;
let patientHeight, patientWeight, patientMaleGender, patientFemaleGender;
let energyRequirements, proteinRequirements, energyDisplay, proteinDisplay;
let ABW, IBWM, IBWF, AdjBWM, AdjBWF, BMI27BW, baseWeight;
let dailyEnergy, dailyProtein;
let useABW, useAdjBW, useIBW, useBMI27BW;
let outputBox;
let naloxegolFactor = 1;
const proteinInProsourceTF = 11;

// preload CSV
function preload() {
  feed_table = loadTable("data2.csv", "csv", "header");
}

function setup() {
  noCanvas();

  // form refs
  patientHeight = document.getElementById("patientHeight");
  patientWeight = document.getElementById("patientWeight");
  patientMaleGender = document.getElementById("patientMaleGender");
  patientFemaleGender = document.getElementById("patientFemaleGender");

  energyRequirements = document.getElementById("energyRequirements");
  proteinRequirements = document.getElementById("proteinRequirements");
  energyDisplay = document.getElementById("energyDisplay");
  proteinDisplay = document.getElementById("proteinDisplay");

  naloxegol = document.getElementById("naloxegol");
  NaRestrict = document.getElementById("NaRestrict");

  ABWselected = document.getElementById("ABWselected");
  IBWselected = document.getElementById("IBWselected");
  AdjBWselected = document.getElementById("AdjBWselected");
  BMI27selected = document.getElementById("BMI27BWselected");

  IBWBox = document.getElementById("IBWBox");
  ActBWBox = document.getElementById("ActBWBox");
  AdjBWBox = document.getElementById("AdjBWBox");
  BMIBox = document.getElementById("BMIBox");
  BMI27Box = document.getElementById("BMI27BWBox");
  dailyEnergyBox = document.getElementById("dailyEnergyBox");
  dailyProteinBox = document.getElementById("dailyProteinBox");

  outputBox = document.getElementById("outputBox");

  // listeners
  if (patientHeight) patientHeight.addEventListener("change", recalculate);
  if (patientWeight) patientWeight.addEventListener("change", recalculate);
  if (patientMaleGender)
    patientMaleGender.addEventListener("click", assignMaleGender);
  if (patientFemaleGender)
    patientFemaleGender.addEventListener("click", assignFemaleGender);

  // sliders: live update
  if (energyRequirements) {
    energyRequirements.addEventListener("input", () => {
      if (energyDisplay) energyDisplay.textContent = energyRequirements.value;
      recalculate();
    });
    if (energyDisplay) energyDisplay.textContent = energyRequirements.value;
  }
  if (proteinRequirements) {
    proteinRequirements.addEventListener("input", () => {
      if (proteinDisplay)
        proteinDisplay.textContent = proteinRequirements.value;
      recalculate();
    });
    if (proteinDisplay) proteinDisplay.textContent = proteinRequirements.value;
  }

  if (naloxegol) naloxegol.addEventListener("click", doNaloxegolCalculation);
  if (NaRestrict) NaRestrict.addEventListener("click", highlightSodium);

  if (ABWselected) ABWselected.addEventListener("click", selectABW);
  if (IBWselected) IBWselected.addEventListener("click", selectIBW);
  if (AdjBWselected) AdjBWselected.addEventListener("click", selectAdjBW);
  if (BMI27selected) BMI27selected.addEventListener("click", selectBMI27BW);

  // deep copy
  calculatedFeeds = deepCopyTable(feed_table);

  createHTMLTable(feed_table);

  // defaults
  assignMaleGender();
  selectABW();
  recalculate();
  highlight_column();
}

// create table
function createHTMLTable(data) {
  let htmlTable = "<table id='data_table' class='my_table'><tr>";
  for (let colHeader of data.columns) htmlTable += `<th>${colHeader}</th>`;
  htmlTable += "</tr>";

  for (let row = 0; row < data.getRowCount(); row++) {
    let rowClass = row % 2 === 0 ? "even_row" : "odd_row";
    htmlTable += `<tr class="${rowClass}">`;
    for (let col = 0; col < data.columns.length; col++) {
      htmlTable += `<td id="cell-${row}-${col}"></td>`;
    }
    htmlTable += "</tr>";
  }
  htmlTable += "</table>";
  document.getElementById("table1-container").innerHTML = htmlTable;
  renderTable(calculatedFeeds);
}

function assignMaleGender() {
  if (patientMaleGender)
    patientMaleGender.classList.add("genderSelectButtonHighlighted");
  if (patientFemaleGender)
    patientFemaleGender.classList.remove("genderSelectButtonHighlighted");
  patientGender = "male";
  recalculate();
}

function assignFemaleGender() {
  if (patientFemaleGender)
    patientFemaleGender.classList.add("genderSelectButtonHighlighted");
  if (patientMaleGender)
    patientMaleGender.classList.remove("genderSelectButtonHighlighted");
  patientGender = "female";
  recalculate();
}

function renderTable(dataTable) {
  const htmlTable = document.getElementById("data_table");
  if (!htmlTable) return;
  for (let i = 1; i < htmlTable.rows.length; i++) {
    for (let j = 0; j < htmlTable.rows[i].cells.length; j++) {
      htmlTable.rows[i].cells[j].textContent = dataTable.getString(i - 1, j);
    }
  }
  highlightProtein();
  highlightSodium();
  updateOutputBox(); // ensure outputBox is live
}

function recalculate() {
  const energyVal = energyRequirements ? float(energyRequirements.value) : 0;
  const proteinVal = proteinRequirements ? float(proteinRequirements.value) : 0;

  ABW = float(patientWeight && patientWeight.value ? patientWeight.value : 0);
  IBWM = int(
    50 +
      2.3 *
        (float(patientHeight && patientHeight.value ? patientHeight.value : 0) /
          2.54 -
          60)
  );
  IBWF = int(
    45.5 +
      2.3 *
        (float(patientHeight && patientHeight.value ? patientHeight.value : 0) /
          2.54 -
          60)
  );
  AdjBWM = int(IBWM + 0.4 * (ABW - IBWM));
  AdjBWF = int(IBWF + 0.4 * (ABW - IBWF));
  BMI27BW = int(
    ((patientHeight && patientHeight.value ? float(patientHeight.value) : 0) /
      100) **
      2 *
      27
  );

  if (ActBWBox) ActBWBox.textContent = int(ABW) + " kg";
  if (BMIBox)
    BMIBox.textContent =
      patientHeight && patientHeight.value
        ? int(ABW / (float(patientHeight.value) / 100) ** 2)
        : 0;
  if (patientGender === "male") {
    if (IBWBox) IBWBox.textContent = IBWM + " kg";
    if (AdjBWBox) AdjBWBox.textContent = AdjBWM + " kg";
  } else {
    if (IBWBox) IBWBox.textContent = IBWF + " kg";
    if (AdjBWBox) AdjBWBox.textContent = AdjBWF + " kg";
  }
  if (BMI27Box) BMI27Box.textContent = BMI27BW + " kg";

  // choose base weight
  baseWeight = useABW
    ? ABW
    : useIBW
    ? patientGender === "male"
      ? IBWM
      : IBWF
    : useAdjBW
    ? patientGender === "male"
      ? AdjBWM
      : AdjBWF
    : useBMI27BW
    ? BMI27BW
    : 0;

  dailyEnergy = int(baseWeight * energyVal);
  dailyProtein = int(baseWeight * proteinVal);

  if (dailyEnergyBox) dailyEnergyBox.textContent = dailyEnergy;
  if (dailyProteinBox) dailyProteinBox.textContent = dailyProtein;

  calculateFeedRatesAndVolumes();
}

function doNaloxegolCalculation() {
  naloxegolFactor = naloxegol && naloxegol.checked ? 24 / 21.5 : 1;
  recalculate();
}

function selectABW() {
  useABW = true;
  useIBW = useAdjBW = useBMI27BW = false;
  recalcHighlight("ABW");
}
function selectIBW() {
  useIBW = true;
  useABW = useAdjBW = useBMI27BW = false;
  recalcHighlight("IBW");
}
function selectAdjBW() {
  useAdjBW = true;
  useABW = useIBW = useBMI27BW = false;
  recalcHighlight("AdjBW");
}
function selectBMI27BW() {
  useBMI27BW = true;
  useABW = useIBW = useAdjBW = false;
  recalcHighlight("BMI27BW");
}

function recalcHighlight(selectedType) {
  if (ABWselected)
    ABWselected.classList.toggle("highlight", selectedType === "ABW");
  if (IBWselected)
    IBWselected.classList.toggle("highlight", selectedType === "IBW");
  if (AdjBWselected)
    AdjBWselected.classList.toggle("highlight", selectedType === "AdjBW");
  if (BMI27selected)
    BMI27selected.classList.toggle("highlight", selectedType === "BMI27BW");
  recalculate();
}

function calculateFeedRatesAndVolumes() {
  let dailyvolumeRowIndex = 8;
  let rateRowIndex = 9;
  let energyDensityRowIndex = 0;

  for (let n = 2; n < feed_table.columns.length; n++) {
    let energyDensity = feed_table.getNum(energyDensityRowIndex, n) || 1;
    let dailyFeedVolume = int(dailyEnergy / energyDensity);
    calculatedFeeds.set(dailyvolumeRowIndex, n, dailyFeedVolume);

    let feedRate = round((dailyFeedVolume / 24) * naloxegolFactor, 0);
    calculatedFeeds.set(rateRowIndex, n, feedRate);
  }

  for (let i = 0; i < feed_table.getRowCount() - 3; i++) {
    for (let j = 2; j < feed_table.columns.length; j++) {
      let baseVal = feed_table.getNum(i, j) || 0;
      let dailyFeedVolume = calculatedFeeds.getNum(dailyvolumeRowIndex, j) || 0;
      calculatedFeeds.set(i, j, int(baseVal * dailyFeedVolume));
    }
  }

  for (let j = 2; j < calculatedFeeds.columns.length; j++) {
    const proteinDelivered = calculatedFeeds.getNum(1, j) || 0;
    const proteinDeficit = dailyProtein - proteinDelivered;
    const prosourceRequired = round(proteinDeficit / proteinInProsourceTF, 0);
    calculatedFeeds.set(10, j, prosourceRequired);
  }

  renderTable(calculatedFeeds);
}

function highlightProtein() {
  const htmlTable = document.getElementById("data_table");
  if (!htmlTable) return;
  for (let i = 2; i < calculatedFeeds.columns.length; i++) {
    if (
      calculatedFeeds.getNum(1, i) < 0.9 * dailyProtein ||
      calculatedFeeds.getNum(1, i) > 1.3 * dailyProtein
    ) {
      htmlTable.rows[2].cells[i].classList.add("highlight");
    } else {
      htmlTable.rows[2].cells[i].classList.remove("highlight");
    }
  }
}

function highlightSodium() {
  const htmlTable = document.getElementById("data_table");
  if (!htmlTable) return;
  if (NaRestrict && NaRestrict.checked) {
    for (let i = 2; i < calculatedFeeds.columns.length; i++) {
      if (calculatedFeeds.getNum(6, i) > ABW)
        htmlTable.rows[7].cells[i].classList.add("highlight");
      else htmlTable.rows[7].cells[i].classList.remove("highlight");
    }
  } else {
    for (let i = 2; i < calculatedFeeds.columns.length; i++)
      htmlTable.rows[7].cells[i].classList.remove("highlight");
  }
}

// centralized output update
function updateOutputBox() {
  const table = document.getElementById("data_table");
  if (!table) return;

  const selected = table.querySelector("td.selected, th.selected");
  if (!selected) return;

  const clickedTdIndex = Array.from(selected.parentElement.children).indexOf(
    selected
  );
  const columnHeader = table.querySelector(
    `th:nth-child(${clickedTdIndex + 1})`
  );
  if (!columnHeader) return;

  const rateCell =
    table.rows[table.rows.length - 2].cells[clickedTdIndex].textContent.trim();
  const prosourceCell =
    table.rows[table.rows.length - 1].cells[clickedTdIndex].textContent.trim();
  const proteinDelivered =
    table.rows[2].cells[clickedTdIndex].textContent.trim();
  const proteinGoal = dailyProtein || 0;

  let proteinPercent = 0;
  if (proteinGoal > 0) {
    proteinPercent = Math.round((proteinDelivered / proteinGoal) * 100);
  }

  // ✅ Identify which weight system is active
  let weightTypeUsed = "";
  if (useABW) weightTypeUsed = "Act BW";
  else if (useIBW) weightTypeUsed = "IBW";
  else if (useAdjBW) weightTypeUsed = "Adj BW";
  else if (useBMI27BW) weightTypeUsed = "BMI 27";

  const prosourceString =
    prosourceCell > 0 ? `, ${prosourceCell} prosource required` : "";
  const naloxegolString =
    naloxegol && naloxegol.checked ? " over 21 hours" : " over 24 hours";

  if (outputBox) {
    outputBox.innerHTML = `${columnHeader.textContent.trim()}: target ${rateCell} ml/hr${naloxegolString}
<br><br>Calculated using ${weightTypeUsed} (${baseWeight}kg @ ${
      energyRequirements.value
    } kcal/kg/day)
<br>Provides ${proteinDelivered}g protein (${proteinPercent}% of goal)${prosourceString}`;
  }
}

// column selection
function highlight_column() {
  const table = document.getElementById("data_table");
  if (!table) return;
  const cells = table.getElementsByTagName("td");
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const clickedTdIndex = Array.from(cell.parentElement.children).indexOf(
      cell
    );
    if (clickedTdIndex > 1) {
      cell.onclick = () => {
        table
          .querySelectorAll(".selected")
          .forEach((el) => el.classList.remove("selected"));
        const columns = table.querySelectorAll(
          `td:nth-child(${clickedTdIndex + 1}), th:nth-child(${
            clickedTdIndex + 1
          })`
        );
        columns.forEach((col) => col.classList.add("selected"));
        updateOutputBox();
      };
    }
  }
}

function copyFeed() {
  var copyText = document.getElementById("outputBox").innerText;
  // copyText.select();
  // copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText);
  console.log("Feed copied.");
  // // Alert the copied text
  // alert("Copied the text: " + copyText.value);
}
