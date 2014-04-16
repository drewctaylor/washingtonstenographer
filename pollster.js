// require
var underscore = require("underscore");
var http = require("http");

// constant
var HOSTNAME = "elections.huffingtonpost.com";
var PORT = 80;
var PATH_POLL = "/pollster/api/polls.json?page=";
var PATH_CHART = "/pollster/api/charts/";
var STATE_CODE_MAP =
        {"AL": "Alabama",
            "AK": "Alaska",
            "AS": "American Samoa",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "DC": "DC",
            "FL": "Florida",
            "GA": "Georgia",
            "GU": "Guam",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MD": "Maryland",
            "MH": "Marshall Islands",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "FM": "Micronesia",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "MP": "Northern Marianas",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PW": "Palau",
            "PA": "Pennsylvania",
            "PR": "Puerto Rico",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VA": "Virginia",
            "VI": "Virgin Islands",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming",
            "US": "U.S."};

var PARTY_CODE_MAP = {
    "Dem": "Democrat",
    "Rep": "Republican",
    "Ind": "independent",
    "Gre": "Green",
    "Con": "Conservative",
    "Lib": "Libertarian"
};

var SUBPOPULATION_CODE_MAP = {
    "Adults - Democrat": "Democrats",
    "Adults - Republican": "Republicans",
    "Adults - independent": "independents",
    "Adults": "adults",
    "Likely Voters - Democrat": "Democratic likely voters",
    "Likely Voters - Republican": "Republican likely voters",
    "Likely Voters - independent": "independent likely voters",
    "Likely Voters": "likely voters",
    "Registered Voters - Democrat": "registered Democratic voters",
    "Registered Voters - Republican": "reigstered Republican voters",
    "Registered Voters - independent": "registered independent voters",
    "Registered Voters": "registered voters"
};


exports.poll = function(parameterMap, callback, page) {
    page = page === undefined ? 1 : page;

    var options = {
        hostname: HOSTNAME,
        port: PORT,
        path: PATH_POLL + page + underscore.pairs(parameterMap).reduce(function(previousValue, currentValue) {
            return previousValue + "&" + currentValue[0] + "=" + currentValue[1];
        }, "")
    };

    console.log(options.path);

    http.get(options, function(response) {
        var responseDataArray = [];

        response.on("data", function(responseData) {
            responseDataArray.push(responseData);
        });

        response.on("end", function() {
            var responseJsonCurrent = JSON.parse(Buffer.concat(responseDataArray));

            if (responseJsonCurrent.length === 0) {
                callback(responseJsonCurrent);
            } else {
                exports.poll(parameterMap, function(responseJson) {
                    callback(responseJson.concat(responseJsonCurrent));
                }, page + 1);
            }
        });
    });
};

exports.estimate = function(slugArray, callback) {
    if (slugArray.length === 0) {
        callback([]);
    } else {
        var slug = slugArray.pop();

        var options = {
            hostname: HOSTNAME,
            port: PORT,
            path: PATH_CHART + slug
        };

        console.log(options.path);

        http.get(options, function(response) {
            var responseDataArray = [];

            response.on("data", function(responseData) {
                responseDataArray.push(responseData);
            });

            response.on("end", function() {
                var responseJsonCurrent = JSON.parse(Buffer.concat(responseDataArray));

                exports.estimate(slugArray, function(responseJson) {
                    callback(responseJson.concat(responseJsonCurrent));
                });
            });
        });
    }
};

