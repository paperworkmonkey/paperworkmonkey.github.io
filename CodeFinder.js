let data;
let searchTerm;
let searchTermBox,
  myResultsBox,
  myICNARCsystem,
  myICNARCsite,
  myICNARCprocess,
  myICNARCcondition,
  myICNARCcode;

function preload() {
  data = loadTable("ICNARCcodetable3.csv", "csv", "header");
}

function getSearchTerm() {
  searchTerm = inputValue.value.toLowerCase();
  let mySearchTermArray = searchTerm.split(" ");
  //console.log(mySearchTermArray);

  let myInitialRows = data.matchRows(
    mySearchTermArray[0],
    "lowerCaseCondition"
  );
  //console.log(myInitialRows);

  let myRows = myInitialRows.filter((row) =>
    mySearchTermArray.every((term) =>
      row.arr.some((val) => val.toLowerCase().includes(term.toLowerCase()))
    )
  );

  let SystemString = "";
  let SiteString = "";
  let ProcessString = "";
  let ConditionString = "";
  let CodeString = "";

  //console.log(myRows);
  for (let i = 0; i < myRows.length; i++) {
    SystemString += myRows[i].getString("System") + "<br>";
    SiteString += myRows[i].getString("Site") + "<br>";
    ProcessString += myRows[i].getString("Process") + "<br>";
    ConditionString += myRows[i].getString("Condition") + "<br>";
    CodeString += myRows[i].getString("ICM V4.0") + "<br>";
  }

  myICNARCsystem.html(SystemString);
  myICNARCsite.html(SiteString);
  myICNARCprocess.html(ProcessString);
  myICNARCcondition.html(ConditionString);
  myICNARCcode.html(CodeString);
}

function setup() {
  noCanvas();
  noLoop();

  //create lower case condition column
  data.addColumn("lowerCaseCondition");
  for (let i = 0; i < data.getRowCount(); i++) {
    data.set(i, "lowerCaseCondition", data.get(i, "Condition").toLowerCase());
  }

  //get DOM elements
  searchTermBox = select("#inputValue");
  myResultsBox = select("#resultsBox");
  myICNARCsystem = select("#ICNARCsystem");
  myICNARCsite = select("#ICNARCsite");
  myICNARCprocess = select("#ICNARCprocess");
  myICNARCcondition = select("#ICNARCcondition");
  myICNARCcode = select("#ICNARCcode");

  // print(data.getRowCount() + " total rows in table");
  // print(data.getColumnCount() + " total columns in table");
}

function draw() {
  //background(220);
}
