let stint = [];
let stinttyre = [];
const apiBaseURL = 'https://api.openf1.org/v1';

async function fetchMeetings(){
    let year = document.getElementById('year').value;
    let meetings = await fetch(`${apiBaseURL}/meetings?year=${year}`);
    let data = await meetings.json();
    console.log(data); 
    const countrySelect = document.getElementById('country');
    countrySelect.innerHTML = '<option value="">Select Country</option>';
    data.forEach(x=>{
        const option = document.createElement('option');
        option.value = x.country_name;
        option.textContent = x.country_name;
        countrySelect.appendChild(option);
    });
    document.getElementById('country-container').style.display = 'block';
}

async function fetchSessions() {
    const country = document.getElementById('country').value;
    let year = document.getElementById('year').value;
    if (!country) {
        alert('Please select a country.');
        return;
    }
    let session = await fetch(`${apiBaseURL}/sessions?country_name=${country}&year=${year}`);
    let data = await session.json();
    console.log(data);
    const sessionSelect = document.getElementById('session');
    sessionSelect.innerHTML = '<option value="">Select Session</option>';
    data.forEach(x=>{
        const option = document.createElement('option');
        option.value = x.session_key;
        option.textContent = x.session_name;
        sessionSelect.appendChild(option);
    });
    document.getElementById('session-container').style.display = 'block';
}

async function showDriverSearch() {
    const sessionKey = document.getElementById('session').value;
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

document.getElementById('find').addEventListener('click', function(){
    fetchMeetings();    
});

