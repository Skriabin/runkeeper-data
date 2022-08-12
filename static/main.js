


function minutesToSeconds(arr) {
    for (x in arr) {
        // Convert minutes to seconds, prior to use by the graph
        let pace = (arr[x])["Average Pace"]
        let items = pace.split(":");
        // convert minutes to seconds
        let seconds = (parseInt(items[0]) * 60) + parseInt(items[1]);
        (arr[x])["Average Pace"] = seconds;
    }
    return arr
}

