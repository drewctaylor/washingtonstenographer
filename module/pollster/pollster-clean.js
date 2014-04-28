var underscore = require("underscore");

var STATE_CODE_STATE_NAME_MAP = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "DC",
    "FL": "Florida",
    "GA": "Georgia",
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
    "MA": "Massachusetts",
    "MI": "Michigan",
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
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
    "US": "US"
};

var STATE_CODE_STATE_DEMONYM_MAP = {
    "AL": "Alabamian",
    "AK": "Alaskan",
    "AZ": "Arizonan",
    "AR": "Arkansan",
    "CA": "Californian",
    "CO": "Coloradan",
    "CT": "Connecticuter",
    "DE": "Delawarean",
    "DC": "Washingtonian",
    "FL": "Floridian",
    "GA": "Georgian",
    "HI": "Hawaiian",
    "ID": "Idahoan",
    "IL": "Illinoisan",
    "IN": "Indianian",
    "IA": "Iowan",
    "KS": "Kansan",
    "KY": "Kentuckian",
    "LA": "Louisianan",
    "ME": "Mainer",
    "MD": "Marylander",
    "MA": "Massachusettsan",
    "MI": "Michiganian",
    "MN": "Minnesotan",
    "MS": "Mississippian",
    "MO": "Missourian",
    "MT": "Montanan",
    "NE": "Nebraskan",
    "NV": "Nevadan",
    "NH": "New Hampshirite",
    "NJ": "New Jerseyan",
    "NM": "New Mexican",
    "NY": "New Yorker",
    "NC": "North Carolinian",
    "ND": "North Dakotan",
    "OH": "Ohioan",
    "OK": "Oklahoman",
    "OR": "Oregonian",
    "PA": "Pennsylvanian",
    "RI": "Rhode Islander",
    "SC": "South Carolinian",
    "SD": "South Dakotan",
    "TN": "Tennessean",
    "TX": "Texan",
    "UT": "Utahn",
    "VT": "Vermonter",
    "VA": "Virginian",
    "WA": "Washingtonian",
    "WV": "West Virginian",
    "WI": "Wisconsinite",
    "WY": "Wyomingite",
    "US": "American"
};

var PARTY_CODE_MAP = {
    "dem": "Democrat",
    "rep": "Republican",
    "rep c": "Republican",
    "ind": "independent",
    "gre": "Green",
    "con": "Conservative", // or Constitution
    "lib": "Libertarian",
    "mod": "Moderate",
    "pea": "Peace and Freedom",
    "prog": "Progressive",
    "ref": "Reform",
    "soc": "Socialist",
    "tea": "Tea Party",
    "whg": "Whig",
    "wri": "", // write-in
};

var SUBPOPULATION_CODE_MAP = {
    "adults - democrat": "Democrats",
    "adults - republican": "Republicans",
    "adults - independent": "independents",
    "adults": "",
    "likely voters - democrat": "Democratic likely voters",
    "likely voters - republican": "Republican likely voters",
    "likely voters - independent": "independent likely voters",
    "likely voters": "likely voters",
    "registered voters - democrat": "Democratic registered voters",
    "registered voters - republican": "Republican reigstered voters",
    "registered voters - independent": "independent registered voters",
    "registered voters": "registered voters"
};

function stateCodeForQuestion(question) {
    /* If the question does not specify the state code:
     *      Beginning with the longest state name, if the question name contains
     *      that state name, assume the state code is the state code for that 
     *      state name.
     * 
     * If the question still does not specify the state code:
     *      If the question name contains "national", assume the state code is
     *      "US".
     *      
     * If the question still does not specify the state code:
     *      If the question name contains a state code, assume the state code
     *      is that state code.
     */

    var stateCode = question.state;

    if (underscore.keys(STATE_CODE_STATE_NAME_MAP).indexOf(stateCode) === -1) {
        underscore.pairs(STATE_CODE_STATE_NAME_MAP).sort(function(a, b) {
            return b.length - a.length;
        }).forEach(function(pair) {
            if (question.name.indexOf(pair[1]) !== -1) {
                stateCode = pair[0];
            }
        });

        if (underscore.keys(STATE_CODE_STATE_NAME_MAP).indexOf(stateCode) === -1) {

            if (question.name.match(/national/gi) !== null) {
                stateCode = "US";
            } else {
                underscore.pairs(STATE_CODE_STATE_NAME_MAP).forEach(function(pair) {
                    if (question.name.indexOf(pair[0]) !== -1) {
                        stateCode = pair[0];
                    }
                });

                if (underscore.keys(STATE_CODE_STATE_NAME_MAP).indexOf(stateCode) === -1) {
                    console.log("No state for question: '", question.name, "'.");
                }
            }
        }
    }

    return stateCode;
}

