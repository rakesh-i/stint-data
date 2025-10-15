import "./styles.css";

document.addEventListener("DOMContentLoaded", function () {
    const mainContainer = document.getElementById("content");
    const selection = document.createElement("div");
    selection.className = 'selection';

    function createSection(title, id) {
        const section = document.createElement("div");
        section.classList.add(id, "content");
        
        const header = document.createElement("div");
        header.classList.add("header");
        header.textContent = title.toUpperCase();
        
        const containerDiv = document.createElement("div");
        containerDiv.classList.add(`${id}-container`, "container");
        
        const list = document.createElement("ul");
        list.id = `${id}-list`;
        containerDiv.appendChild(list);
        
        section.appendChild(header);
        section.appendChild(containerDiv);
        
        return section;
    }
    
    // Create selection sections
    const seasonSection = createSection("season", "year");
    const raceSection = createSection("race", "race");
    const sessionSection = createSection("session", "session");
    const driverSection = createSection("driver", "driver");

    selection.appendChild(seasonSection);
    selection.appendChild(raceSection);
    selection.appendChild(sessionSection);
    selection.appendChild(driverSection);

    mainContainer.appendChild(selection);
    
    // Add year options
    const yearList = document.getElementById("year-list");
    [2025, 2024, 2023].forEach(year => {
        const li = document.createElement("li");
        li.textContent = year;
        yearList.appendChild(li);
    });
    
    // Driver search buttons
    const searchDiv = document.createElement("div");
    searchDiv.id = "search";
    
    const searchButton = document.createElement("button");
    searchButton.id = "searchButton";
    searchButton.textContent = "SEARCH";
    
    const selectAllButton = document.createElement("button");
    selectAllButton.id = "selectall";
    selectAllButton.textContent = "SELECT ALL";
    
    searchDiv.appendChild(searchButton);
    searchDiv.appendChild(selectAllButton);

    driverSection.appendChild(searchDiv);
    
    // Divider
    const divider = document.createElement("div");
    divider.id = "divider";
    mainContainer.appendChild(divider);
    
    // Driver stint form
    const driverStintsForm = document.createElement("div");
    driverStintsForm.id = "driver-stints-form";
    mainContainer.appendChild(driverStintsForm);
    
    // Update Table Button
    const updateButton = document.createElement("button");
    updateButton.id = "update";
    updateButton.style.display = "none";
    updateButton.textContent = "UPDATE TABLE";
    // updateButton.onclick = function() { updateTable(); };
    mainContainer.appendChild(updateButton);
    
    // Loading Screen
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "loading-screen";
    loadingScreen.style.display = "none";
    
    const spinner = document.createElement("div");
    spinner.classList.add("spinner");
    loadingScreen.appendChild(spinner);
    mainContainer.appendChild(loadingScreen);
    
    // Table Container
    const tableDiv = document.createElement("div");
    tableDiv.classList.add("table");
    
    const tableContainer = document.createElement("div");
    tableContainer.id = "table-container";
    tableDiv.appendChild(tableContainer);
    mainContainer.appendChild(tableDiv);
    
    // Export Buttons
    const exportDiv = document.createElement("div");
    exportDiv.id = "export";
    exportDiv.style.display = "none";
    
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export to Excel";
    exportButton.id = 'export-but';
    // exportButton.onclick = function() { exportToExcel(); };
    
    const screenshotButton = document.createElement("button");
    screenshotButton.id = "screenshot-btn";
    screenshotButton.textContent = "Take Screenshot";
    
    exportDiv.appendChild(exportButton);
    exportDiv.appendChild(screenshotButton);
    mainContainer.appendChild(exportDiv);
    
    // Charts Container
    const chartsDiv = document.createElement("div");
    chartsDiv.id = "charts";
    chartsDiv.style.display = "none";
    
    const medianDiv = document.createElement("div");
    medianDiv.id = "median";
    
    const switchLabel = document.createElement("label");
    switchLabel.classList.add("switch");
    
    const toggleSwitch = document.createElement("input");
    toggleSwitch.type = "checkbox";
    toggleSwitch.id = "toggleSwitch";
    
    const slider = document.createElement("span");
    slider.classList.add("slider");
    
    const toggleLabel = document.createElement("span");
    toggleLabel.id = "toggleLabel";
    toggleLabel.textContent = "Median";
    
    switchLabel.appendChild(toggleSwitch);
    switchLabel.appendChild(slider);
    medianDiv.appendChild(switchLabel);
    medianDiv.appendChild(toggleLabel);
    chartsDiv.appendChild(medianDiv);
    
    ["boxPlot", "barPlot", "linePlot"].forEach(plot => {
        const plotDiv = document.createElement("div");
        plotDiv.id = plot;
        plotDiv.style.width = "100%";
        chartsDiv.appendChild(plotDiv);
        
        const divider = document.createElement("div");
        divider.id = "divider";
        chartsDiv.appendChild(divider);
    });
    
    mainContainer.appendChild(chartsDiv);

    
});

document.addEventListener("DOMContentLoaded", async () => {
    const footer = document.getElementById("footer");
    footer.style.display = "block";
    await import('./script.js');
    console.log('script.js loaded after HTML rendering');
});


