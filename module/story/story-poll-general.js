var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollElectionEstimateGoal = require("./story-poll-estimate.js").storyPollElectionEstimateGoal();

var storyPollGeneralTypeGoal = new goal.Goal("Story - Poll - Election - Type")
        .action(new action.Action("Story - Poll - Election - A B Tie")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            poll.candidateFirst.value === poll.candidateSecond.value;
                })
                .then(substitute("/poll/poll-election-tie-a-b.html")))
        .action(new action.Action("Story - Poll - Election - Divided A B")
                .thereExists(function(poll) {
                    return poll.candidate.length === 2 &&
                            (Math.abs(poll.candidateFirst.value - poll.candidateSecond.value) < (2 * poll.question.subpopulation.margin_of_error) || poll.question.subpopulation.margin_of_error === 0) &&
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

exports.storyPollGeneral = function() {
    return new action.Action("Story - Poll - Election")
            .thereExists(function(poll) {
                return poll.question.type.name === "election" && !poll.question.type.subject.primary;
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

                    storyPollGeneralTypeGoal.satisfy(poll);
                    storyPollElectionEstimateGoal.satisfy(poll);
                } catch (e) {
                    console.log(e);
                }
            });
};