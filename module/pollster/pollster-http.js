var http = require("http");
var moment = require("moment");
var Promise = require("es6-promise").Promise;

function Charts() {
    var stateValue;
    var topicValue;

    this.state = function(stateValueIn) {
        if (stateValueIn === undefined)
            throw "stateValueIn === undefined";

        stateValue = stateValueIn;

        return this;
    };

    this.topic = function(topicValueIn) {
        if (topicValueIn === undefined)
            throw "topicValueIn === undefined";

        topicValue = topicValueIn;

        return this;
    };

    this.promise = function() {
        return new Promise(function(resolve, reject) {
            var path = "/pollster/api/charts";

            if (stateValue !== undefined ||
                    topicValue !== undefined) {
                path = path + "?";
            }

            path = path + (stateValue !== undefined ? "state=" + stateValue + "&" : "");
            path = path + (topicValue !== undefined ? "topic=" + topicValue + "&" : "");
            path = path.substring(0, path.length - 1);
            
            console.log("http://elections.huffingtonpost.com" + path);

            http.get({
                hostname: "elections.huffingtonpost.com",
                port: 80,
                path: path
            }, function(response) {
                var responseDataArray = [];

                response.on("data", function(responseData) {
                    responseDataArray.push(responseData);
                });

                response.on("end", function() {
                    var responseJsonCurrent = JSON.parse(Buffer.concat(responseDataArray));

                    resolve(responseJsonCurrent);
                });
            }).on("error", function(error) {
                reject(error);
            });
        });
    };

}

function Chart(chartValue) {
    if (chartValue === undefined)
        throw "chartValue === undefined";

    this.promise = function() {
        return new Promise(function(resolve, reject) {
            var path = "/pollster/api/charts/" + chartValue;
            
            console.log("http://elections.huffingtonpost.com" + path);

            http.get({
                hostname: "elections.huffingtonpost.com",
                port: 80,
                path: path
            }, function(response) {
                var responseDataArray = [];

                response.on("data", function(responseData) {
                    responseDataArray.push(responseData);
                });

                response.on("end", function() {
                    var responseJsonCurrent = JSON.parse(Buffer.concat(responseDataArray));

                    resolve(responseJsonCurrent);
                });
            }).on("error", function(error) {
                reject(error);
            });
        });
    };

}

function Poll() {
    var fromValue;
    var pageValue;
    var chartValue;
    var stateValue;
    var topicValue;
    var beforeValue;
    var afterValue;
    var updateValue;

    this.from = function(fromValueIn) {
        if (pageValue !== undefined)
            throw "pageValue !== undefined";
        if (Number.isNaN(parseInt(fromValueIn)))
            throw "Number.isNaN(parseInt(fromValueIn))";

        fromValue = parseInt(fromValueIn);

        return this;
    };

    this.page = function(pageValueIn) {
        if (fromValue !== undefined)
            throw "fromValue !== undefined";
        if (Number.isNaN(parseInt(pageValueIn)))
            throw "Number.isNaN(parseInt(pageValueIn))";

        pageValue = parseInt(pageValueIn);

        return this;
    };

    this.chart = function(chartValueIn) {
        if (chartValueIn === undefined)
            throw "chartValueIn === undefined";

        chartValue = chartValueIn;

        return this;
    };

    this.state = function(stateValueIn) {
        if (stateValueIn === undefined)
            throw "stateValueIn === undefined";

        stateValue = stateValueIn;

        return this;
    };

    this.topic = function(topicValueIn) {
        if (topicValueIn === undefined)
            throw "topicValueIn === undefined";

        topicValue = topicValueIn;

        return this;
    };

    this.endedBefore = function(beforeValueIn) {
        if (!moment(beforeValueIn).isValid())
            throw "!moment(beforeValueIn).isValid()";
        if (afterValue && afterValue > moment(beforeValueIn))
            throw "afterValue && afterValue > moment(beforeValueIn)";

        beforeValue = moment(beforeValueIn);

        return this;
    };

    this.endedAfter = function(afterValueIn) {
        if (!moment(afterValueIn).isValid())
            throw "!moment(afterValueIn).isValid()";
        if (beforeValue && beforeValue < moment(afterValueIn))
            throw "beforeValue && beforeValue < moment(afterValueIn)";

        afterValue = moment(afterValueIn);

        return this;
    };

    this.updatedSince = function(updateValueIn) {
        if (!moment(updateValueIn).isValid())
            throw "!moment(updateValueIn).isValid()";

        updateValue = moment(updateValueIn);

        return this;
    };
    
    this.promise = function() {
        return new Promise(function(resolve, reject) {
            var path = "/pollster/api/polls";

            if (fromValue !== undefined ||
                    pageValue !== undefined ||
                    chartValue !== undefined ||
                    stateValue !== undefined ||
                    topicValue !== undefined ||
                    beforeValue !== undefined ||
                    afterValue !== undefined ||
                    updateValue !== undefined) {
                path = path + "?";
            }

            if (fromValue === undefined && pageValue === undefined) {
                fromValue = 1;
            }

            if (fromValue !== undefined) {
                path = path + (fromValue !== undefined ? "page=" + fromValue + "&" : "");
            } else if (pageValue !== undefined) {
                path = path + (pageValue !== undefined ? "page=" + pageValue + "&" : "");
            }

            path = path + (chartValue !== undefined ? "chart=" + chartValue + "&" : "");
            path = path + (stateValue !== undefined ? "state=" + stateValue + "&" : "");
            path = path + (topicValue !== undefined ? "topic=" + topicValue + "&" : "");
            path = path + (beforeValue !== undefined ? "before=" + beforeValue.format("YYYY-MM-DD") + "&" : "");
            path = path + (afterValue !== undefined ? "after=" + afterValue.format("YYYY-MM-DD") + "&" : "");
            path = path + "sort=updated";
            
            console.log("http://elections.huffingtonpost.com" + path);

            http.get({
                hostname: "elections.huffingtonpost.com",
                port: 80,
                path: path
            }, function(response) {
                var responseDataArray = [];

                response.on("data", function(responseData) {
                    responseDataArray.push(responseData);
                });

                response.on("end", function() {
                    var responseJsonCurrent = JSON.parse(Buffer.concat(responseDataArray)).filter(function(poll) {
                        return updateValue === undefined || moment(updateValue).isBefore(poll.last_updated);
                    });

                    if (responseJsonCurrent.length === 0 || fromValue === undefined) {
                        resolve(responseJsonCurrent);
                    } else {
                        var poll = new Poll().from(fromValue + 1);
                        poll = (chartValue !== undefined ? poll.chart(chartValue) : poll);
                        poll = (stateValue !== undefined ? poll.state(stateValue) : poll);
                        poll = (topicValue !== undefined ? poll.topic(topicValue) : poll);
                        poll = (beforeValue !== undefined ? poll.endedBefore(beforeValue) : poll);
                        poll = (afterValue !== undefined ? poll.endedAfter(afterValue) : poll);
                        poll = (updateValue !== undefined ? poll.updatedSince(updateValue) : poll);

                        poll.promise().then(function(responseJson) {
                            resolve(responseJson === undefined ? responseJsonCurrent : responseJsonCurrent.concat(responseJson));
                        }, function(error) {
                            reject(error);
                        });
                    }
                });
            }).on("error", function(error) {
                reject(error);
            });
        });
    };
}

exports.chart = function(chartValue) {
    return new Chart(chartValue);
};

exports.charts = function() {
    return new Charts();
};

exports.poll = function() {
    return new Poll();
};