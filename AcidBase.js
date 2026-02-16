let img;
let debugging = false;
let ranges;
let ABGexamples;
let ABG;
let selectedABG = null;

let pHValue;
let PCO2Value;
let HCO3Value;
let NaValue;
let KValue;
let ClValue;
let CaTotValue;
let iCaValue;
let BE;
let MgValue;
let AlbuminValue;
let PhosphateValue;
let LactateValue;
let HbValue;
let MeasuredOsmValue;
let UreaValue;
let GlucoseValue;
let ctx;
let SAcanvas;

// window.addEventListener("DOMContentLoaded", () => {
//   const canvas = document.getElementById("nomogram");
//   const ctx = canvas.getContext("2d");
//   const width = canvas.width;
//   const height = canvas.height;

//   // ...rest of your code here...
// });

function preload() {
  //img = loadImage("Acid-base_nomogram.svg.png");
  //ranges = loadTable("ranges.csv", "csv", "header");
  ABGexamples = loadTable("ABGexamplesTable.csv", "csv", "header");
}

function setup() {
  //if this is running in a localhost browser add a 'save as example' button
  //console.log("Location port", location.port)

  if (location.port == 5500) {
    //create a column div for the save example button
    const thirdButtonColumn = document.createElement("div");
    thirdButtonColumn.className = "button-column";
    document.getElementById("divInput3").appendChild(thirdButtonColumn);

    //create the save as example button
    const ExButton = document.createElement("button");
    ExButton.className = "form_button";
    ExButton.innerText = "Save as example";
    ExButton.id = "ExampleSaveButton";
    ExButton.onclick = saveAsExample;
    thirdButtonColumn.appendChild(ExButton);
  }

  img = new Image();
  img.src = "Acid-base_nomogram.svg.png";

  debugg(ranges);

  ABG = new ABGclass();
  debugg(ABG);

  document.getElementById("myForm").addEventListener("submit", function (e) {
    e.preventDefault(); // stop page reload
    let text = document.getElementById("ABGinput").value;
    parseABG(text);
  });

  //set up canvas (preparation for moving away from p5js)
  SAcanvas = document.createElement("canvas");
  SAcanvas.width = 500;
  SAcanvas.height = 500;
  SAcanvas.background = "white";
  ctx = SAcanvas.getContext("2d");
  document.getElementById("divSAdiag").appendChild(SAcanvas);

  // Get references to the input elements by their IDs
  // Ensure that your HTML has input elements with these exact IDs (e.g., <input id="pHValue">)
  pHValue = document.getElementById("pHValue");
  PCO2Value = document.getElementById("PCO2Value");
  HCO3Value = document.getElementById("HCO3Value");
  NaValue = document.getElementById("NaValue");
  KValue = document.getElementById("KValue");
  ClValue = document.getElementById("ClValue");
  CaTotValue = document.getElementById("CaTotValue");
  iCaValue = document.getElementById("iCaValue");
  MgValue = document.getElementById("MgValue");
  AlbuminValue = document.getElementById("AlbuminValue");
  PhosphateValue = document.getElementById("PhosphateValue");
  LactateValue = document.getElementById("LactateValue");
  HbValue = document.getElementById("HbValue");
  MeasuredOsmValue = document.getElementById("MeasOsmValue");
  UreaValue = document.getElementById("UreaValue");
  GlucoseValue = document.getElementById("GlucoseValue");
}

function updateResult() {
  ABG.pH = parseFloat(document.getElementById("pHValue").value || 0);
  ABG.PCO2 = parseFloat(document.getElementById("PCO2Value").value || 0);
  ABG.HCO3 = parseFloat(document.getElementById("HCO3Value").value || 0);
  ABG.Na = parseFloat(document.getElementById("NaValue").value || 0);
  ABG.K = parseFloat(document.getElementById("KValue").value || 0);
  ABG.Cl = parseFloat(document.getElementById("ClValue").value || 0);
  ABG.CaTot = parseFloat(document.getElementById("CaTotValue").value || 0);
  ABG.iCa = parseFloat(document.getElementById("iCaValue").value || 0);
  ABG.Mg = parseFloat(document.getElementById("MgValue").value || 0);
  ABG.albumin = parseFloat(document.getElementById("AlbuminValue").value || 0);
  ABG.phosphate = parseFloat(
    document.getElementById("PhosphateValue").value || 0,
  );
  ABG.lactate = parseFloat(document.getElementById("LactateValue").value || 0);
  ABG.Hb = parseFloat(document.getElementById("HbValue").value || 0);
  ABG.MeasuredOsm = parseFloat(
    document.getElementById("MeasOsmValue").value || 0,
  );
  ABG.Ur = parseFloat(document.getElementById("UreaValue").value || 0);
  ABG.Gluc = parseFloat(document.getElementById("GlucoseValue").value || 0);

  if (debugging) {
    console.log("pHValue element:", pHValue.value);
    console.log("PCO2Value element:", PCO2Value.value);
    console.log("HCO3Value element:", HCO3Value.value);
    console.log("NaValue element:", NaValue.value);
    console.log("KValue element:", KValue.value);
    console.log("ClValue element:", ClValue.value);
    console.log("CaTotValue element:", CaTotValue.value);
    console.log("MgValue element:", MgValue.value);
    console.log("AlbuminValue element:", AlbuminValue.value);
    console.log("PhosphateValue element:", PhosphateValue.value);
    console.log("LactateValue element:", LactateValue.value);
    console.log("HbValue element:", HbValue.value);
    console.log("MeasuredOsmValue element:", MeasuredOsmValue.value);
    console.log("UreaValue element:", UreaValue.value);
    console.log("GlucoseValue element:", GlucoseValue.value);
  }

  // Check if any of the elements are null before trying to access their 'value' property
  if (
    !pHValue ||
    !PCO2Value ||
    !HCO3Value ||
    !NaValue ||
    !KValue ||
    !ClValue ||
    !iCaValue ||
    !CaTotValue ||
    !MgValue ||
    !AlbuminValue ||
    !PhosphateValue ||
    !LactateValue ||
    !HbValue ||
    !MeasuredOsmValue ||
    !UreaValue ||
    !GlucoseValue
  ) {
    console.error("One or more required input elements not found in the DOM.");
    // Optionally, you might want to return or set a default value for myResult
    return;
  }

  // let CaEffect = -0.25 * (CaTot - 2.25);
  // let MgEffect = -0.15 * (Mg - 1);
  // CO2  as bicarb =0.23 * pCO2 * 10^(pH - 6.1)
  //phosphate (B12*(0.309*B9-0.469))

  ABG.calculate();
  ABG.display();
  ABG.updateInterpretation();
  ABG.plotSiggardAndersson();
  ABG.drawGamblegram();
}

