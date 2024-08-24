let stint = [];
let stinttyre = [];
const apiBaseURL = 'https://api.openf1.org/v1';

function selectYear(event) {
    // Remove 'choose' class from all items
    const listYears = document.querySelectorAll('.year-container li');
    listYears.forEach(item => item.classList.remove('choose'));
    
    // Add 'choose' class to the clicked item
    event.target.classList.add('choose');
    console.log(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchMeetings(event.target.textContent);
}

function selectRace(event){
    const listRaces = document.querySelectorAll('.race-container li');
    listRaces.forEach(item => item.classList.remove('choose'));
    event.target.classList.add('choose');
    console.log(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    fetchSessions(event.target.textContent);
}

function selectSession(event){
    const listSession = document.querySelectorAll('.session-container li');
    listSession.forEach(item => item.classList.remove('choose'));
    event.target.classList.add('choose');
    console.log(event.target.textContent);
    event.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showDriverSearch(event.target.value);
}

function createSession(data){
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
    // Get all list items
    const listYears = document.querySelectorAll('.year-container li');

    // Add event listener to each list item
    listYears.forEach(item => {
        item.addEventListener('click', selectYear);
    });

    // Select the first item by default
    listYears[0].classList.add('choose');
    listYears[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchMeetings(listYears[0].textContent);
}

createYearlist();


async function fetchMeetings(year){
    // let year = document.getElementById('year').value;
    let meetings = await fetch(`${apiBaseURL}/meetings?year=${year}`);
    let data = await meetings.json();
    console.log(data); 
    createRacelist(data);
    // const countrySelect = document.getElementById('country');
    // countrySelect.innerHTML = '<option value="">Select Country</option>';
    // data.forEach(x=>{
    //     const option = document.createElement('option');
    //     option.value = x.country_name;
    //     option.textContent = x.country_name;
    //     countrySelect.appendChild(option);
    // });
    // document.getElementById('country-container').style.display = 'block';
}

async function fetchSessions(country) {;
    const year = document.querySelector('.year-container li.choose').textContent;

    console.log(year, country);
    if (!country) {
        alert('Please select a country.');
        return;
    }
    let session = await fetch(`${apiBaseURL}/sessions?country_name=${country}&year=${year}`);
    let data = await session.json();
    console.log(data);
    // const sessionSelect = document.getElementById('session');
    // sessionSelect.innerHTML = '<option value="">Select Session</option>';
    // data.forEach(x=>{
    //     const option = document.createElement('option');
    //     option.value = x.session_key;
    //     option.textContent = x.session_name;
    //     sessionSelect.appendChild(option);
    // });
    createSession(data);
    // document.getElementById('session-container').style.display = 'block';
}

async function showDriverSearch(sessionKey) {
    // const sessionKey = document.getElementById('session').value;
    let drivers = await fetch(`${apiBaseURL}/drivers?session_key=${sessionKey}`);
    let data = await drivers.json();
    console.log(data);
    if (!sessionKey) {
        alert('Please select a session.');
        return;
    }
    const driverSelect = document.getElementById('driver');
    driverSelect.innerHTML = '<option value="">Select Driver</option>';
    data.forEach(x=>{
        const option = document.createElement('option');
        option.value = x.driver_number;
        option.textContent = x.broadcast_name;
        driverSelect.appendChild(option);
    });
    document.getElementById('driver-container').style.display = 'block';
}

async function gatherdata(){
    try {
        let sessionKey = document.getElementById('session').value;
        let driver_number = document.getElementById('driver').value;

        let response = await fetch(`${apiBaseURL}/laps?session_key=${sessionKey}&driver_number=${driver_number}`);
        const data1 = await response.json();
        response = await fetch(`${apiBaseURL}/stints?session_key=${sessionKey}&driver_number=${driver_number}`);
        const data2 = await response.json();
        console.log(data1,data2);

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
        console.log(stint);
        displayTable();
    } catch (error) {
        console.log(error);
    }
}

function displayTable() {
    const container = document.getElementById('table-container');
    let table = '<table border="1">';
    
    table += '<tr>';
    table += '<th>Stint Number</th>';
    for (let i = 0; i < stint.length; i++) {
        table += `<th>${i + 1}</th>`;
    }
    table += '</tr>';

    table += '<tr>';
    table += '<th>Tyre Compound</th>';
    for (let i = 0; i < stint.length; i++) {
        table += `<th>${stinttyre[i]}</th>`;
    }
    table += '</tr>';

    let maxLaps = Math.max(...stint.map(s => s.length));
    for (let j = 0; j < maxLaps; j++) {
        table += '<tr>';
        if (j === 0) {
            table += '<th rowspan="' + maxLaps + '">Lap Data</th>';
        }
        for (let i = 0; i < stint.length; i++) {
            table += `<td class="lap selected" data-stint="${i}" data-lap="${j}">${stint[i][j] || ''}</td>`;
        }
        table += '</tr>';
    }

    table += '<tr>';
    table += '<th>Average</th>';
    for (let i = 0; i < stint.length; i++) {
        table += `<td id="avg-${i}">0.000</td>`;
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
            updateAverages();
        });
    });

    updateAverages();
}

function updateAverages() {
    for (let i = 0; i < stint.length; i++) {
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

function searchDriver(){
  const container = document.getElementById('table-container');
  container.innerHTML = '';
  stint = [];
  stinttyre = [];
  gatherdata();
}

// document.getElementById('find').addEventListener('click', function(){
//     fetchMeetings();    
// });

