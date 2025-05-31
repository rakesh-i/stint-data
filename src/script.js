import {CounterAPI} from "counterapi";

const counter = new CounterAPI();
const apiBaseURL = 'https://api.openf1.org/v1';
// const apiBaseURL = 'http://127.0.0.1:8000/v1';
let driverMap = new Map();
let controller = new AbortController();
let conList = ['McLaren', 'Mercedes', 'Red Bull Racing', 'Williams', 'Aston Martin', 'Kick Sauber', 'Ferrari',  'Alpine',  'Racing Bulls', 'Haas F1 Team', 'null', null];
let curYear = 2025;
let toggleLabel = document.getElementById('toggleLabel');
let orderby = "Median";
const exportdiv = document.getElementById('export');
const container = document.getElementById('table-container');
const chart = document.getElementById('charts');
const boxDiv = document.getElementById('boxPlot');
const barDiv = document.getElementById('barPlot');
const lineDiv = document.getElementById('linePlot'); 
const loadingScreen = document.getElementById('loading-screen');
const counterDiv = document.getElementById('count');

// please don't break it.
// counter.up("rakesh-i.github.io", "stint-data").then((res) => {
//     counterDiv.textContent = res.Count;
// })

// Interactions
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
    // searchDriver();
}

// Create lists
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

// API calls and gathering data
async function fetchMeetings(year){
    try {
        let meetings = await fetch(`${apiBaseURL}/meetings?year=${year}`);

        if(!meetings.ok){
            if (!meetings.status === 500) {
                alert("🚨 Server Error (500). Please try again later.");
            } else if (meetings.status === 429) {
                alert("⚠️ Too many requests (429). Please wait and try again.");
            } else {
                alert(`❌ Error ${meetings.status}: ${meetings.statusText}`);
            }
            return null;
        }
        let data = await meetings.json();
        createRacelist(data);
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("Request was aborted.");
        } else if (error instanceof TypeError && error.message === "Failed to fetch") {
            alert("Failed to reach server.");
        } else {
            alert(`❗ Unexpected error: ${error.message}`);
        }
        console.log(error);
        return null;
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
        if(!session.ok){
            if (!session.status === 500) {
                alert("🚨 Server Error (500). Please try again later.");
            } else if (session.status === 429) {
                alert("⚠️ Too many requests (429). Please wait and try again.");
            } else {
                alert(`❌ Error ${session.status}: ${session.statusText}`);
            }
            return null;
        }
        let data = await session.json();

        createSessionList(data);
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Request was aborted.");
        } else if (error instanceof TypeError && error.message === "Failed to fetch") {
            alert("Failed to reach server.");
        } else {
            alert(`❗ Unexpected error: ${error.message}`);
        }
        console.log(error);
        return null;
    }
    
}

async function showDriverSearch(sessionKey) {
    try {
        let drivers = await fetch(`${apiBaseURL}/drivers?session_key=${sessionKey}`);
        if(!drivers.ok){
            if (!drivers.status === 500) {
                alert("🚨 Server Error (500). Please try again later.");
            } else if (drivers.status === 429) {
                alert("⚠️ Too many requests (429). Please wait and try again.");
            } else {
                alert(`❌ Error ${drivers.status}: ${drivers.statusText}`);
            }
            return null;
        }
        let data = await drivers.json();
        
        if (!sessionKey) {
            alert('Please select l_name session.');
            return;
        }
        createDriverList(data);
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Request was aborted.");
        } else if (error instanceof TypeError && error.message === "Failed to fetch") {
            alert("Failed to reach server.");
        } else {
            alert(`❗ Unexpected error: ${error.message}`);
        }
        console.log(error);
        return null;
    }
    
}

