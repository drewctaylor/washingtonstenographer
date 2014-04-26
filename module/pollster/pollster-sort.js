exports.sortQuestionSubpopulationResponse = function(a, b) {
    var aCandidate = a.filter(function(element) {
        return element.last_name || element.first_name;
    });

    var bCandidate = b.filter(function(element) {
        return element.last_name || element.first_name;
    });

    var aMean = aCandidate.reduce(function(previousValue, currentValue) {
        return previousValue = previousValue + currentValue.value / aCandidate.length;
    }, 0);

    var bMean = bCandidate.reduce(function(previousValue, currentValue) {
        return previousValue = previousValue + currentValue.value / bCandidate.length;
    }, 0);

    var aVariance = aCandidate.reduce(function(previousValue, currentValue) {
        return previousValue = previousValue + ((currentValue.value - aMean) * (currentValue.value - aMean)) / aCandidate.length;
    }, 0);

    var bVariance = bCandidate.reduce(function(previousValue, currentValue) {
        return previousValue = previousValue + ((currentValue.value - bMean) * (currentValue.value - bMean)) / bCandidate.length;
    }, 0);

    return aVariance - bVariance;
};

exports.sortQuestionYear = function(a, b) {
    if (a === b) {
        return 0;
    } else {
        if (a === undefined) {
            return 1;
        } else if (b === undefined) {
            return -1;
        } else {
            return a - b;
        }
    }
};

exports.sortQuestionType = function(a, b) {
    var order = [
        "election",
        "congressional generic ballot",
        "favor/oppose",
        "approval",
        "favorability",
        "identification",
        "satisfaction",
        "direction"
    ];

    var aValue = order.indexOf(a) === -1 ? order.length : order.indexOf(a);
    var bValue = order.indexOf(b) === -1 ? order.length : order.indexOf(b);

    return aValue - bValue;
};

exports.sortQuestionOffice = function(a, b) {
    var order = [
        "President",
        "Senate",
        "Governor",
        "House",
        "Congressional Generic Ballot",
        "Attorney General",
        "Lieutenant Governor",
        "Mayor",
        "Comptroller"
    ];

    var aValue = order.indexOf(a) === -1 ? order.length : order.indexOf(a);
    var bValue = order.indexOf(b) === -1 ? order.length : order.indexOf(b);

    return aValue - bValue;
};
