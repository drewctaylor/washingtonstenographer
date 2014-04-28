var _ = require("underscore");
var sprintf = require("sprintf-js").sprintf;

function product(array) {
    return array.reduce(function(previous, current) {
        return previous.map(function(previousElement) {
            return current.map(function(currentElement) {
                return previousElement.concat(currentElement);
            });
        }).reduce(function(previousElement, currentElement) {
            return previousElement.concat(currentElement);
        });
    }, [[]]);
}

function ActionError(message) {
    this.name = "ActionError";
    this.message = message || "The system threw an ActionError.";
}

ActionError.prototype = new Error();
ActionError.prototype.constructor = ActionError;

function Action(name) {
    var forAllFunctionSet = [];
    var thereExistsFunction = undefined;
    var thenFunction = undefined;

    this.forAll = function(forAllInput) {
        if (thereExistsFunction !== undefined) {
            throw "The system cannot define a forAll function after the thereExists function.";
        }
        if (thenFunction !== undefined) {
            throw "The system cannot define a forAll function after the then function.";
        }
        if (typeof forAllInput !== "function") {
            throw "The type of the given forAll function is not function.";
        }

        forAllFunctionSet.push(forAllInput);

        return this;
    };

    this.thereExists = function(thereExistsInput) {
        if (thenFunction !== undefined) {
            throw "The system cannot define the thereExists function after the then function.";
        }
        if (typeof thereExistsInput !== "function") {
            throw "The type of the given thereExists function is not function.";
        }

        thereExistsFunction = thereExistsInput;

        return this;
    };

    this.then = function(thenInput) {
        if (typeof thenInput !== "function") {
            throw "The type of the given then function is not function.";
        }

        if (thereExistsFunction === undefined) {
            thereExistsFunction = function() {
                return true;
            };
        }

        thenFunction = thenInput;

        return this;
    };

    this.name = function() {
        return name;
    };

    this.executable = function(story) {
        var forAllIndex;

        for (forAllIndex = 0; forAllIndex < forAllFunctionSet.length; forAllIndex++) {
            if (!forAllFunctionSet[forAllIndex].apply(undefined, [story])) {
                throw new ActionError(sprintf("The system could not execute the action '%s' because forAll() #%s returned false for %s.",
                        name,
                        forAllIndex,
                        JSON.stringify(story)));
            }
        }

        if (thereExistsFunction.apply(undefined, [story])) {
            return true;
        }

        throw new ActionError(sprintf("The system could not execute the action '%s' because thereExists() never returned true.", name));
    };

    this.execute = function(story) {
        var forAllIndex;

        for (forAllIndex = 0; forAllIndex < forAllFunctionSet.length; forAllIndex++) {
            if (!forAllFunctionSet[forAllIndex].apply(undefined, [story])) {
                throw new ActionError(sprintf("The system could not execute the action '%s' because forAll() #%s returned false for %s.",
                        name,
                        forAllIndex,
                        JSON.stringify(story)));
            }
        }

        if (thereExistsFunction.apply(undefined, [story])) {
            thenFunction.apply(undefined, [story]);
            return;
        }

        throw new ActionError(sprintf("The system could not execute the action '%s' because thereExists() never returned true.", name));
    };
}

module.exports.Action = Action;