async function gatherdata(driver_number, name, team, team_color){
    try {
        const stint = [];
        const stinttyre = [];
        const sessionKey = document.querySelector('#session-list li.choose').value;
        let response = await fetch(`${apiBaseURL}/laps?session_key=${sessionKey}&driver_number=${driver_number}`, { signal: controller.signal });
        if (!response.ok) {
            if (response.status === 500) {
                alert("🚨 Server Error (500). Please try again later.");
            } else if (response.status === 429) {
                alert("⚠️ Too many requests (429). Please wait and try again.");
            } else {
                alert(`❌ Error ${response.status}: ${response.statusText}`);
            }
            return null;
        }
        const data1 = await response.json();
        response = await fetch(`${apiBaseURL}/stints?session_key=${sessionKey}&driver_number=${driver_number}`, { signal: controller.signal });
        if (!response.ok) {
            if (response.status === 500) {
                alert("🚨 Server Error (500). Please try again later.");
            } else if (response.status === 429) {
                alert("⚠️ Too many requests (429). Please wait and try again.");
            } else {
                alert(`❌ Error ${response.status}: ${response.statusText}`);
            }
            return null;
        }
        const data2 = await response.json();
        // console.log(data1);
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
                    stint[i].push(['NaN', 'NaN']);
                }
                else if(x.lap_duration===null){
                    stint[i].push(['NaN', x.lap_number]);
                }
                else{
                    stint[i].push([x.lap_duration.toFixed(3), x.lap_number]);
                }         
            }
        }
        
        const sessionType = document.querySelector(".session-container .choose")?.textContent || "";
        if (sessionType.toLowerCase() == "sprint" || sessionType.toLowerCase().includes("race")) {
            let allLaps = [];
            for (let i = 0; i < stint.length; i++) {
                allLaps = allLaps.concat(stint[i]); 
            }
            stint.push(allLaps);
            stinttyre.push("ALL"); 
        }

        driverMap.set(`${name}`, {
            laptimes: [...stint],
            tyres: [...stinttyre],
            num: driver_number, 
            team_name: team,
            team_color: team_color
        });
        
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Request was aborted.");
        } else if (error instanceof TypeError && error.message === "Failed to fetch") {
            alert("Failed to reach server.");
        } else {
            alert(`❗ Unexpected error: ${error.message}`);
        }
        console.log(error);
        return null;
    }
}

// Displaying data
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

    chart.style.display = "block";
    exportdiv.style.display = 'flex';
    if(l_name.length==0){
        container.innerHTML = '';
        chart.style.display = 'none';
        exportdiv.style.display = 'none';
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
        // console.log(l_name);
        for (let i = 0; i < l_name.length; i++) {
            // console.log(l_name[i][j]);
            let timeFormated = l_name[i][j]!==undefined?convertTime(l_name[i][j][0]):'';
            
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
            updatePlot();
        });
    });

    updateAverages(l_name, t_name);
    
}

