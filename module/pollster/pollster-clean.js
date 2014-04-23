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

/* type: approval
 * 
 * 
 * 
 */ 


function officeForQuestion(question) {
    
    if (question.name.match(/lieutenant/gi) !== null) {
        return "Lieutenant Governor";

    } else if (question.name.match(/governor/gi) !== null || question.name.match(/gubernatorial/gi) !== null) {
        return "Governor";

    } else if (question.name.match(/senate/gi) !== null) {
        return "Senate";

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
}

function typeForQuestion(question) {
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
        return "election";

    }
}

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

    question.stateCode = question.state;

    if (underscore.keys(STATE_CODE_STATE_NAME_MAP).indexOf(question.stateCode) === -1) {
        underscore.pairs(STATE_CODE_STATE_NAME_MAP).sort(function(a, b) {
            return b.length - a.length;
        }).forEach(function(pair) {
            if (question.name.indexOf(pair[1]) !== -1) {
                question.stateCode = pair[0];
            }
        });

        if (underscore.keys(STATE_CODE_STATE_NAME_MAP).indexOf(question.stateCode) === -1) {

            if (question.name.match(/national/gi) !== null) {
                question.stateCode = "US";
            } else {
                underscore.pairs(STATE_CODE_STATE_NAME_MAP).forEach(function(pair) {
                    if (question.name.indexOf(pair[0]) !== -1) {
                        question.stateCode = pair[0];
                    }
                });

                if (underscore.keys(STATE_CODE_STATE_NAME_MAP).indexOf(question.stateCode) === -1) {
                    console.log("No state for question: '", question.name, "'.");
                }
            }
        }
    }
}

exports.augment = function(poll) {
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
    });
};

