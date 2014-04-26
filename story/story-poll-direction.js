var action = require("./story-action.js");
var goal = require("./story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollRightDirection = new action.Action("Story - Poll - Direction - Right Direction")
        .thereExists(function(poll) {
            return poll.calculation.rightdirection > poll.calculation.wrongtrack && poll.calculation.rightdirection - poll.calculation.wrongtrack > 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-direction-right-direction.html"));

var storyPollWrongTrack = new action.Action("Story - Poll - Direction - Wrong Track")
        .thereExists(function(poll) {
            return poll.calculation.rightdirection < poll.calculation.wrongtrack && poll.calculation.wrongtrack - poll.calculation.rightdirection > 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-direction-wrong-track.html"));

var storyPollDivided = new action.Action("Story - Poll - Direction - Divided")
        .thereExists(function(poll) {
            return Math.abs(poll.calculation.rightdirection - poll.calculation.wrongtrack) <= 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-direction-divided.html"));

var storyPollDirectionGoal = new goal.Goal("Story - Poll - Direction - Type")
        .action(storyPollRightDirection)
        .action(storyPollWrongTrack)
        .action(storyPollDivided);

exports.storyPollDirection = function() {
    return new action.Action("Story - Poll - Direction")
            .thereExists(function(poll) {
                return poll.question.type.name === "direction";
            })
            .then(function(poll) {
                poll.calculation = {};

                poll.calculation.rightdirection = poll.question.subpopulation.responses.reduce(function(total, response) {
                    return total + (response.choice === "right direction" || response.choice === "strongly right direction" ? response.value : 0);
                }, 0);
                
                poll.calculation.wrongtrack = poll.question.subpopulation.responses.reduce(function(total, response) {
                    return total + (response.choice === "wrong track" || response.choice === "strongly wrong track" ? response.value : 0);
                }, 0);
                
                storyPollDirectionGoal.satisfy(poll);
            });
};