exports.clean = function(poll) {
    poll.questions.forEach(function(question) {
        if (underscore.keys(STATE_CODE_MAP).indexOf(question.state) === -1) {
            underscore.pairs(STATE_CODE_MAP).forEach(function(pair) {
                if (question.name.indexOf(pair[1]) !== -1) {
                    question.state = pair[0];
                }
            });

            if (underscore.keys(STATE_CODE_MAP).indexOf(question.state) === -1) {

                if (question.name.match(/national/gi) !== null) {
                    question.state = "US";
                } else {
                    underscore.pairs(STATE_CODE_MAP).forEach(function(pair) {
                        if (question.name.indexOf(pair[0]) !== -1) {
                            question.state = pair[0];
                        }
                    });

                    if (underscore.keys(STATE_CODE_MAP).indexOf(question.state) === -1) {
                        console.log("No state for question: '", question.name, "'.");
                    }
                }
            }
        }

        question.stateName = STATE_CODE_MAP[question.state];

        if (question.name.match(/approval/gi) !== null) {
            question.type = "approval";

            if (question.name.match(/economy/gi) !== null) {
                question.subject = "economy";

            } else if (question.name.match(/health/gi) !== null) {
                question.subject = "health care";

            } else if (question.name.match(/foreign policy/gi) !== null) {
                question.subject = "foreign policy";

            }

            if (question.name.match(/congress/gi) !== null) {
                question.subject = "congress";

            } else if (question.name.match(/([^,\\.]*)[,\\.]([^-]*)-[^-]*-.*Job Approval/gi) !== null) {
                question.last_name = /([^,\\.]*)[,\\.]([^-]*)-[^-]*-.*Job Approval/gi.exec(question.name)[1].trim();
                question.first_name = /([^,\\.]*)[,\\.]([^-]*)-[^-]*-.*Job Approval/gi.exec(question.name)[2].trim();

            } else if (question.name.match(/[^:]*: *Obama Job Approval/gi) !== null || question.name.match(/Obama Job Approval.*/gi)) {
                question.first_name = "Barack";
                question.last_name = "Obama";

            } else {
                console.log("No name for approval: '", question.name, "'.");
            }

        } else if (question.name.match(/favorable/gi) !== null) {
            question.type = "favorability";

            if (question.name.match(/([^,]*),([^-]*)-[^-]*-.*Favorable Rating/gi) !== null) {
                question.last_name = /([^,]*),([^-]*)-[^-]*-.*Favorable Rating/gi.exec(question.name)[1].trim();
                question.first_name = /([^,]*),([^-]*)-[^-]*-.*Favorable Rating/gi.exec(question.name)[2].trim();

                ;
            } else if (question.name.match(/(.*) ([^ ]*) Favorable Rating/gi) !== null) {
                question.last_name = /(.*) ([^ ]*) Favorable Rating/gi.exec(question.name)[2].trim();
                question.first_name = /(.*) ([^ ]*) Favorable Rating/gi.exec(question.name)[1].trim();

            } else {
                console.log("No name for favorability: '", question.name, "'.");
            }

        } else if (question.name.match(/identification/gi) !== null || question.name.match(/party id/gi) !== null) {
            question.type = "identification";

        } else if (question.name.match(/favor\/oppose/gi) !== null) {
            question.type = "favor/oppose";

        } else if (question.name.match(/satisfaction/gi) !== null) {
            question.type = "satisfaction";

        } else if (question.name.match(/direction/gi) !== null) {
            question.type = "direction";

        } else {
            question.type = "election";
            question.year = question.name.substring(0, 4).match(/[0-9][0-9][0-9][0-9]/gi) ? question.name.substring(0, 4) : undefined;

            if (question.name.match(/national house/gi) !== null) {
                question.type = "Congressional Generic Ballot";
                question.office = "Congressional Generic Ballot";

            } else if (question.name.match(/lieutenant/gi) !== null) {
                question.office = "Lieutenant Governor";

            } else if (question.name.match(/governor/gi) !== null || question.name.match(/gubernatorial/gi) !== null) {
                question.office = "Governor";

            } else if (question.name.match(/senate/gi) !== null) {
                question.office = "Senate";

            } else if (question.name.match(/house/gi) !== null || question.name.match(/cd-/gi) !== null || question.name.match(/at-large/gi) !== null) {
                question.office = "House";

                if (question.name.match(/at-large/gi) !== null) {
                    question.district = "At-Large";

                } else if (question.name.match(/cd-/gi) !== null) {
                    question.district = /.*cd-([0-9]*).*/gi.exec(question.name)[1].trim();

                } else {
                    question.district = /.*house: ([0-9]*).*/gi.exec(question.name)[1].trim();

                }

            } else if (question.name.match(/mayor/gi) !== null) {
                question.office = "Mayor";

            } else if (question.name.match(/attorney general/gi) !== null) {
                question.office = "Attorney General";

            } else if (question.name.match(/comptroller/gi) !== null) {
                question.office = "Comptroller";

            } else if (question.name.match(/president/gi) !== null) {
                question.office = "President";

            } else {
                question.office = "President";

                console.log("Assumed president for election: '", question.name, "'.");
            }

            if (question.name.match(/primary/gi) !== null) {
                if (question.name.match(/gop/gi) !== null || question.name.match(/republican/gi) !== null) {
                    question.primary = "Republican";

                } else if (question.name.match(/democrat/gi) !== null) {
                    question.primary = "Democratic";

                } else {
                    question.primary = "open";

                    console.log("Assumed open for primary: '", question.name, "'.");
                }
            }
        }

        question.subpopulations.forEach(function(subpopulation) {

            underscore.keys(SUBPOPULATION_CODE_MAP).forEach(function(key) {
                if (subpopulation.name === key) {
                    subpopulation.name = SUBPOPULATION_CODE_MAP[key];
                }
            });

            subpopulation.responses.forEach(function(response) {
                underscore.keys(PARTY_CODE_MAP).forEach(function(key) {
                    if (response.party === key) {
                        response.party = PARTY_CODE_MAP[key];
                    }
                });

            });
        })
    });
};

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
        return previousValue = previousValue + ((currentValue.value - bMean) * (currentValue.value - aMean)) / bCandidate.length;
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