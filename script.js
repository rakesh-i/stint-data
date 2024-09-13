const apiBaseURL = 'https://api.openf1.org/v1';
let driverMap = new Map();

function selectYear(event) {
    const listYears = document.querySelectorAll('.year-container li');
    listYears.forEach(item => item.classList.remove('choose'));
    
    event.target.classList.add('choose');
    // console.log(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchMeetings(event.target.textContent);
}

function selectRace(event){
    const listRaces = document.querySelectorAll('.race-container li');
    listRaces.forEach(item => item.classList.remove('choose'));
    event.target.classList.add('choose');
    // console.log(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    fetchSessions(event.target.textContent);
}

function selectSession(event){
    const listSession = document.querySelectorAll('.session-container li');
    listSession.forEach(item => item.classList.remove('choose'));
    event.target.classList.add('choose');
    // console.log(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showDriverSearch(event.target.value);
}

function selectDriver(event){
    const listDriver = document.querySelectorAll('#driver-list li');
    event.target.classList.toggle('choose');
    searchDriver(event.target.value, event.target.textContent);
}

function createDriverList(data){
    const driverList = document.querySelector('#driver-list');
    driverList.innerHTML = '';
    data.forEach(x=>{
        const driver = document.createElement('li');
        driver.value = x.driver_number;
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
    let meetings = await fetch(`${apiBaseURL}/meetings?year=${year}`);
    let data = await meetings.json();
    // console.log(data); 
    createRacelist(data);
}

async function fetchSessions(country) {;
    const year = document.querySelector('.year-container li.choose').textContent;
    // console.log(year, country);

    if (!country) {
        alert('Please select a country.');
        return;
    }
    let session = await fetch(`${apiBaseURL}/sessions?country_name=${country}&year=${year}`);
    let data = await session.json();
    // console.log(data);

    createSessionList(data);
}

async function showDriverSearch(sessionKey) {
    let drivers = await fetch(`${apiBaseURL}/drivers?session_key=${sessionKey}`);
    let data = await drivers.json();
    // console.log(data);
    if (!sessionKey) {
        alert('Please select a session.');
        return;
    }
    createDriverList(data);
}

async function gatherdata(driver_number, name){
    try {
        const stint = [];
        const stinttyre = [];
        const sessionKey = document.querySelector('#session-list li.choose').value;
        let response = await fetch(`${apiBaseURL}/laps?session_key=${sessionKey}&driver_number=${driver_number}`);
        const data1 = await response.json();
        response = await fetch(`${apiBaseURL}/stints?session_key=${sessionKey}&driver_number=${driver_number}`);
        const data2 = await response.json();

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
            tyres: [...stinttyre]
        });
    } catch (error) {
        console.log(error);
    }
}

function displayTable(stintmap) {
    let a = [];
    let b = [];
    let d = [];
    let stintnum = new Map();
    let c = 0;
    for(let [driver, data] of stintmap){
        d.push([driver, data.laptimes.length]);
        if(c>0){
            c += data.laptimes.length;
        }
        else{
            c += data.laptimes.length-1;
        }
        
        stintnum.set(c, 1);
        for(let i=0; i<data['laptimes'].length; i++){
            a.push(data.laptimes[i]);
            b.push(data.tyres[i]);
            
        }
    }
    console.log(stintnum);
    const container = document.getElementById('table-container');
    let table = '<table border="1">';
    
    // Drivers name
    table += '<tr>';
    table += '<th class="border-bottom border-right border-left">Driver</th>';
    for (let i = 0; i < d.length; i++) {
        table+= `<th class="border-bottom border-right border-left" colspan="${d[i][1]}">${d[i][0]}</th>`
    }
    table += '</tr>';

    // Tyres name
    table += '<tr>';
    table += '<th class="border-bottom border-right border-left">Tyre</th>';
    for (let i = 0; i < a.length; i++) {
        if(i==0){
            table += `<th class="${b[i]} border-left border-bottom">${b[i]}</th>`;
        }
        else if(stintnum.has(i)){
            table += `<th class="${b[i]} border-right border-bottom">${b[i]}</th>`;
        }
        else{
            table += `<th class="${b[i]} border-bottom">${b[i]}</th>`;
        }
        
    }
    table += '</tr>';


    let maxLaps = Math.max(...a.map(s => s.length));
    for (let j = 0; j < maxLaps; j++) {

        table += '<tr>';
        if (j === 0) {
            table += '<th rowspan="' + maxLaps + '">Laps</th>';
        }
        for (let i = 0; i < a.length; i++) {
            if(i==0){
                table += `<td class="lap selected border-left" data-stint="${i}" data-lap="${j}">${a[i][j] || ''}</td>`;
            }
            else if(stintnum.has(i)){
                table += `<td class="lap selected border-right" data-stint="${i}" data-lap="${j}">${a[i][j] || ''}</td>`;
                
            }
            else if(i==a.length-1){
                table += `<td class="lap selected border-right" data-stint="${i}" data-lap="${j}">${a[i][j] || ''}</td>`;
            }
            else{
                table += `<td class="lap selected" data-stint="${i}" data-lap="${j}">${a[i][j] || ''}</td>`;
            }
        }
        table += '</tr>';
    }

    // Averages 
    table += '<tr>';
    table += '<th class="border-top">Average</th>';
    for (let i = 0; i < a.length; i++) {
        if(i==0){
            table += `<td id="avg-${i}" class="border-left border-top">0.000</td>`;
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
            updateAverages(a, b);
        });
    });

    updateAverages(a, b);
}

