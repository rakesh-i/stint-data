const apiBaseURL = 'https://api.openf1.org/v1';
let driverMap = new Map();
let controller = new AbortController();
let conList = ['McLaren', 'Ferrari', 'Red Bull Racing', 'Mercedes', 'Aston Martin', 'Alpine', 'Haas F1 Team', 'RB', 'Williams', 'Kick Sauber','null', null];
let curYear = 2025;

function selectYear(event) {
    const listYears = document.querySelectorAll('.year-container li');
    listYears.forEach(item => item.classList.remove('choose'));
    
    const formlist = document.querySelector('#driver-stints-form');
    formlist.innerHTML = '';

    event.target.classList.add('choose');
    curYear = parseInt(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchMeetings(event.target.textContent);

}

function selectRace(event){
    const listRaces = document.querySelectorAll('.race-container li');
    listRaces.forEach(item => item.classList.remove('choose'));

    const formlist = document.querySelector('#driver-stints-form');
    formlist.innerHTML = '';

    event.target.classList.add('choose');
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    fetchSessions(event.target.textContent);
}

function selectSession(event){
    const listSession = document.querySelectorAll('.session-container li');
    listSession.forEach(item => item.classList.remove('choose'));

    const formlist = document.querySelector('#driver-stints-form');
    formlist.innerHTML = '';

    event.target.classList.add('choose');
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showDriverSearch(event.target.value);

}

function selectDriver(event){
    const listDriver = document.querySelectorAll('#driver-list li');
    event.target.classList.toggle('choose');
    searchDriver();
}

function createDriverList(data){
    const driverList = document.querySelector('#driver-list');
    driverList.innerHTML = '';
    
    let array = [...data];
    if(curYear==2025){
        array.sort((a, b)=>{
            return conList.indexOf(a.team_name) - conList.indexOf(b.team_name);
        });
    }
    array.forEach(x=>{
        const driver = document.createElement('li');
        driver.value = x.driver_number;
        driver.dataset.team = x.team_name;
        driver.dataset.team_color = x.team_colour;
        driver.textContent = x.broadcast_name;
        driverList.appendChild(driver);
    });
    const listDriver = document.querySelectorAll('#driver-list li');
    listDriver.forEach(item=>{
        item.addEventListener('click', selectDriver);
    });
}

function createSessionList(data){
    const sessionList = document.querySelector('#session-list');
    sessionList.innerHTML = '';
    data.forEach(x=>{
        const session = document.createElement('li');
        session.value = x.session_key;
        session.textContent = x.session_name;
        sessionList.appendChild(session);
    });

    const listSession = document.querySelectorAll('.session-container li');

    listSession.forEach(item=>{
        item.addEventListener('click', selectSession);
    });
    let n = listSession.length;
    if(n>0){
        listSession[n-1].classList.add('choose');
        listSession[n-1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showDriverSearch(listSession[n-1].value);
}

function createRacelist(data){
    const raceList = document.querySelector('#race-list');
    raceList.innerHTML = '';
    data.forEach(x=>{
        const race = document.createElement('li');
        race.value = x.country_name;
        race.textContent = x.country_name;
        raceList.appendChild(race);
    });

    const listRaces = document.querySelectorAll('.race-container li');
    
    listRaces.forEach(item=>{
        item.addEventListener('click', selectRace);
    })
    let n = listRaces.length;
    listRaces[n-1].classList.add('choose');
    listRaces[n-1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchSessions(listRaces[n-1].textContent);
}   

function createYearlist(){
    const listYears = document.querySelectorAll('.year-container li');

    listYears.forEach(item => {
        item.addEventListener('click', selectYear);
    });

    listYears[0].classList.add('choose');
    listYears[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchMeetings(listYears[0].textContent);
}

async function fetchMeetings(year){
    try {
        let meetings = await fetch(`${apiBaseURL}/meetings?year=${year}`);
        let data = await meetings.json();
        createRacelist(data);
    }
    catch (error) {
        console.log(error);
    }
}

async function fetchSessions(country) {;
    try {
        const year = document.querySelector('.year-container li.choose').textContent;

        if (!country) {
            alert('Please select l_name country.');
            return;
        }
        let session = await fetch(`${apiBaseURL}/sessions?country_name=${country}&year=${year}`);
        let data = await session.json();

        createSessionList(data);
    } catch (error) {
        console.log(error);
    }
    
}

async function showDriverSearch(sessionKey) {
    try {
        let drivers = await fetch(`${apiBaseURL}/drivers?session_key=${sessionKey}`);
        let data = await drivers.json();

        if (!sessionKey) {
            alert('Please select l_name session.');
            return;
        }
        createDriverList(data);
    } catch (error) {
        console.log(error);
    }
    
}

async function gatherdata(driver_number, name, team, team_color){
    try {
        const stint = [];
        const stinttyre = [];
        const sessionKey = document.querySelector('#session-list li.choose').value;
        let response = await fetch(`${apiBaseURL}/laps?session_key=${sessionKey}&driver_number=${driver_number}`, { signal: controller.signal });
        const data1 = await response.json();
        response = await fetch(`${apiBaseURL}/stints?session_key=${sessionKey}&driver_number=${driver_number}`, { signal: controller.signal });
        const data2 = await response.json();

        if(!data1||!data2){
            throw new Error('Missing data for driver', driver_number);
        }

        for (let i in data2) {
            stint.push([]);
        }

        for (let i in data2) {
            let start = data2[i].lap_start;
            let end = data2[i].lap_end;
            stinttyre.push(data2[i].compound);
            for (let j = start; j <= end; j++) {
                let x = data1[j-1];
                if(x==undefined){
                    stint[i].push('NaN');
                }
                else if(x.lap_duration===null){
                    stint[i].push('NaN');
                }
                else{
                    stint[i].push(x.lap_duration.toFixed(3));
                }         
            }
        }
        driverMap.set(`${name}`, {
            laptimes: [...stint],
            tyres: [...stinttyre],
            num: driver_number, 
            team_name: team,
            team_color: team_color
        });
    } catch (error) {
        console.log(error);
    }
}

function displayTable(stintmap) {
    let l_name = [];
    let t_name = [];
    let d_name = [];
    let stintnum = new Map();
    let c = 0;
    let x = 0;
    for(let [driver, data] of stintmap){
        d_name.push([driver, data.laptimes.length, data.team_color]);
        if(x>0){
            c += data.laptimes.length;
        }
        else{
            c += data.laptimes.length-1;
        }
        x++;
        stintnum.set(c, 1);
        for(let i=0; i<data['laptimes'].length; i++){
            l_name.push(data.laptimes[i]);
            t_name.push(data.tyres[i]);
        }
    }

    // console.log(l_name, t_name, d_name);
    
    // console.log(stintmap);

    const container = document.getElementById('table-container');
    if(l_name.length==0){
        container.innerHTML = '';
        return;
    }
    let table = '<table border="1">';
    
    // Drivers name
    table += '<tr>';
    table += '<th class="border-bottom border-right border-left">Driver</th>';
    for (let i = 0; i < d_name.length; i++) {
        table+= `<th class="border-bottom border-right border-left" style="background-color:#${d_name[i][2]}" colspan="${d_name[i][1]}">${d_name[i][0]}</th>`
    }
    table += '</tr>';

    // Tyres name
    table += '<tr>';
    table += '<th class="border-bottom border-right border-left">Tyre</th>';
    for (let i = 0; i < l_name.length; i++) {
        if(i==0){
            if(stintnum.has(i)){
                table += `<th class="${t_name[i]} border-left border-right border-bottom">${t_name[i]}</th>`;
            }
            else{
                table += `<th class="${t_name[i]} border-left border-bottom">${t_name[i]}</th>`;
            }
            
        }
        else if(stintnum.has(i)){
            table += `<th class="${t_name[i]} border-right border-bottom">${t_name[i]}</th>`;
        }
        else{
            table += `<th class="${t_name[i]} border-bottom">${t_name[i]}</th>`;
        }
        
    }
    table += '</tr>';


    let maxLaps = Math.max(...l_name.map(s => s.length));
    for (let j = 0; j < maxLaps; j++) {

        table += '<tr>';
        if (j === 0) {
            table += '<th rowspan="' + maxLaps + '">Laps</th>';
        }
        for (let i = 0; i < l_name.length; i++) {
            let timeFormated = convertTime(l_name[i][j]);
            if(i==0){
                if(stintnum.has(i)){
                    table += `<td class="lap selected border-left border-right" data-stint="${i}" data-lap="${j}" value="${l_name[i][j] || ''}">${timeFormated || ''}</td>`;
                }
                else{
                    table += `<td class="lap selected border-left" data-stint="${i}" data-lap="${j}" value="${l_name[i][j] || ''}">${timeFormated || ''}</td>`;
                }
            }
            else if(stintnum.has(i)){
                table += `<td class="lap selected border-right" data-stint="${i}" data-lap="${j}" value="${l_name[i][j] || ''}">${timeFormated || ''}</td>`;
                
            }
            else if(i==l_name.length-1){
                table += `<td class="lap selected border-right" data-stint="${i}" data-lap="${j}" value="${l_name[i][j] || ''}">${timeFormated || ''}</td>`;
            }
            else{
                table += `<td class="lap selected" data-stint="${i}" data-lap="${j}" value="${l_name[i][j] || ''}">${timeFormated || ''}</td>`;
            }
        }
        table += '</tr>';
    }

    // Averages 
    table += '<tr>';
    table += '<th class="border-top">Average</th>';
    for (let i = 0; i < l_name.length; i++) {
        if(i==0){
            if(stintnum.has(i)){
                table += `<td id="avg-${i}" class="border-left border-right border-top">0.000</td>`;
            }
            else{
                table += `<td id="avg-${i}" class="border-left border-top">0.000</td>`;
            }
            
        }
        else if(stintnum.has(i)){
            table += `<td id="avg-${i}" class="border-right border-top">0.000</td>`;
        }
        else{
            table += `<td id="avg-${i}" class="border-top">0.000</td>`;
        }
        
    }
    table += '</tr>';

    table += '</table>';
    container.innerHTML = table;

    document.querySelectorAll('.lap').forEach(cell => {
        cell.addEventListener('click', () => {
            if (cell.classList.contains('selected')) {
                cell.classList.remove('selected');
                cell.classList.add('deselected');
            } else {
                cell.classList.remove('deselected');
                cell.classList.add('selected');
            }
            updateAverages(l_name, t_name);
        });
    });

    updateAverages(l_name, t_name);
}

function convertTime(sss_mmm) {
    if(!sss_mmm){
        return '';
    }
    let [seconds, milliseconds] = sss_mmm.split('.');

    seconds = parseInt(seconds, 10);
    
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    if(milliseconds==undefined|| minutes===NaN|| remainingSeconds===NaN){
        return 'NaN';
    }
    
    let formattedTime = `${String(minutes).padStart(1, '0')}:${String(remainingSeconds).padStart(2, '0')}.${milliseconds}`;
    
    return formattedTime;
}

function updateAverages(l_name, t_name) {
    for (let i = 0; i < l_name.length; i++) {
        let sum = 0;
        let count = 0;
        document.querySelectorAll(`.lap[data-stint="${i}"]`).forEach(cell => {
            if (cell.classList.contains('selected')) {
                const lapTime = parseFloat(cell.getAttribute('value'));
                if (!isNaN(lapTime)) {
                    sum += lapTime;
                    count++;
                }
            }
        });
        const average = count === 0 ? 0 : (sum / count).toFixed(3);
        let timeFormated = convertTime(average);
        document.getElementById(`avg-${i}`).textContent = timeFormated;
    }
}

function exportToExcel() {
    try {
        const table = document.querySelector('table');
        const wb = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
        XLSX.writeFile(wb, 'stint_data.xlsx');
    } catch (error) {
        console.log(error);
    }
    
}

async function searchDriver(){
    try{
        controller.abort(); 
        controller = new AbortController();
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        driverMap.clear();
        const selectedDriver = document.querySelectorAll('#driver-list .choose');
        if(selectedDriver.length!=0){
            document.getElementById('selectall').classList.add('clicked');
            document.getElementById('selectall').textContent = 'Unselect All';
        }
        if(selectedDriver.length==0){
            document.getElementById('selectall').classList.remove('clicked');
            document.getElementById('selectall').textContent = 'Select All';
        }
        for (let i = 0; i < selectedDriver.length; i++) {
            const element = selectedDriver[i];
            await gatherdata(element.value, element.textContent, element.dataset.team, element.dataset.team_color);
        }
        generateStintSelection();
        }
    catch(error){
        console.log(error);
        document.getElementById('loading-screen').style.display = 'none';
    }
    
}

function generateStintSelection() {
    const formContainer = document.getElementById('driver-stints-form');
    formContainer.innerHTML = '';
    document.getElementById('loading-screen').style.display = 'none';

    let array = [...driverMap];
    if(curYear==2024){
        array.sort((a, b)=>{
            return conList.indexOf(a[1].team_name) - conList.indexOf(b[1].team_name);
        });
    }
    else{
        array.sort((a, b)=>{
            if (a[1].team_name < b[1].team_name) return -1;
            if (a[1].team_name > b[1].team_name) return 1;
            return 0;
        });
    }
    // console.log(array);
    
    driverMap = new Map(array);

    for (let [driver, data] of driverMap) {
        const driverDiv = document.createElement('div');
        driverDiv.className = 'driver-div';
        driverDiv.dataset.driverno = data.num;

        const driverLabel = document.createElement('div');
        driverLabel.textContent = `${driver}`;
        driverLabel.className = 'drivername'

        const del = document.createElement('button');
        del.textContent = 'REMOVE';
        del.className = 'del-button'
        del.value = data.num;

        driverDiv.appendChild(del);
        driverDiv.appendChild(driverLabel);
        
        for (let i = 0; i < data.laptimes.length; i++) {
            const holder = document.createElement('div');
            holder.className = 'holder';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `stint-${driver}-${i}`;
            checkbox.value = i;
            checkbox.checked = true; 
            
            const label = document.createElement('label');
            const stintLapCount = data.laptimes[i].length;
            label.htmlFor = `stint-${driver}-${i}`;
            const tyreType = data.tyres[i];
            label.textContent = ` ${tyreType} (${stintLapCount} laps)`;
            
            holder.appendChild(checkbox);
            holder.appendChild(label);
            driverDiv.appendChild(holder);
        }

        del.addEventListener('click', (event)=>{
            const ul = document.getElementById('driver-list');
            const list = ul.getElementsByTagName('li');
            for(let li of list){
                if(li.getAttribute('value')===event.target.value){
                    li.classList.remove('choose');
                    removeCard(parseInt(event.target.value));
                }
            }
        });
        formContainer.appendChild(driverDiv);
    }
}

function removeCard(dec){    
    const card = document.querySelector(`.driver-div[data-driverno="${dec}"]`);
    card.remove();
    updateTable();
}

function updateTable(){
    let stintmap = new Map();
    for (let [driver, data] of driverMap) {
        let laps = [];
        let tyres = [];
        for (let i = 0; i < data.laptimes.length; i++) {
            const checkbox = document.getElementById(`stint-${driver}-${i}`);
            if (checkbox && checkbox.checked) {
                laps.push(data.laptimes[i]);
                tyres.push(data.tyres[i]);
            }
        }
        if(laps.length!=0){
            stintmap.set(driver, {
                laptimes:[...laps],
                tyres: [...tyres],
                team_name: data.team_name,
                team_color: data.team_color
            });
        }
        else{
            stintmap.delete(driver);
        }
        
    }
    
    let traces = [];
    let traceData = [];
    let allLapTimes = [];
    
    stintmap.forEach((data, driver) => {
        data.laptimes.forEach((stint, index) => {
            // let stint = data.laptimes[i];
            let median = getMedian(stint);
            traceData.push({
                median: median,
                trace:{
                    y: removeOutliers(stint),
                    type: "box",
                    boxpoints: false,
                    jitter: 0.5,
                    whiskerwidth: 0.2,
                    name: `${driver}`,
                    marker: { color: data.team_color,  size: 2 },
                    line:{
                        width: 1
                    }
                }
            });
        });
    });
    // console.log(allLapTimes);
    // console.log(traces);
    // Layout configuration
    let layout = {
        title: "Lap Times by Driver and Tyre",
        yaxis: { autorange: true,
                showgrid: true,
                zeroline: true,
                dtick: 5,
                gridcolor: 'rgb(255, 255, 255)',
                gridwidth: 1,
                zerolinecolor: 'rgb(255, 0, 0)',
                zerolinewidth: 2,
                dtick: 2
            },
            margin: {
                l: 40,
                r: 30,
                b: 80,
                t: 100
            },
            paper_bgcolor: 'rgb(243, 243, 243)',
            plot_bgcolor: 'rgb(243, 243, 243)',
            showlegend: false 
        
    };

    // Sort traces by median lap time
    traceData.sort((a, b) => a.median - b.median); // Ascending order (fastest first)

    // Extract sorted traces
    traces = traceData.map(item => item.trace);

    // Render the plot
    Plotly.newPlot("boxPlot", traces, layout);

    displayTable(stintmap);
}

function getMedian(arr) {
    let sorted = [...arr].filter(v => v !== 'NaN' && !isNaN(v)).map(v => parseFloat(v)).sort((a, b) => a - b);
    let mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function removeOutliers(data, threshold = 1.1) {
    let cleanedData = data
        .filter(val => val !== 'NaN' && !isNaN(val)) // Remove 'NaN' text & actual NaNs
        .map(val => parseFloat(val)); // Convert to numbers

    if (cleanedData.length < 4) return cleanedData; // Too few data points

    let sorted = cleanedData.sort((a, b) => a - b);
    let q1 = sorted[Math.floor(sorted.length / 4)];
    let q3 = sorted[Math.ceil(sorted.length * (3 / 4)) - 1];
    let iqr = q3 - q1;
    
    let lowerBound = q1 - parseFloat(threshold) * iqr;
    let upperBound = q3 + parseFloat(threshold) * iqr;
    // console.log(sorted, q1, q3, iqr, lowerBound,upperBound);
    let asdf = sorted.filter(val => val >= lowerBound && val <= upperBound);
    // console.log(asdf);
    return asdf;
}


document.getElementById('screenshot-btn').addEventListener('click', function() {
    let tableContainer = document.getElementById('table-container');
    
    html2canvas(tableContainer).then(function(canvas) {
        
        let link = document.createElement('a');
        link.href = canvas.toDataURL();  
        link.download = 'screenshot.png';  
        link.click();  
    });
});

document.getElementById('selectall').addEventListener('click', function(){
    if(this.classList.contains('clicked')){
        this.classList.remove('clicked');
        const listDriver = document.querySelectorAll('#driver-list li');
        listDriver.forEach(item=> item.classList.remove('choose'));
        this.textContent = 'Select All';
        searchDriver();
    }
    else{
        document.getElementById('loading-screen').style.display = 'flex';
        this.classList.add('clicked');
        const listDriver = document.querySelectorAll('#driver-list li');
        listDriver.forEach(item=> item.classList.add('choose'));
        this.textContent = 'Unselect All';
        searchDriver();
    }
});

document.getElementById("downloadPlot").addEventListener("click", function () {
    Plotly.downloadImage("plot", {
        format: "png",  // Change to 'svg', 'jpeg', or 'webp' if needed
        width: 1920,    // Ensures high resolution
        height: 1080,   // At least 1080p
        filename: "lap_times_plot"
    });
});


createYearlist();

