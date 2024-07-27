let stint = [];
let stinttyre = [];

async function gatherdata(){
    try {
        let driver_number = document.getElementById('driverno').value;
        let response = await fetch(`https://api.openf1.org/v1/laps?session_key=latest&driver_number=${driver_number}`);
        const data1 = await response.json();
        response = await fetch(`https://api.openf1.org/v1/stints?session_key=latest&driver_number=${driver_number}`);
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
                if (j >= data1.length) {
                    continue;
                } else {
                    stint[i].push(data1[j - 1].lap_duration);
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

document.getElementById('find').addEventListener('click', function(){
  const container = document.getElementById('table-container');
  container.innerHTML = '';
  stint = [];
  stinttyre = [];
  gatherdata();
});

