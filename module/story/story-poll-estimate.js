var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

exports.storyPollElectionEstimateGoal = function() {
    return new goal.Goal("Story - Poll - Election - Estimate")
            .action(new action.Action("Story - Poll - Election - Estimate Present")
                    .thereExists(function(poll) {
                        return poll.candidate[0].estimate;
                    })
                    .then(substitute("/poll/poll-election-estimate-present.html")))
            .action(new action.Action("Story - Poll - Election - Estimate Absent")
                    .thereExists(function(poll) {
                        return !poll.candidate[0].estimate;
                    })
                    .then(substitute("/poll/poll-election-estimate-absent.html")));
};