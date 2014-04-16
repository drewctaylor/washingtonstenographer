var fs = require('fs');
var mustache = require("mustache");
var moment = require("moment");

var action = require("./story-action.js");
var goal = require("./story-goal.js");

function substitute(filename) {
    return function(poll) {
        poll.text += mustache.render(fs.readFileSync(__dirname + filename, "UTF-8"), poll);
    };
}

var storyPollDisclaimerGoal = new goal.Goal("Story - Poll - Disclaimer")
        .action(new action.Action("Story - Poll - No Sponsor")
                .thereExists(function(poll) {
                    return !poll.sponsors || poll.sponsors.length === 0;
                })
                .then(substitute("/poll/poll-disclaimer.html")))
        .action(new action.Action("Story - Poll - Sponsor")
                .thereExists(function(poll) {
                    return poll.sponsors && poll.sponsors.length > 0;
                })
                .then(substitute("/poll/poll-disclaimer-sponsor.html")));

var storyPollIdentification = new action.Action("Story - Poll - Identification")
        .thereExists(function(poll) {
            return poll.question.chart === "party-identification";
        })
        .then(substitute("/poll/poll-identification.html"));

var storyPollHouseTypeGoal = new goal.Goal("Story - Poll - House - Type")
        .action(new action.Action("Story - Poll - House - Lead")
                .thereExists(function(poll) {
                    return poll.candidateFirst.value - poll.candidateSecond.value > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-house-a-leads-b.html", "UTF-8")))
        .action(new action.Action("Story - Poll - House - Divided")
                .thereExists(function(poll) {
                    return Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-house-divided.html")));

var storyPollHouse = new action.Action("Story - Poll - House")
        .thereExists(function(poll) {
            console.log(poll.question.topic);
            return poll.question.topic === "2014-house";
        })
        .then(function(poll) {
            poll.candidate = poll.question.subpopulation.responses.filter(function(response) {
                return response.choice.toLowerCase() === "republican" ||
                        response.choice.toLowerCase() === "democrat";
            }).sort(function(a, b) {
                return b.value - a.value;
            });

            poll.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
            }, 0);

            poll.other = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "other" ? currentValue.value : 0);
            }, 0);

            poll.candidateFirst = poll.candidate[0];
            poll.candidateSecond = poll.candidate[1];

            storyPollHouseTypeGoal.satisfy(poll);
        });

var storyPollOpposeTypeGoal = new goal.Goal("Story - Poll - Favor/Oppose - Type")
        .action(new action.Action("Story - Poll - Favor/Oppose - Favor")
                .thereExists(function(poll) {
                    return poll.favor - poll.oppose > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-oppose-favor.html")))
        .action(new action.Action("Story - Poll - Favor/Oppose - Oppose")
                .thereExists(function(poll) {
                    return poll.oppose - poll.favor > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-oppose-oppose.html")))
        .action(new action.Action("Story - Poll - Favor/Oppose - Divided")
                .thereExists(function(poll) {
                    return Math.abs(poll.oppose - poll.favor) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-oppose-divided.html")))

var storyPollOppose = new action.Action("Story - Poll - Favor/Oppose")
        .thereExists(function(poll) {
            return poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue ||
                        currentValue.choice.toLowerCase() === "favor" ||
                        currentValue.choice.toLowerCase() === "somewhat favor";
            }, false);
        })
        .then(function(poll) {
            poll.favor = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "strongly favor" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somehwat favor" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "favor" ? currentValue.value : 0)
            }, 0);

            poll.oppose = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "strongly oppose" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somehwat oppose" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "oppose" ? currentValue.value : 0)
            }, 0);

            storyPollOpposeTypeGoal.satisfy(poll);
        });

var storyPollDirectionTypeGoal = new goal.Goal("Story - Poll - Right Track/Wrong Direction - Type")
        .action(new action.Action("Story - Poll - Right Track/Wrong Direction - Right Direction")
                .thereExists(function(poll) {
                    return poll.rightdirection - poll.wrongtrack > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-direction-right-direction.html")))
        .action(new action.Action("Story - Poll - Right Track/Wrong Direction - Wrong Track")
                .thereExists(function(poll) {
                    return poll.wrongtrack - poll.rightdirection > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-direction-wrong-track.html")))
        .action(new action.Action("Story - Poll - Right Track/Wrong Direction - Divided")
                .thereExists(function(poll) {
                    return Math.abs(poll.wrongtrack - poll.rightdirection) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-direction-divided.html")));

var storyPollDirection = new action.Action("Story - Poll - Right Track/Wrong Direction")
        .thereExists(function(poll) {
            return poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue ||
                        currentValue.choice.toLowerCase() === "right direction" ||
                        currentValue.choice.toLowerCase() === "wrong track";
            }, false);
        })
        .then(function(poll) {
            poll.rightdirection = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "right direction" ? currentValue.value : 0);
            }, 0);

            poll.wrongtrack = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "wrong track" ? currentValue.value : 0);
            }, 0);

            storyPollDirectionTypeGoal.satisfy(poll);
        });

var storyPollFavorabilityTypeGoal = new goal.Goal("Story - Poll - Favorability - Type")
        .action(new action.Action("Story - Poll - Favorability - Favorable")
                .thereExists(function(poll) {
                    return poll.calculation.favorable - poll.calculation.unfavorable > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-favorability-favorable.html")))
        .action(new action.Action("Story - Poll - Favorability - Unfavorable")
                .thereExists(function(poll) {
                    return poll.calculation.unfavorable - poll.calculation.favorable > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-favorability-unfavorable.html")))
        .action(new action.Action("Story - Poll - Favorability - Divided")
                .thereExists(function(poll) {
                    return Math.abs(poll.calculation.favorable - poll.calculation.unfavorable) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-favorability-divided.html")));

var storyPollFavorability = new action.Action("Story - Poll - Favorability")
        .thereExists(function(poll) {
            return poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue ||
                        currentValue.choice.toLowerCase() === "favorable" ||
                        currentValue.choice.toLowerCase() === "very favorable";
            }, false);
        })
        .then(function(poll) {
            poll.calculation = {};
            poll.calculation.favorable = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "favorable" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "very favorable" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somewhat favorable" ? currentValue.value : 0);
            }, 0);

            poll.calculation.unfavorable = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "unfavorable" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "very unfavorable" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somewhat unfavorable" ? currentValue.value : 0);
            }, 0);

            poll.calculation.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
            }, 0);

            poll.calculation.neither = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "neither" ? currentValue.value : 0);
            }, 0);
            
            poll.calculation.net = poll.calculation.favorable - poll.calculation.unfavorable;

            storyPollFavorabilityTypeGoal.satisfy(poll);
        });

var storyPollSatisfactionTypeGoal = new goal.Goal("Story - Poll - Satisfaction - Type")
        .action(new action.Action("Story - Poll - Satisfaction - Satisfied")
                .thereExists(function(poll) {
                    return poll.satisfied - poll.dissatisfied > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-satisfaction-satisfied.html")))
        .action(new action.Action("Story - Poll - Satisfaction - Dissatisfied")
                .thereExists(function(poll) {
                    return poll.dissatisfied - poll.satisfied > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-satisfaction-dissatisfied.html")))
        .action(new action.Action("Story - Poll - Satisfaction - Divided")
                .thereExists(function(poll) {
                    return Math.abs(poll.satisfied - poll.dissatisfied) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-satisfaction-divided.html")));

var storyPollSatisfaction = new action.Action("Story - Poll - Satisfaction")
        .thereExists(function(poll) {
            return poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue ||
                        currentValue.choice.toLowerCase() === "satisfied" ||
                        currentValue.choice.toLowerCase() === "very satisfied";
            }, false);
        })
        .then(function(poll) {
            poll.satisfied = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "satisfied" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "very satisfied" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somewhat satisfied" ? currentValue.value : 0);
            }, 0);

            poll.dissatisfied = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "dissatisfied" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "very dissatisfied" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somewhat dissatisfied" ? currentValue.value : 0);
            }, 0);

            poll.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
            }, 0);

            poll.neither = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "neither" ? currentValue.value : 0);
            }, 0);

            storyPollSatisfactionTypeGoal.satisfy(poll);
        });

var storyPollApprovalTypeGoal = new goal.Goal("Story - Poll - Approval - Type")
        .action(new action.Action("Story - Poll - Approval - Approve")
                .thereExists(function(poll) {
                    return poll.calculation.approve > poll.calculation.disapprove;
                })
                .then(substitute("/poll/poll-approval-approve.html")))
        .action(new action.Action("Story - Poll - Approval - Disapprove")
                .thereExists(function(poll) {
                    return poll.calculation.approve < poll.calculation.disapprove;
                })
                .then(substitute("/poll/poll-approval-disapprove.html")))
        .action(new action.Action("Story - Poll - Approval - Divided")
                .thereExists(function(poll) {
                    return poll.calculation.approve === poll.calculation.disapprove;
                })
                .then(substitute("/poll/poll-approval-divided.html")));

var storyPollApproval = new action.Action("Story - Poll - Approval")
        .thereExists(function(poll) {
            return poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue ||
                        currentValue.choice.toLowerCase() === "approve" ||
                        currentValue.choice.toLowerCase() === "strongly approve";
            }, false);
        })
        .then(function(poll) {
            poll.calculation = {};
            poll.calculation.approve = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "approve" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "strongly approve" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somewhat approve" ? currentValue.value : 0);
            }, 0);

            poll.calculation.disapprove = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "disapprove" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "strongly disapprove" ? currentValue.value : 0) +
                        (currentValue.choice.toLowerCase() === "somewhat disapprove" ? currentValue.value : 0);
            }, 0);
            
            poll.calculation.net = poll.calculation.approve - poll.calculation.disapprove;
            
            poll.calculation.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                        return previousValue +
                                (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
                    }, 0);

            poll.calculation.neither = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "neither" ? currentValue.value : 0);
            }, 0);

            storyPollApprovalTypeGoal.satisfy(poll);
        });