function typeNameForQuestion(question) {
    if (question.name.match(/approval/gi) !== null) {
        return "approval";

    } else if (question.name.match(/favorable/gi) !== null) {
        return "favorability";

    } else if (question.name.match(/identification/gi) !== null || question.name.match(/party id/gi) !== null) {
        return "identification";

    } else if (question.name.match(/favor\/oppose/gi) !== null) {
        return "favor/oppose";

    } else if (question.name.match(/satisfaction/gi) !== null) {
        return "satisfaction";

    } else if (question.name.match(/direction/gi) !== null) {
        return "direction";

    } else if (question.name.match(/national house/gi) !== null) {
        return "congressional generic ballot";

    } else {
        console.log("Assumed election for question: '", question.name, "'.");

        return "election";

    }
}

function officeForQuestion(question) {

    if (question.name.match(/lieutenant/gi) !== null) {
        return "Lieutenant Governor";

    } else if (question.name.match(/governor/gi) !== null || question.name.match(/gubernatorial/gi) !== null) {
        return "Governor";

    } else if (question.name.match(/senate/gi) !== null) {
        return "Senate";

    } else if (question.name.match(/house/gi) !== null || question.name.match(/cd-/gi) !== null || question.name.match(/at-large/gi) !== null) {
        return "House";

    } else if (question.name.match(/mayor/gi) !== null) {
        return "Mayor";

    } else if (question.name.match(/attorney general/gi) !== null) {
        return "Attorney General";

    } else if (question.name.match(/comptroller/gi) !== null) {
        return "Comptroller";

    } else if (question.name.match(/president/gi) !== null) {
        return "President";

    } else {
        console.log("Assumed president for election: '", question.name, "'.");

        return "President";
    }
}

function districtForQuestion(question) {
    if (question.name.match(/.*house: ([0-9]*).*/gi) !== null || question.name.match(/.*cd-([0-9]*).*/gi) !== null || question.name.match(/at-large/gi) !== null) {
        if (question.name.match(/at-large/gi) !== null) {
            return district = "At-Large";

        } else if (question.name.match(/.*cd-([0-9]*).*/gi) !== null) {
            return district = /.*cd-([0-9]*).*/gi.exec(question.name)[1].trim();

        } else if (question.name.match(/.*house: ([0-9]*).*/gi) !== null) {
            return district = /.*house: ([0-9]*).*/gi.exec(question.name)[1].trim();

        } else {
            console.log("No district for office: '", question.name, "'.");

            return undefined;
        }
    } else {
        return undefined;
    }
}

function primaryForQuestion(question) {
    if (question.name.match(/primary/gi) !== null) {
        if (question.name.match(/gop/gi) !== null || question.name.match(/republican/gi) !== null) {
            return "Republican";

        } else if (question.name.match(/democrat/gi) !== null) {
            return "Democratic";

        } else {
            console.log("Assumed open for primary: '", question.name, "'.");

            return "open";
        }
    } else {
        return undefined;
    }
}

function yearForQuestion(question) {
    return question.name.substring(0, 4).match(/[0-9][0-9][0-9][0-9]/gi) ? Number(question.name.substring(0, 4)) : undefined;
}

