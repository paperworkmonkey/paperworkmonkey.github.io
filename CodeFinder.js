let data;

function preload() {
  data = loadTable("ICNARCcodetable3.csv", "csv", "header");
}

function setup() {
  noCanvas();
  noLoop();

  fetch("PageTopNGFeed.html")
    .then((r) => r.text())
    .then((html) => {
      document.getElementById("headerPlaceholder").innerHTML = html;
      const page = document.getElementById("codeFinder");
      if (page) {
        page.className = "btn-link btn-primary";
      }
    });

  data.addColumn("lowerCaseCondition");

  for (let i = 0; i < data.getRowCount(); i++) {
    data.set(i, "lowerCaseCondition", data.get(i, "Condition").toLowerCase());
  }
}

function getSearchTerm() {
  const searchTerm = document.getElementById("inputValue").value.toLowerCase();

  const terms = searchTerm.split(" ");

  const initialRows = data.matchRows(terms[0], "lowerCaseCondition");

  const rows = initialRows.filter((row) =>
    terms.every((term) =>
      row.arr.some((val) => val.toLowerCase().includes(term)),
    ),
  );

  const container = document.getElementById("resultsContainer");

  container.innerHTML = "";

  rows.forEach((row) => {
    const rowData = {
      system: row.getString("System"),
      site: row.getString("Site"),
      process: row.getString("Process"),
      condition: row.getString("Condition"),
      code: row.getString("ICM V4.0"),
      unique: row.getString("Unique code"),
    };
    const rowDiv = createRow(rowData);
    container.appendChild(rowDiv);
  });
}

function createRow(data) {
  const row = document.createElement("div");
  row.className = "resultRow";
  row.innerHTML = `
  <div>${data.system}</div>
  <div>${data.site}</div>
  <div>${data.process}</div>
  <div>${data.condition}</div>
  <div>${data.code}</div>
  <div>${data.unique}</div>
  `;

  row.onclick = () => selectRow(row, data);

  return row;
}

function selectRow(row, data) {
  document
    .querySelectorAll(".resultRow")
    .forEach((r) => r.classList.remove("selectedRow"));

  row.classList.add("selectedRow");

  document.getElementById("selectedContent").innerHTML =
    `${data.system} - ${data.site} - ${data.process} - ${data.condition} - ${data.code}`;
}

function copy_all() {
  let code = document.getElementById("selectedContent").textContent;
  navigator.clipboard.writeText(code);
  console.log("Copied to clipboard");
  alert(`Copied to clipboard:  ${code}`);
}

function copy_condition() {
  alert("Copy condition and code");
}

function copy_code() {
  alert("Copy code only");
}