var storyPollElectionTypeGoal = new goal.Goal("Story - Poll - Election - Type")
        .action(new action.Action("Story - Poll - Election - A B Tie")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) < (2 * poll.question.subpopulation.margin_of_error) &&
                            poll.candidateFirst.value === poll.candidateSecond.value;
                })
                .then(substitute("/poll/poll-election-tie-a-b.html")))
        .action(new action.Action("Story - Poll - Election - Divided A B")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) < (2 * poll.question.subpopulation.margin_of_error) &&
                            poll.candidateFirst.value !== poll.candidateSecond.value;
                })
                .then(substitute("/poll/poll-election-divided-a-b.html")))
        .action(new action.Action("Story - Poll - Election - A Leads B")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) >= (2 * poll.question.subpopulation.margin_of_error);
                })
                .then(substitute("/poll/poll-election-a-leads-b.html")))
        .action(new action.Action("Story - Poll - Election - A Leads B")
                .thereExists(function(poll) {
                    return poll.candidate.length !== 2;
                })
                .then(substitute("/poll/poll-election-a-leads-all.html")));

var storyPollElection = new action.Action("Story - Poll - Election")
        .thereExists(function(poll) {
            return poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue || currentValue.first_name !== null;
            }, false);
        })
        .then(function(poll) {
            poll.candidate = poll.question.subpopulation.responses.filter(function(response) {
                return response.first_name !== null;
            }).sort(function(a, b) {
                return b.value - a.value;
            });

            poll.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
            }, 0);

            poll.other = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                return previousValue +
                        (currentValue.choice.toLowerCase() === "other" ? currentValue.value : 0);
            }, 0);

            poll.candidateFirst = poll.candidate[0];
            poll.candidateSecond = poll.candidate[1];

            storyPollElectionTypeGoal.satisfy(poll);
        });