function subjectForApproval(question) {
    if (question.name.match(/congress/gi) !== null) {
        return {
            type: "organization",
            name: "Congress"
        };
    } else if (question.name.match(/([^,\\.]*)[,\\.]([^-]*)-[^-]*-.*Job Approval/gi) !== null) {
        return {
            type: "person",
            last_name: /([^,\\.]*)[,\\.]([^-]*)-[^-]*-.*Job Approval/gi.exec(question.name)[1].trim(),
            first_name: /([^,\\.]*)[,\\.]([^-]*)-[^-]*-.*Job Approval/gi.exec(question.name)[2].trim()
        };
    } else if (question.name.match(/[^:]*: *Obama Job Approval/gi) !== null || question.name.match(/Obama Job Approval.*/gi) !== null) {
        var aspect = undefined;

        if (question.name.match(/economy/gi) !== null) {
            aspect = "economy";
        }

        if (question.name.match(/health care/gi) !== null) {
            aspect = "health care";
        }

        if (question.name.match(/foreign policy/gi) !== null) {
            aspect = "foreign policy";
        }

        return {
            type: "person",
            last_name: "Obama",
            first_name: "Barack",
            aspect: aspect
        };
    } else if (question.name.match(/([^,]*),([^-]*)-[^-]*-.*Favorable Rating/gi) !== null) {
        return {
            type: "person",
            last_name: /([^,]*),([^-]*)-[^-]*-.*Favorable Rating/gi.exec(question.name)[1].trim(),
            first_name: /([^,]*),([^-]*)-[^-]*-.*Favorable Rating/gi.exec(question.name)[2].trim()
        };
    } else if (question.name.match(/(.*) ([^ ]*) Favorable Rating/gi) !== null) {
        return {
            type: "person",
            last_name: /(.*) ([^ ]*) Favorable Rating/gi.exec(question.name)[2].trim(),
            first_name: /(.*) ([^ ]*) Favorable Rating/gi.exec(question.name)[1].trim()
        };
    } else {
        console.log("No name for favorability: '", question.name, "'.");
    }
}

function subjectForElection(question) {
    var office = officeForQuestion(question);
    var stateCode = office === "President" ? "US" : question.stateCode;

    return {
        office: office,
        district: districtForQuestion(question),
        year: yearForQuestion(question),
        primary: primaryForQuestion(question),
        stateCode: stateCode,
        stateName: STATE_CODE_STATE_NAME_MAP[stateCode],
        stateDemonym: STATE_CODE_STATE_NAME_MAP[stateCode]
    };
}

function subjectForDirection(question) {
    return {
        name: "America"
    };
}

function subjectForGeneric(question) {
    return {
        year: yearForQuestion(question)
    }
}

function descriptionForSubpopulation(question, subpopulation) {
    return subpopulation.name === "adults" ?
            question.stateDemonym + "s" :
            (question.state === "US" ?
                    SUBPOPULATION_CODE_MAP[subpopulation.name] :
                    question.stateName + " " + SUBPOPULATION_CODE_MAP[subpopulation.name]);
}

exports.clean = function(poll) {
    poll.method = poll.method.toLowerCase();

    poll.questions.forEach(function(question) {
        question.state = stateCodeForQuestion(question);
        question.stateCode = question.state;
        question.stateName = STATE_CODE_STATE_NAME_MAP[question.state];
        question.stateDemonym = STATE_CODE_STATE_DEMONYM_MAP[question.state];

        question.type = {
            name: typeNameForQuestion(question)
        };

        if (question.type.name === "approval" || question.type.name === "favorability") {
            question.type.subject = subjectForApproval(question);
        } else if (question.type.name === "election") {
            question.type.subject = subjectForElection(question);
        } else if (question.type.name === "congressional generic ballot") {
            question.type.subject = subjectForGeneric(question);
        } else if (question.type.name === "direction" || question.type.name === "satisfaction") {
            question.type.subject = subjectForDirection(question);
        }

        question.subpopulations.forEach(function(subpopulation) {
            subpopulation.name = subpopulation.name.toLowerCase();
            subpopulation.description = descriptionForSubpopulation(question, subpopulation);

            subpopulation.responses.forEach(function(response) {
                response.choice = response.last_name ? response.choice : response.choice.toLowerCase();
                response.party = response.party ? PARTY_CODE_MAP[response.party.toLowerCase()] : response.party;
            });
        });
    });
};