function updatePlot() {
    var x;
    var y;
    const selectiondiv = document.getElementsByClassName('selection');
    x = selectiondiv.clientWidth;
    if(x>1080){
        y = x/1.777;
    }
    let stintmap = new Map();
    const table = document.querySelector("table");
    if (!table) return;

    const rows = table.querySelectorAll("tr");
    let drivers = [];
    let stintCounts = []; 
    let tyres = [];
    let teamColors = [];
    let stintLapTimes = [];

    const driverCells = rows[0].querySelectorAll("th");
    for (let i = 1; i < driverCells.length; i++) {
        let driver = driverCells[i].textContent.trim();
        let stintCount = parseInt(driverCells[i].getAttribute("colspan")) || 1;
        let teamColor = driverCells[i].style.backgroundColor || "#000000"; 

        drivers.push(driver);
        stintCounts.push(stintCount);
        teamColors.push(teamColor);
    }

    const tyreCells = rows[1].querySelectorAll("th");
    for (let i = 1; i < tyreCells.length; i++) { 
        tyres.push(tyreCells[i].textContent.trim());
    }


    let driverIndex = 0;
    let stintIndex = 0;
    let driverStints = new Map();

    drivers.forEach((driver, i) => {
        driverStints.set(driver, { laptimes: [], tyres: [], teamColor: teamColors[i] });
        for (let j = 0; j < stintCounts[i]; j++) {
            driverStints.get(driver).laptimes.push([]);
            driverStints.get(driver).tyres.push(tyres[stintIndex]);
            stintIndex++;
        }
    });

    for (let rowIndex = 2; rowIndex < rows.length - 1; rowIndex++) { 
        const lapCells = rows[rowIndex].querySelectorAll("td");
        stintIndex = 0;
        driverIndex = 0;
        for (let i = 0; i < lapCells.length; i++) {
            let time = lapCells[i].getAttribute("value").split(",");
            let lapNumber = time[1] === "NaN" ? NaN : parseFloat(time[1]);
            let numericTime = time[0] === "NaN" ? NaN : parseFloat(time[0]);

            if (lapCells[i].classList.contains("selected")) {
                driverStints.get(drivers[driverIndex]).laptimes[stintIndex].push([numericTime, lapNumber]);
            }

            stintIndex++;
            if (stintIndex >= stintCounts[driverIndex]) {
                stintIndex = 0;
                driverIndex++;
            }
        }
    }

    driverStints.forEach((data, driver) => {
        stintmap.set(driver, {
            laptimes: data.laptimes,
            tyres: data.tyres,
            teamColor: data.teamColor
        });
    });

    let traces = [];
    let traceData = [];

    stintmap.forEach((data, driver) => {
        let tyreCount = {};

        data.laptimes.forEach((stint, index) => {
            let filteredLaps = removeOutliers(stint);
            let y = filteredLaps.map(item=>item[0]);
            let median = getMedian(y);
            let mean = getMean(y);
            let tyre = data.tyres[index].slice(0, 3).toUpperCase();
            let lastName = driver.split(" ").pop().slice(0, 3).toUpperCase();

            if (!tyreCount[tyre]) {
                tyreCount[tyre] = 1;
            } else {
                tyreCount[tyre]++;
                tyre += ` (${tyreCount[tyre]})`; 
            }
            if(mean!=-1&&median!==-1){
                traceData.push({
                    median: median,
                    mean: mean, 
                    trace: {
                        y: y,
                        type: "box",
                        boxpoints: false,
                        name: tyre==='ALL'?`${lastName}`:`${lastName}-${tyre}`,
                        marker: { color: 'white'},
                        fillcolor:data.teamColor,
                        outliercolor: data.teamColor,
                        jitter: 0.5,
                        whiskerwidth: 0.2,
                        line: { width: 2 },
                        boxpoints: 'suspectedoutliers',
                        boxmean:(orderby=='Mean')?true:false
                    }
                });
            }
            
        });
    });
    
    if(orderby=='Mean'){
        traceData.sort((a, b) => a.mean - b.mean);
    }
    else{
        traceData.sort((a, b) => a.median - b.median);
    }
    
    traces = traceData.map(item => item.trace);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:.Z]/g, "").slice(3, 14);
    let config = {
        responsive: true,
        toImageButtonOptions: {
          format: 'png', // one of png, svg, jpeg, webp
          filename: `plot_${timestamp}`,
          height: 1080,
          width: 1080,
          scale:1
        }
    };

    let layout1 = {
        title :{
            text: `Race Pace Sorted by ${orderby}`
        },
        xaxis:{
            tickangle: -90,
            
        },
        yaxis: { 
            title:{
                text : "LAP TIME"
            },
            // autorange: true, 
            showgrid: true,
            gridcolor: 'rgb(50, 50, 50)',
            gridwidth: 1,
            // scaleanchor: "x",
            
        },
        margin: {
            l: 50,
            r: 30,
            // b: 65,
            // t: 65
        },
        paper_bgcolor: "rgb(0,0,0)",
        plot_bgcolor: "rgb(0,0,0)",
        showlegend: false,
        font: {
            color: '#ffffff',
            // size: 14 
        },
        modebar: {
            remove: 'lasso2dp',
            orientation: 'v'
        },
        height: y,
        width: x,
    };

    // bar graph
    let first = (orderby=="Mean")?traceData[0].mean:traceData[0].median;
    let bar = [
        {
            y: (orderby=="Mean")?traceData.map(item=>item.mean/first*100-100):traceData.map(item=>item.median/first*100-100),

            x: traceData.map(item=>item.trace.name),
            text: (orderby=="Mean")?traceData.map(item=>(item.mean/first*100-100).toFixed(3)+"%"):traceData.map(item=>(item.median/first*100-100).toFixed(3)+"%"),
            marker:{
                color: traceData.map(item=>item.trace.fillcolor),
            },
            type: 'bar',
            textposition: "auto",
            textfont : {
                // size: 16,
                weight: 700
                
            },
            textangle: "-90"
        }
    ];

    let layout2 = {
        title :{
            text: `Deficit to the leader Sorted by ${orderby}`
        },
        xaxis:{
            tickangle: -90,
        },
        yaxis: { 
            title:{
                text : "SLOWER ===>"
            },
            autorange: true, 
            showgrid: true,
            gridcolor: 'rgb(50, 50, 50)',
            gridwidth: 1,
         },
        margin: {
            l: 50,
            r: 30,
            // b: 65,
            // t: 65
        },
        paper_bgcolor: "rgb(0,0,0)",
        plot_bgcolor: "rgb(0,0,0)",
        showlegend: false,
        font: {
            color: '#ffffff',
            // size: 14 
        },
        modebar: {
            remove: 'lasso',
            orientation: 'v'
        },
        height: y,
        width: x,
    };

    // Line chart
    let layout3 = {
        title :{
            text: `Race Progression`
        },
        xaxis:{
            // tickangle: 90,
        },
        yaxis: { 
            title:{
                text : "LAP TIME"
            },
            autorange: true, 
            showgrid: true,
            gridcolor: 'rgb(50, 50, 50)',
            gridwidth: 1,
         },
        margin: {
            l: 50,
            r: 30,
            // b: 65,
            // t: 65
        },
        paper_bgcolor: "rgb(0,0,0)",
        plot_bgcolor: "rgb(0,0,0)",
        font: {
            color: '#ffffff',
            // size: 14 
        },
        modebar: {
            remove: 'lasso2dp',
            orientation: 'v'
        },
        legend: {"orientation": "h"},
        height: y,
        width: x,
    };

    let linetraces = [];
    let colorCount = {};
    stintmap.forEach((data, driver) => {
        let color = data.teamColor;
        if (!colorCount[color]) {
            colorCount[color] = 1;
        } else {
            colorCount[color]++; 
        }
        data.laptimes.forEach((stint, index) => {
            let filteredLaps = removeOutliers(stint);
            let y = filteredLaps.map(item=>item[0]);
            let x = filteredLaps.map(item=>item[1]);
            let lastName = driver.split(" ").pop().slice(0, 3).toUpperCase();

            linetraces.push ({
                y: y,
                x: x,
                type: "scatter",
                name: `${lastName}`,
                marker: { color: data.teamColor, size: 2 },
                line: { 
                    dash: (colorCount[data.teamColor]===1)?'solid':'dot',
                    width: 2 
                },
            });
        });
    });


    Plotly.newPlot("boxPlot", traces, layout1, config);
    Plotly.newPlot("barPlot", bar, layout2, config);
    Plotly.newPlot("linePlot", linetraces, layout3, config);

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    const resizePlot = debounce(function() {
        let x = boxDiv.clientWidth; 
        let height = x < 1080 ? x : x / 1.777;
    
        [boxDiv, barDiv, lineDiv].forEach(div => {
            Plotly.relayout(div, { width: x, height: height });
        });
    }, 200);
    
    window.addEventListener("resize", resizePlot);
    
    window.onload = resizePlot;
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
        loadingScreen.style.display = 'flex';
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        const chart = document.getElementById('charts');
        chart.style.display = "none";
        const exportdiv = document.getElementById('export');
        exportdiv.style.display = 'none';
        driverMap.clear();
        const selectedDriver = document.querySelectorAll('#driver-list .choose');
        if(selectedDriver.length!=0){
            document.getElementById('selectall').classList.add('clicked');
            document.getElementById('selectall').textContent = 'UNSELECT ALL';
        }
        if(selectedDriver.length==0){
            document.getElementById('selectall').classList.remove('clicked');
            document.getElementById('selectall').textContent = 'SELECT ALL';
        }
        for (let i = 0; i < selectedDriver.length; i++) {
            const element = selectedDriver[i];
            await gatherdata(element.value, element.textContent, element.dataset.team, element.dataset.team_color);
        }
        generateStintSelection();
        }
    catch(error){
        console.log(error);
        loadingScreen.style.display = 'none';
    }
    
}

