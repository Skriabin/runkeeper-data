"use strict";


function fileSummary(data) {
    const fileInfo = [];
    var dataEntries, fastestPace, longestDist;
    // Check object is JSON parsable
    if (typeof(data) == 'string') {
        data = JSON.parse(data);
    } 

    // Obtain Number of data entries
    dataEntries = data.length;
    fileInfo.push(dataEntries)
    
    // Obtain fastest pace
    // Obtain greatest distance
    fastestPace = 10000;
    longestDist = 0;
    for (let row in data) {
        // Obtain Pace
        let tempPace = data[row]['Average Pace'];
        tempPace = minutesToSeconds(tempPace);
        if (tempPace < fastestPace) {
            fastestPace = tempPace;   
        }

        // Obtain Dist
        let tempDist = data[row]['Distance (mi)'];
        let tempDistNum = ''
        for (let i in tempDist) {
            if (tempDist[i] != '.') {
                tempDistNum += tempDist[i];
            }
        }
        tempDist = parseInt(tempDistNum) / 100;
        if (tempDist > longestDist) {
            longestDist = tempDist;
        }
    }

    
    // Format output
    fastestPace = secondsToMinutes(fastestPace) + ' mph';
    longestDist = longestDist + ' miles';

    fileInfo.push(fastestPace);
    fileInfo.push(longestDist);

    return fileInfo;
}

function triggerTooltip(chart, index) {
    const tooltip = chart.tooltip;
    const chartArea = chart.chartArea;
    console.log("INDEX: ", index);
    tooltip.setActiveElements([{
        datasetIndex: 0,
        index: index,
    }],
    {
        x: (chartArea.left + chartArea.right) / 2,
        y: (chartArea.top + chartArea.bottom) / 2,
    })
    
    chart.update();
    xAxisCount(chart);
    return
}

function xAxisCount(chart) {
    let dataSet, itemSet, chartDate, temp
    dataSet = chart.config.data.datasets[0].data;
    itemSet = new Set();
        for (const obj in dataSet) {
            chartDate = dataSet[obj]['Date'];
            temp = ''
            for (let char in chartDate) {
                console.log(char);
                if (char == '-') {
                    break;
                } else {
                    temp += char;
                }
            }
            chartDate = temp;
            
            if (chartDate != 'number') {
                parseInt(chartDate);
            }
            chartDate = chartDate - 2000;
        }
}

function scrollToTooltip() {
    let xAxis, chartWidth
    chartWidth = document.getElementById('chart-container-inner').clientWidth;
    console.log(chartWidth);
    return
}

function clearTooltip(chart) {
    const tooltip = chart.tooltip;
    tooltip.setActiveElements([], {x: 0, y: 0});
    return;
}



function tdHighlight() {
    let index = 0;
    let container = document.querySelector('#table-container')
    container.querySelectorAll('td')
    .forEach(e => e.addEventListener('mouseover', function() {
        let date, dataset, chartDate;
        // highlight table row
        e.parentNode.style['background-color'] = 'rgb(255, 230, 230)';

        // Trigger graph data tooltips on table row hover
        date = e.parentNode.childNodes[0].innerHTML;
        dataset = myChart.config.data.datasets[0].data;
        for (const obj in dataset) {
            chartDate = dataset[obj]['Date'];
            if (chartDate == date) {
                index = obj;
                break;
            }
        }
        triggerTooltip(myChart, index)
    }));

    container.querySelectorAll('td')
    .forEach(e => e.addEventListener('mouseout', function() {
        e.parentNode.style['background-color'] = 'white'
        clearTooltip(myChart);
    }));
}


function minutesToSeconds(arr) {
    let x, pace, items, seconds
    if (typeof(arr) === 'object') {  
        for (x in arr) {
            // Convert minutes to seconds, prior to use by the graph
            pace = (arr[x])["Average Pace"]
            items = pace.split(":");
            // convert minutes to seconds
            seconds = (parseInt(items[0]) * 60) + parseInt(items[1]);
            (arr[x])["Average Pace"] = seconds;
        }
    } else if (typeof(arr) === 'string') {
        // Convert minutes to seconds, prior to use by the graph
        items = arr.split(":");
        // convert minutes to seconds
        seconds = (parseInt(items[0]) * 60) + parseInt(items[1]);
        arr = seconds;
    }
    return arr
}