var storyPollTypeGoal = new goal.Goal("Story - Poll - Type")
//        .action(storyPollHouse)
        .action(storyPollApproval)
        .action(storyPollFavorability)
//        .action(storyPollSatisfaction)
//        .action(storyPollIdentification)
//        .action(storyPollDirection)
//        .action(storyPollOppose)
        .action(storyPollElection);

var storyPoll = new action.Action("Story - Poll")
        .thereExists(function(poll) {
            return true;
        })
        .then(function(poll) {
            poll.question.subpopulation.responses = poll.question.subpopulation.responses.sort(function(a, b) {
                return b.value - a.value;
            });

            poll.question.subpopulation.responses.forEach(function(response) {
                switch (response.party) {
                    case "Dem":
                        response.party = "Democrat";
                        break;
                    case "Rep":
                        response.party = "Republican";
                        break;
                }
            });

            poll.question.subpopulation.name = poll.question.subpopulation.name.toLowerCase();

            switch (poll.question.subpopulation.name) {
                case "likely voters - republican":
                    poll.question.subpopulation.name = "Republican likely voters";
                    break;
                case "likely voters - democrat":
                    poll.question.subpopulation.name = "Democratic likely voters";
                    break;
                case "adults - republican":
                    poll.question.subpopulation.name = "Republicans";
                    break;
                case "adults - democrat":
                    poll.question.subpopulation.name = "Democrats";
                    break;
                case "adults - independent":
                    poll.question.subpopulation.name = "independents";
                    break;
                case "registered voters - republican":
                    poll.question.subpopulation.name = "Republican registered voters";
                    break;
                case "registered voters - democrat":
                    poll.question.subpopulation.name = "Democratic registered voters";
                    break;
                case "registered voters - independent":
                    poll.question.subpopulation.name = "independent registered voters";
                    break;
            }

            poll.start_date = moment(poll.start_date).format("dddd, MMMM Do, YYYY");
            poll.end_date = moment(poll.end_date).format("dddd, MMMM Do, YYYY");

            poll.method = poll.method.toLowerCase();
            poll.method = poll.method === "mixed" ? "several methods" : poll.method;

            poll.subject = poll.question.topic === "obama-job-approval" ? "Obama" : undefined;
            poll.subject = poll.subject ? poll.subject : (poll.question.chart === "us-health-bill" ? "Affordable Care Act" : undefined);
            poll.subject = poll.subject ? poll.subject : (poll.question.name.indexOf("Job Approval") !== -1 ? poll.question.name.substring(0, poll.question.name.indexOf("Job Approval")) : poll.subject);

            var p = JSON.stringify(poll);

            poll.text = "<div class=\"story\">";

            storyPollTypeGoal.satisfy(poll);
            storyPollDisclaimerGoal.satisfy(poll);

            poll.text += mustache.render(fs.readFileSync(__dirname + "/poll/poll-table.html", "UTF-8"), poll);

//            poll.text += p;

            poll.text += "</div>";
        });

module.exports.StoryPollGoal = new goal.Goal("Story - Poll")
        .action(storyPoll);
