var action = require("./story-action.js");
var goal = require("./story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

exports.storyPollElectionEstimateGoal = function() {
    return new goal.Goal("Story - Poll - Election - Estimate")
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
};