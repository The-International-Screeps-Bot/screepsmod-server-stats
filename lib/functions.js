function round(value, decimals = 5) {
    const multiplier = Math.pow(10, decimals)
    return Math.round(value * multiplier) / multiplier
}

function exponentialMovingAverage(value, previousValue, weight = 1000) {
    if (previousValue === undefined) return value;
    return round((value * weight) + (previousValue * (1 - weight)));
  }

module.exports = function loopThrough(previous, current) {
    const typeofCurrent = typeof current
    if (Array.isArray(current)) {
        for (const element of current) {
            if (previous === undefined) previous = [];
            const objects = loopThrough(previous[element], current[element]);
            previous[element] = objects.previous;
            current[element] = objects.current;
        }
    } else if (typeofCurrent === 'object') {
        for (const key of Object.keys(current)) {
            if (Object.hasOwnProperty.call(current, key)) {
                if (previous === undefined) previous = {};
                const objects = loopThrough(previous[key], current[key]);
                previous[key] = objects.previous;
                current[key] = objects.current;
            }
        }
    }
    else if (typeofCurrent === 'number') {
        current = exponentialMovingAverage(current, previous);
    }
    return { previous, current }
}