function updateAverages(a, b) {
    for (let i = 0; i < a.length; i++) {
        let sum = 0;
        let count = 0;
        document.querySelectorAll(`.lap[data-stint="${i}"]`).forEach(cell => {
            if (cell.classList.contains('selected')) {
                const lapTime = parseFloat(cell.textContent);
                if (!isNaN(lapTime)) {
                    sum += lapTime;
                    count++;
                }
            }
        });
        const average = count === 0 ? 0 : (sum / count).toFixed(3);
        document.getElementById(`avg-${i}`).textContent = average;
    }
}

function exportToExcel() {
    const table = document.querySelector('table');
    const wb = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
    XLSX.writeFile(wb, 'stint_data.xlsx');
}

async function searchDriver(driver, name){
  const container = document.getElementById('table-container');
  container.innerHTML = '';
  driverMap.clear();
  const selectedDriver = document.querySelectorAll('#driver-list .choose');
  const promises = [];
  selectedDriver.forEach(element=>{
    const promise = gatherdata(element.value, element.textContent);
    promises.push(promise);
  });
  await Promise.all(promises);
//   console.log(driverMap);
  generateStintSelection();
}

function generateStintSelection() {
    const formContainer = document.getElementById('driver-stints-form');
    formContainer.innerHTML = '';

    for (let [driver, data] of driverMap) {
        const driverDiv = document.createElement('div');
        driverDiv.className = 'driver-div'

        const driverLabel = document.createElement('label');
        driverLabel.textContent = `${driver}`;
        driverLabel.className = 'drivername'
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
            const tyreType = data.tyres[i];
            label.textContent = ` ${tyreType} (${stintLapCount} laps)`;
            
            holder.appendChild(checkbox);
            holder.appendChild(label);
            driverDiv.appendChild(holder);
        }
        
        formContainer.appendChild(driverDiv);
    }
}

function updateTable(){
    let stintmap = new Map();
    for (let [driver, data] of driverMap) {
        let laps = [];
        let tyres = [];
        for (let i = 0; i < data.laptimes.length; i++) {
            const checkbox = document.getElementById(`stint-${driver}-${i}`);
            if (checkbox && checkbox.checked) {
                // console.log(data.tyres[i]);
                laps.push(data.laptimes[i]);
                tyres.push(data.tyres[i]);
            }
        }
        if(laps.length!=0){
            stintmap.set(driver, {
                laptimes:[...laps],
                tyres: [...tyres]
            });
        }
        else{
            stintmap.delete(driver);
        }
        
    }
    // console.log(stintmap);
    displayTable(stintmap);
}

document.getElementById('screenshot-btn').addEventListener('click', function() {
    let tableContainer = document.getElementById('table-container');
    
    // Use html2canvas to capture the table
    html2canvas(tableContainer).then(function(canvas) {
        // Convert the canvas to an image and download it
        let link = document.createElement('a');
        link.href = canvas.toDataURL();  // Get the image URL from the canvas
        link.download = 'screenshot.png';  // Set the file name
        link.click();  // Trigger download
    });
});


createYearlist();