function secondsToMinutes(arr) {
    let x, pace, minutes, seconds;
    if (typeof(arr) === 'object') {
        for (x in arr) {
            // convert seconds to minutes for each row
            pace = arr[x]["Average Pace"];
            minutes = Math.floor(pace / 60);
            seconds = pace % 60;
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            let output = minutes + ":" + seconds;
            (arr[x])["Average Pace"] = output;
        }
    } else if (typeof(arr) === 'number') {
        // convert single number from seconds to minutes + seconds in MM:SS format
        pace = arr;
        minutes = Math.floor(pace / 60);
        seconds = pace % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        let output = minutes + ":" + seconds;
        arr = output;
    }
    return arr;
}

function render_table(data) {
    let bttnSortDist = "<button id='sort-dist'></button";
    let bttnSortPace = "<button id='sort-pace'></button";
    let table = "<table><tr id='th-row'><th>Date" + "</th><th>Pace" + bttnSortPace + "</th><th>Distance" + bttnSortDist + "</th></tr>"
    for (let x in data) {
        let date = data[x]["Date"];
        let pace = data[x]["Average Pace"];
        let dist = data[x]["Distance (mi)"];
        table += "<tr><td>" + date + "</td><td>" + pace + "</td><td>" + dist + "</td></tr>";
    }

    table += "</table>"
    document.getElementById("table-container").innerHTML = table;
    document.getElementById("sort-dist").addEventListener('click', function() { sort_dist(data); });
    document.getElementById("sort-pace").addEventListener('click', function() { sort_pace(data); });
    $('#table-container').css('border', '1px solid black');
    tdHighlight();
}

function sort_pace(arr) {
    let n = arr.length;
    let i, j, row, value;

    // Convert 'Average Pace' to seconds
    if (typeof(arr[1]['Average Pace']) === 'string') {
        arr = minutesToSeconds(arr)
    };

    console.log(arr[1]['Average Pace']);

    if (sortPaceState == 0 || sortPaceState == 1) {
        console.log("SORTING");
        for (i = 1; i < n; i++) {
            row = arr[i];
            value = arr[i]['Average Pace'];
            j = i - 1;
            while (j >= 0 && ((arr[j])['Average Pace']) > value) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = row;
        }
        sortPaceState = 2;
        arr = secondsToMinutes(arr);
        render_table(arr);
        document.getElementById("sort-pace").style["background-image"] = "url(/static/images/iconmonstr-sort-25.svg)";
        return;
    } 
    if (sortPaceState == 2) {
        console.log("SORTPACESTATE 2");
        for (i = 1; i < n; i++) {
            row = arr[i];
            value = arr[i]['Average Pace'];
            j = i - 1;
            while (j >= 0 && ((arr[j])['Average Pace']) < value) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = row;
        }
        sortPaceState = 1;
        arr = secondsToMinutes(arr);
        render_table(arr);
        return;   
    }
};

function sort_dist(arr) {
    let n = arr.length;
    let dist = 'Distance (mi)'
    let i, key, j, key_dist;

    if (sortDistState == 0 || sortDistState == 1) {
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
        sortDistState = 2;
        render_table(arr);
        document.getElementById("sort-dist").style["background-image"] = "url(/static/images/iconmonstr-sort-25.svg)";
        return;
    }
    if (sortDistState == 2) {
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
        sortDistState = 1;
        render_table(arr);
        return;
    }
}

function render_graph(input) {
    let arr = minutesToSeconds(input);
    const plugin = {
        id: 'background',
        beforeDraw: (chart) => {
            const {ctx, chartArea} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
            ctx.restore();
        }
    }
    
    Chart.register(plugin);

    // setup block
    const data = {
        datasets: [{
            type: 'line',
            parsing: {
                yAxisKey: 'Average Pace',
                xAxisKey: 'Date',
            },
            label: '# of Votes',
            backgroundColor: 'red',
            radius: 3,
            data: arr,
            borderColor: 'red',
            borderWidth: 1,
            label: "Pace",
        }]
    }

    // config block
    const config = {
        data,
        options: {
            plugins: [plugin],
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
                            let minutes, seconds, x;
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
    myChart = new Chart(
        document.getElementById('myChart'),
        config
    );

    
    
    return myChart;
}

