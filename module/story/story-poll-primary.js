var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollElectionEstimateGoal = require("./story-poll-estimate.js").storyPollElectionEstimateGoal();

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

exports.storyPollPrimary = function() {
    return new action.Action("Story - Poll - Primary")
            .thereExists(function(poll) {
                return poll.question.type.name === "election" && poll.question.type.subject.primary;
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
};