function readABG() {
  const text = document.getElementById("ABGinput").value;
  debugg("text length: " + text.length);
  if (text.length > 20) {
    parseABG(text);
    debugg("read anyway!!!!");
  } else {
    console.log("Not enough in input box");
  }
}

function parseABG(inputABG) {
  function extractValue(label) {
    const regex = new RegExp(`^\\s*${label}\\s+([\\d.]+)`, "m");
    const match = inputABG.match(regex);
    return match ? Number(match[1]) : null;
  }

  ABG.pH = parseFloat(extractValue("pH") || 0);
  ABG.PCO2 = parseFloat(extractValue("PCO2") || 0);
  ABG.HCO3 = parseFloat(extractValue("Bic") || 0);
  ABG.Na = parseFloat(extractValue("Na") || 0);
  ABG.K = parseFloat(extractValue("K") || 0);
  ABG.Cl = parseFloat(extractValue("Cl") || 0);
  ABG.lactate = parseFloat(extractValue("Lac") || 0);
  //ABG.Hb = parseFloat(extractValue("Hb\\(tot\\)") || 0);
  ABG.Hb = extractValue("Hb") || 0;
  ABG.Gluc = parseFloat(extractValue("Gluc") || 0);
  ABG.albumin = parseFloat(extractValue("Alb") || 0);
  ABG.phosphate = parseFloat(extractValue("PO4") || 0);
  ABG.Mg = parseFloat(extractValue("Mg") || 0);
  ABG.Ur = parseFloat(extractValue("Ur") || 0);
  ABG.MeasuredOsm = parseFloat(extractValue("Measured Osm") || 0);
  ABG.iCa = parseFloat(extractValue("iCa") || 0);
  ABG.CaTot = parseFloat(extractValue("CaTotValue.value") || 0);
  // const baseExcess_mmolL = extractValue("BE");
  // const ionisedCalcium_mmolL = extractValue("iCa\\+\\+");

  ABG.loadABGintoInputFields();
  ABG.calculate();
  ABG.display();
  ABG.updateInterpretation();
  ABG.plotSiggardAndersson();
  ABG.drawGamblegram();
}

function saveABG() {
  debugg("Stored an ABG");
  localStorage.setItem("abg", JSON.stringify(ABG.toJSON()));
  console.log(localStorage.getItem("abg"));
}

function loadABG() {
  let raw = localStorage.getItem("abg");
  if (!raw) return null;

  let data = JSON.parse(raw);
  ABG = ABGclass.fromJSON(data);
  console.log("loaded ABG: ", ABG);
  ABG.loadABGintoInputFields();
  ABG.calculate();
  ABG.display();
  ABG.updateInterpretation();
  ABG.plotSiggardAndersson();
  ABG.drawGamblegram();
}

function resetABG() {
  console.log("resetting ABG");

  ABG.pH = 7.4;
  ABG.PCO2 = 5.0;
  ABG.HCO3 = 25;
  ABG.Na = 138;
  ABG.K = 4.0;
  ABG.Cl = 102;
  ABG.CaTot = 2.4;
  ABG.iCa = 0.9;
  ABG.Mg = 1.0;
  ABG.albumin = 40;
  ABG.phosphate = 1.5;
  ABG.lactate = 1.0;
  ABG.Hb = 120;
  ABG.MeasuredOsm = 310;
  ABG.Ur = 6;
  ABG.Gluc = 6;
  document.getElementById("ABGinput").value = "";

  ABG.loadABGintoInputFields();
  ABG.calculate();
  ABG.display();
  ABG.updateInterpretation();
  ABG.plotSiggardAndersson();
  ABG.drawGamblegram();
}

function copyInterpretation() {
  var copyText = document.getElementById("interpretationBox").innerText;
  navigator.clipboard.writeText(copyText);
  debugg("Feed copied.");
}

function debugg(text) {
  if (debugging) {
    console.log(text);
  }
}

function saveAsExample() {
  //let myAlertText = toString(ABG.pH);
  alert(
    `Ctrl-C and paste this into ABG:\n${ABG.pH},${ABG.PCO2},${ABG.PO2},${ABG.Na},${ABG.K},${ABG.Cl},${ABG.HCO3}, BE,${ABG.Gluc}, ${ABG.lactate}, ${ABG.SaO2}, ${ABG.Hb},${ABG.iCa},${ABG.albumin}, ${ABG.phosphate}, ${ABG.Mg}, Context`,
  );
}
