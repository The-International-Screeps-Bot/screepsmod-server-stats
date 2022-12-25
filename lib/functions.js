function exponentialMovingAverage(newValue, prevEMA, weight = 100) {
    weight = 1 / weight;
    let ema = (newValue * weight) + (prevEMA * (1 - weight));
    
    ema = Math.round(ema * 100000) / 100000;
    
    return ema;
  }

module.exports = function loopThrough(previous, current, current2) {
    const typeofCurrent = typeof current
    if (Array.isArray(current)) {
        for (const element of current) {
            if (previous === undefined) previous = [];
            const objects = loopThrough(previous[element], current[element]);
            previous[element] = objects.previous;
            current[element] = objects.current;
        }
    } else if (typeofCurrent === 'object') {
        if (current === undefined || current === null) {
            console.log('current is undefined');
        }
        for (const key of Object.keys(current)) {
            if (Object.hasOwnProperty.call(current, key)) {
                if (previous === undefined) previous = {};
                const objects = loopThrough(previous[key], current[key], current);
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
