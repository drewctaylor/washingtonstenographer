var storyAction = require("./story-action");
var _ = require("underscore");
var sprintf = require("sprintf-js").sprintf;

function GoalError(message) {
    this.name = "GoalError";
    this.message = message || "The system threw an GoalError.";
}

GoalError.prototype = new Error();
GoalError.prototype.constructor = GoalError;

function Goal(name) {
    var actionSet = [];

    this.name = function() {
        return name;
    };

    this.action = function(action) {
        if (!(action instanceof storyAction.Action)) {
            throw "The type of the action is not Action.";
        }

        actionSet.push(action);

        return this;
    };
    
    this.satisfy = function(story) {
        var actionIndex;

        actionSet = _.shuffle(actionSet);

        for (actionIndex = 0; actionIndex < actionSet.length; actionIndex++) {
            try {
                actionSet[actionIndex].execute.apply(undefined, [story]);
//                console.log(sprintf("The system satisfied the goal '%s' with the action '%s'.", name, actionSet[actionIndex].name()));
                return;
            } catch (e) {
//                console.log(e.message);
            }
        }

        throw new GoalError(sprintf("The system could not satisfy the goal '%s'.", name));
    };
}

module.exports.Goal = Goal;