let data;
let searchTerm;
let searchTermBox;

function preload() {
  data = loadTable("ICNARCcodetable3.csv", "csv", "header");
}

function setup() {
  noCanvas();
  noLoop();

  //add PageTop header
  fetch("PageTopNGFeed.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("headerPlaceholder").innerHTML = data;
      const page = document.getElementById("codeFinder");
      if (page) {
        page.className = "btn-link btn-primary";
      }
    });

  //create lower case condition column
  data.addColumn("lowerCaseCondition");
  for (let i = 0; i < data.getRowCount(); i++) {
    data.set(i, "lowerCaseCondition", data.get(i, "Condition").toLowerCase());
  }

  //get DOM elements
  // searchTermBox = document.getElementById("#inputValue");
}

function getSearchTerm() {
  searchTerm = inputValue.value.toLowerCase();
  let mySearchTermArray = searchTerm.split(" ");

  let myInitialRows = data.matchRows(
    mySearchTermArray[0],
    "lowerCaseCondition",
  );
  //console.log(myInitialRows);

  let myRows = myInitialRows.filter((row) =>
    mySearchTermArray.every((term) =>
      row.arr.some((val) => val.toLowerCase().includes(term.toLowerCase())),
    ),
  );

  let SystemString = "";
  let SiteString = "";
  let ProcessString = "";
  let ConditionString = "";
  let CodeString = "";
  let UniqueCodeString = "";

  //console.log(myRows);
  for (let i = 0; i < myRows.length; i++) {
    SystemString += myRows[i].getString("System") + "<br>";
    SiteString += myRows[i].getString("Site") + "<br>";
    ProcessString += myRows[i].getString("Process") + "<br>";
    ConditionString += myRows[i].getString("Condition") + "<br>";
    CodeString += myRows[i].getString("ICM V4.0") + "<br>";
    UniqueCodeString += myRows[i].getString("Unique code") + "<br>";
  }

  document.getElementById("ICNARCsystem").innerHTML = SystemString;
  document.getElementById("ICNARCsite").innerHTML = SiteString;
  document.getElementById("ICNARCprocess").innerHTML = ProcessString;
  document.getElementById("ICNARCcondition").innerHTML = ConditionString;
  document.getElementById("ICNARCcode").innerHTML = CodeString;
  document.getElementById("ICNARCuniqueCode").innerHTML = UniqueCodeString;
  document.getElementById("sgICNARCcondition").innerHTML = ConditionString;
  document.getElementById("sgICNARCcode").innerHTML = CodeString;
}