function generateStintSelection() {
    const formContainer = document.getElementById('driver-stints-form');
    formContainer.innerHTML = '';
    loadingScreen.style.display = 'none';
    const updatebutton = document.getElementById('update');
    updatebutton.style.display = 'block';
    let array = [...driverMap];
    if(curYear==2025){
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
    
    driverMap = new Map(array);
    if(array.length==0){
        updatebutton.style.display = 'none';
    }
    else{
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
            const sessionType = document.querySelector(".session-container .choose")?.textContent || "";
            
            for (let i = 0; i < data.laptimes.length; i++) {
                const holder = document.createElement('div');
                holder.className = 'holder';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `stint-${driver}-${i}`;
                checkbox.value = i;
                
                const label = document.createElement('label');
                const stintLapCount = data.laptimes[i].length;
                label.htmlFor = `stint-${driver}-${i}`;
                const tyreType = data.tyres[i];
                label.textContent = ` ${tyreType} (${stintLapCount} laps)`;
    
                
                if (sessionType.toLowerCase() == "sprint" || sessionType.toLowerCase().includes("race") ) {
                    if(label.textContent.toLocaleLowerCase().includes("all")){
                        checkbox.checked = true; 
                    }
                    else{
                        checkbox.checked = false; 
                    }
                }
                else{
                    checkbox.checked = true; 
                }
                
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
    displayTable(stintmap);
    updatePlot();
}

function getMedian(arr) {
    if(arr.length<1){
        return -1;
    }
    let sorted = [...arr].filter(v => v !== 'NaN' && !isNaN(v)).map(v => parseFloat(v)).sort((a, b) => a - b);
    let mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getMean(arr){
    if(arr.length<1){
        return -1;
    }
    let sorted = [...arr].filter(v => v !== 'NaN' && !isNaN(v)).map(v => parseFloat(v)).sort((a, b) => a - b);
    let sum = 0;
    for(let i=0; i<sorted.length; i++){
        sum+=sorted[i];
    }
    return sum/sorted.length;
}

function removeOutliers(data) {
    let cleanedData = data.filter(val => val[0] !== 'NaN' && !isNaN(val[0])).map(val => [parseFloat(val[0]), parseInt(val[1])]); 
    return cleanedData;
}

// Buttons
document.getElementById('screenshot-btn').addEventListener('click', function() {
    const tableContainer = document.getElementById('table-container');
    
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
        this.textContent = 'SELECT ALL';
        searchDriver();
    }
    else{
        loadingScreen.style.display = 'flex';
        this.classList.add('clicked');
        const listDriver = document.querySelectorAll('#driver-list li');
        listDriver.forEach(item=> item.classList.add('choose'));
        this.textContent = 'UNSELECT ALL';
        searchDriver();
    }
});

let isMedianSort = true; // Default OFF state

document.getElementById('toggleSwitch').addEventListener("change", function(){
    isMedianSort = !isMedianSort;
    toggleLabel.textContent = isMedianSort ? "Median" : "Mean";
    orderby = isMedianSort ? "Median" : "Mean";
    updatePlot();
})

document.getElementById("searchButton").addEventListener("click", searchDriver);
document.getElementById('update').addEventListener('click', updateTable);
document.getElementById('export-but').addEventListener('click', exportToExcel);


createYearlist();

