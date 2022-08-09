


function minutesToSeconds(time) {
    items = time.split(":");
    // convert minutes to seconds
    seconds = (parseInt(items[0]) * 60) + parseInt(items[1]);
    return seconds
}

