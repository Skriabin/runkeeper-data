const actions = [

    {
        name: 'Trigger Tooltip',
        handler: triggerTooltip
    }
];

function triggerTooltip(chart, index) {
    const tooltip = chart.tooltip;
    const chartArea = chart.chartArea;
    tooltip.setActiveElements([{
        datasetIndex: 0,
        index: index,
    }],
    {
        x: (chartArea.left + chartArea.right) / 2,
        y: (chartArea.top + chartArea.bottom) / 2,
    })

    chart.update();
}

function clearTooltip(chart) {
    const tooltip = chart.tooltip;
    tooltip.setActiveElements([], {x: 0, y: 0});
    return;
}

function updateChart(chart) {

}


function tdHighlight() {
    index = 0;
    document.querySelectorAll('td')
    .forEach(e => e.addEventListener('mouseover', function() {
        // highlight table row
        e.parentNode.style['background-color'] = 'rgb(255, 0, 0, 0.2)';

        // Trigger graph data tooltips on table row hover
        date = e.parentNode.childNodes[0].innerHTML;
        dataset = myChart.config.data.datasets[0].data;
        var index;
        for (const obj in dataset) {
            chartDate = dataset[obj]['Date'];
            if (chartDate == date) {
                index = obj;
                break;
            }
        }
        triggerTooltip(myChart, index)
    }));

    document.querySelectorAll('td')
    .forEach(e => e.addEventListener('mouseout', function() {
        e.parentNode.style['background-color'] = 'white'
        clearTooltip(myChart);
    }));
}


function minutesToSeconds(arr) {
    console.log(typeof(arr));
    if (typeof(arr) === 'object') {  
        for (x in arr) {
            // Convert minutes to seconds, prior to use by the graph
            let pace = (arr[x])["Average Pace"]
            let items = pace.split(":");
            // convert minutes to seconds
            let seconds = (parseInt(items[0]) * 60) + parseInt(items[1]);
            (arr[x])["Average Pace"] = seconds;
        }
    } else if (typeof(arr) === 'string') {
        // Convert minutes to seconds, prior to use by the graph
        let items = arr.split(":");
        // convert minutes to seconds
        let seconds = (parseInt(items[0]) * 60) + parseInt(items[1]);
        arr = seconds;
    }
    return arr
}

function secondstoMinutes(arr) {
    for (x in arr) {
        // convert seconds to minutes
        let pace = arr[x]["Average Pace"];
        let minutes = Math.floor(pace / 60);
        let seconds = pace % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        let output = minutes + ":" + seconds;
        (arr[x])["Average Pace"] = output;
        
    }
    return arr;
}

function render_table(data) {
    // check data is NOT in minutes, otherwise convert
    let data_sample = data[1]["Average Pace"];
    if (typeof(data_sample) === 'number') {
        data = secondstoMinutes(data);
    }
    
    let button = "<button id='sort'></button"
    let table = "<table><tr><th>Date</th><th>Pace</th><th>Distance" + button + "</th></tr>"
    for (x in data) {
        let date = (data[x])["Date"];
        let pace = (data[x])["Average Pace"];
        let dist = (data[x])["Distance (mi)"];
        table += "<tr><td>" + date + "</td><td>" + pace + "</td><td>" + dist + "</td></tr>";
    }

    table += "</table>"
    document.getElementById("table-container").innerHTML = table;
    document.getElementById("sort").addEventListener('click', function() { sort_list(data); });
    tdHighlight();
}

function sort_list(arr) {
    if (sort_state == 0 || sort_state == 1) {
        let n = arr.length;
        let dist = 'Distance (mi)'
        let i, key, j;

        for (i = 1; i < n; i++) {
            key = arr[i];
            key_dist = arr[i][dist];
            j = i - 1;

            while (j >= 0 && ((arr[j])[dist]) > key_dist) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
        sort_state = 2;
        render_table(arr);
        document.getElementById("sort").style["background-image"] = "url(/static/images/iconmonstr-sort-25.svg)";
        return;
    }
    if (sort_state == 2) {
        let n = arr.length;
        let dist = 'Distance (mi)'
        let i, key, j;

        for (i = 1; i < n; i++) {
            key = arr[i];
            key_dist = arr[i][dist];
            j = i - 1;

            while (j >= 0 && ((arr[j])[dist]) < key_dist) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
        sort_state = 1;
        render_table(arr);
        return;
    }
}

function render_graph(input) {

    let arr = minutesToSeconds(input);

    // setup block
    const data = {
        datasets: [{
            type: 'line',
            parsing: {
                yAxisKey: 'Average Pace',
                xAxisKey: 'Date',
            },
            label: '# of Votes',
            radius: 3,
            data: arr,
            backgroundColor: 'red',
            borderColor: 'red',
            borderWidth: 1,
            label: "Pace",
        }]
    }

    // config block
    const config = {
        data,
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    }
                },
                y: {
                    suggestedMin: 360,
                    suggestedMax: 900,
                    ticks: {
                        stepSize: 30,
                        padding: 2,
                        callback: function(value, index, ticks) {
                            minutes = Math.floor(value / 60);
                            seconds = value % 60;
                            if (seconds == 0) {
                                seconds = "00";
                            }
                            x = minutes + ':' + seconds;

                            return x;
                        }
                    },                   
                }
            },
        }
    };

    // render / init block
    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
    
    return myChart;
}