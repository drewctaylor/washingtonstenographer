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
            return poll.question.type === "favorability";
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
            return poll.question.type === "approval";
        })
        .then(function(poll) {
            console.log(poll.question.subpopulation.responses);
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
                    return poll.candidate.length === 2 && poll.question.subpopulation.margin_of_error &&
                            Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) >= (2 * poll.question.subpopulation.margin_of_error);
                })
                .then(substitute("/poll/poll-election-a-leads-b.html")))
        .action(new action.Action("Story - Poll - Election - A Leads B")
                .thereExists(function(poll) {
                    return poll.candidate.length !== 2;
                })
                .then(substitute("/poll/poll-election-a-leads-all.html")));

var storyPollPrimaryTypeGoal = new goal.Goal("Story - Poll - Primary - Type")
        .action(new action.Action("Story - Poll - Primary - A B Tie")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 && poll.candidateFirst.value === poll.candidateSecond.value;
                })
                .then(substitute("/poll/poll-primary-tie-a-b.html")))
        .action(new action.Action("Story - Poll - Primary - Divided A B")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) < (2 * poll.question.subpopulation.margin_of_error) &&
                            poll.candidateFirst.value != poll.candidateSecond.value;
                })
                .then(substitute("/poll/poll-primary-divided-a-b.html")))
        .action(new action.Action("Story - Poll - Primary - A Leads B")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) >= (2 * poll.question.subpopulation.margin_of_error);
                })
                .then(substitute("/poll/poll-primary-a-leads-b.html")))
        .action(new action.Action("Story - Poll - Primary - A Leads B")
                .thereExists(function(poll) {
                    return poll.candidate.length !== 2;
                })
                .then(substitute("/poll/poll-primary-a-leads-all.html")));


var storyPollElectionEstimateGoal = new goal.Goal("Story - Poll - Election - Estimate")
        .action(new action.Action("Story - Poll - Election - Estimate Present")
                .thereExists(function(poll) {
                    return poll.question.estimates && poll.question.estimates.length > 0;
                })
                .then(substitute("/poll/poll-election-estimate-present.html")))
        .action(new action.Action("Story - Poll - Election - Estimate Absent")
                .thereExists(function(poll) {
                    return !poll.question.estimates || poll.question.estimates.legnth === 0;
                })
                .then(substitute("/poll/poll-election-estimate-absent.html")));

var storyPollPrimary = new action.Action("Story - Poll - Primary")
        .thereExists(function(poll) {
            return poll.question.type === "election" && poll.question.primary;
        })
        .then(function(poll) {
            try {
                poll.candidate = poll.question.subpopulation.responses.filter(function(response) {
                    return response.first_name !== null;
                }).sort(function(a, b) {
                    return b.value - a.value;
                });

                if (poll.candidate) {
                    poll.candidate.forEach(function(candidate) {
                        if (poll.question.estimates) {
                            poll.question.estimates.forEach(function(estimate) {
                                if (candidate.choice === estimate.choice) {
                                    candidate.estimate = estimate.value;
                                }
                            })
                        }
                    })
                }

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

                storyPollPrimaryTypeGoal.satisfy(poll);
                storyPollElectionEstimateGoal.satisfy(poll);
            } catch (e) {
                console.log(e);
            }
        });

var storyPollElection = new action.Action("Story - Poll - Election")
        .thereExists(function(poll) {
            return poll.question.type === "election" && !poll.question.primary;
        })
        .then(function(poll) {
            try {
                poll.candidate = poll.question.subpopulation.responses.filter(function(response) {
                    return response.first_name !== null;
                }).sort(function(a, b) {
                    return b.value - a.value;
                });

                if (poll.candidate) {
                    poll.candidate.forEach(function(candidate) {
                        if (poll.question.estimates) {
                            poll.question.estimates.forEach(function(estimate) {
                                if (candidate.choice === estimate.choice) {
                                    candidate.estimate = estimate.value;
                                }
                            })
                        }
                    })
                }

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
                storyPollElectionEstimateGoal.satisfy(poll);
            } catch (e) {
                console.log(e);
            }
        });

var storyPollTypeGoal = new goal.Goal("Story - Poll - Type")
        .action(storyPollApproval)
        .action(storyPollFavorability)
        .action(storyPollPrimary)
        .action(storyPollElection);

var storyPoll = new action.Action("Story - Poll")
        .thereExists(function(poll) {
            return true;
        })
        .then(function(poll) {
            poll.question.subpopulation.responses = poll.question.subpopulation.responses.sort(function(a, b) {
                return b.value - a.value;
            });

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

            poll.text += "</div>";
        });

module.exports.StoryPollGoal = new goal.Goal("Story - Poll")
        .action(storyPoll);
