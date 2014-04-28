var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

exports.storyPollDisclaimerGoal = function() {
    return new goal.Goal("Story - Poll - Disclaimer")
            .action(new action.Action("Story - Poll - Unsponsored")
                    .thereExists(function(poll) {
                        return (!poll.sponsors || poll.sponsors.length === 0) &&
                                (poll.question.subpopulation.margin_of_error && poll.question.subpopulation.margin_of_error !== 0) &&
                                (poll.question.subpopulation.observations && poll.question.subpopulation.observations !== 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-unsponsored.html")))

            .action(new action.Action("Story - Poll - Sponsored")
                    .thereExists(function(poll) {
                        return (poll.sponsors && poll.sponsors.length !== 0) &&
                                (poll.question.subpopulation.margin_of_error && poll.question.subpopulation.margin_of_error !== 0) &&
                                (poll.question.subpopulation.observations && poll.question.subpopulation.observations !== 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-sponsored.html")))

            .action(new action.Action("Story - Poll - Unsponsored - No Error")
                    .thereExists(function(poll) {
                        return (!poll.sponsors || poll.sponsors.length === 0) &&
                                (!poll.question.subpopulation.margin_of_error || poll.question.subpopulation.margin_of_error === 0) &&
                                (poll.question.subpopulation.observations && poll.question.subpopulation.observations !== 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-unsponsored-no-error.html")))

            .action(new action.Action("Story - Poll - Sponsored - No Error")
                    .thereExists(function(poll) {
                        return (poll.sponsors && poll.sponsors.length !== 0) &&
                                (!poll.question.subpopulation.margin_of_error || poll.question.subpopulation.margin_of_error === 0) &&
                                (poll.question.subpopulation.observations && poll.question.subpopulation.observations !== 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-sponsored-no-error.html")))

            .action(new action.Action("Story - Poll - Unsponsored - No Observations")
                    .thereExists(function(poll) {
                        return (!poll.sponsors || poll.sponsors.length === 0) &&
                                (poll.question.subpopulation.margin_of_error && poll.question.subpopulation.margin_of_error !== 0) &&
                                (!poll.question.subpopulation.observations || poll.question.subpopulation.observations === 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-unsponsored-no-observations.html")))

            .action(new action.Action("Story - Poll - Sponsored - No Observations")
                    .thereExists(function(poll) {
                        return (poll.sponsors && poll.sponsors.length !== 0) &&
                                (poll.question.subpopulation.margin_of_error && poll.question.subpopulation.margin_of_error !== 0) &&
                                (!poll.question.subpopulation.observations || poll.question.subpopulation.observations === 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-sponsored-no-observations.html")))

            .action(new action.Action("Story - Poll - Unsponsored - No Error - No Observations")
                    .thereExists(function(poll) {
                        return (!poll.sponsors || poll.sponsors.length === 0) &&
                                (!poll.question.subpopulation.margin_of_error || poll.question.subpopulation.margin_of_error === 0) &&
                                (!poll.question.subpopulation.observations || poll.question.subpopulation.observations === 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-unsponsored-no-error-no-observations.html")))

            .action(new action.Action("Story - Poll - Sponsored - No Error - No Observations")
                    .thereExists(function(poll) {
                        return (poll.sponsors && poll.sponsors.length !== 0) &&
                                (!poll.question.subpopulation.margin_of_error || poll.question.subpopulation.margin_of_error === 0) &&
                                (!poll.question.subpopulation.observations || poll.question.subpopulation.observations === 0);
                    })
                    .then(substitute("/poll/poll-disclaimer-sponsored-no-error-no-observations.html")));
};