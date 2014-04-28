exports.sortQuestionSubpopulationResponseCandidate = function(a, b) {
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
exports.sortQuestionSubpopulationResponseParty = function(a, b) {
    var aCandidate = a.filter(function(element) {
        return element.choice.toLowerCase() === "republican" || element.choice.toLowerCase() === "democrat";
    });

    var bCandidate = b.filter(function(element) {
        return element.choice.toLowerCase() === "republican" || element.choice.toLowerCase() === "democrat";
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
        "approval",
        "favorability",
        "identification",
        "satisfaction",
        "direction",
        "favor/oppose",
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
        "Attorney General",
        "Lieutenant Governor",
        "Mayor",
        "Comptroller"
    ];

    var aValue = order.indexOf(a) === -1 ? order.length : order.indexOf(a);
    var bValue = order.indexOf(b) === -1 ? order.length : order.indexOf(b);

    return aValue - bValue;
};

exports.sort = function(a, b) {
    aYear = a.question.type.subject && a.question.type.subject.year ? a.question.type.subject.year : undefined;
    bYear = b.question.type.subject && b.question.type.subject.year ? b.question.type.subject.year : undefined;

    if (exports.sortQuestionYear(aYear, bYear) === 0) {
        if (exports.sortQuestionType(a.question.type.name, b.question.type.name) === 0) {
            if (a.question.type.name === "election") {
                if (exports.sortQuestionOffice(a.question.type.subject.office, b.question.type.subject.office) === 0) {
                    return exports.sortQuestionSubpopulationResponseCandidate(a.question.subpopulation.responses, b.question.subpopulation.responses);
                } else {
                    return exports.sortQuestionOffice(a.question.type.subject.office, b.question.type.subject.office);
                }
            } else if (a.question.type.name === "generic") {
                return exports.sortQuestionSubpopulationResponseParty(a.question.subpopulation.responses, b.question.subpopulation.responses);
            } else if (a.question.type.name === "favorability" || a.question.type.name === "approval") {
                if (a.question.type.subject.type === b.question.type.subject.type) {
                    if (a.question.type.subject.type === "person") {
                        if (a.question.type.subject.last_name.localeCompare(b.question.type.subject.last_name) === 0) {
                            if (a.question.type.subject.first_name.localeCompare(b.question.type.subject.first_name) === 0) {
                                if (a.question.stateName === "US" && b.question.stateName === "US") {
                                    return (new Date(a.end_date)).getTime() - (new Date(b.end_date)).getTime();
                                } else if (a.question.stateName === "US") {
                                    return 1;
                                } else if (b.question.stateName === "US") {
                                    return -1;
                                } else {
                                    return a.question.stateName.localeCompare(b.question.stateName);
                                }
                            } else {
                                return a.question.type.subject.first_name.localeCompare(b.question.type.subject.first_name);
                            }
                        } else {
                            return a.question.type.subject.last_name.localeCompare(b.question.type.subject.last_name);
                        }
                    } else {
                        if (a.question.type.subject.name.localeCompare(b.question.type.subject.name) === 0) {
                            return (new Date(a.end_date)).getTime() - (new Date(b.end_date)).getTime();
                        } else {
                            return a.question.type.subject.name.localeCompare(b.question.type.subject.name)
                        }
                    }
                } else {
                    return a.question.type.subject.type.localeCompare(b.question.type.subject.type);
                }
            }
        } else {
            return exports.sortQuestionType(a.question.type.name, b.question.type.name);
        }
    } else {
        return exports.sortQuestionYear(aYear, bYear);
    }
};