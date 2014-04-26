var action = require("./story-action.js");
var goal = require("./story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollRightSatisfaction = new action.Action("Story - Poll - Satisfaction - Right Satisfaction")
        .thereExists(function(poll) {
            return poll.calculation.satisfied > poll.calculation.dissatisfied && poll.calculation.satisfied - poll.calculation.dissatisfied > 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-satisfaction-satisfied.html"));

var storyPollWrongTrack = new action.Action("Story - Poll - Satisfaction - Wrong Track")
        .thereExists(function(poll) {
            return poll.calculation.satisfied < poll.calculation.dissatisfied && poll.calculation.dissatisfied - poll.calculation.satisfied > 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-satisfaction-dissatisfied.html"));

var storyPollDivided = new action.Action("Story - Poll - Satisfaction - Divided")
        .thereExists(function(poll) {
            return Math.abs(poll.calculation.satisfied - poll.calculation.dissatisfied) <= 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-satisfaction-divided.html"));

var storyPollSatisfactionGoal = new goal.Goal("Story - Poll - Satisfaction - Type")
        .action(storyPollRightSatisfaction)
        .action(storyPollWrongTrack)
        .action(storyPollDivided);

exports.storyPollSatisfaction = function() {
    return new action.Action("Story - Poll - Satisfaction")
            .thereExists(function(poll) {
                return poll.question.type.name === "satisfaction";
            })
            .then(function(poll) {
                poll.calculation = {};

                poll.calculation.satisfied = poll.question.subpopulation.responses.reduce(function(total, response) {
                    return total + (response.choice === "satisfied" ? response.value : 0);
                }, 0);
                
                poll.calculation.dissatisfied = poll.question.subpopulation.responses.reduce(function(total, response) {
                    return total + (response.choice === "dissatisfied" ? response.value : 0);
                }, 0);
                
                storyPollSatisfactionGoal.satisfy(poll);
            });
};