var postgresql = require("pg");
var Promise = require("es6-promise").Promise;

function Context(connectionDescriptor) {
    var statementArray = [];

    this.enqueue = function(statement) {
        console.log(statement);
        statementArray.push(statement);

        return this;
    };

    this.promise = function() {
        if (statementArray.length === 0) {
            throw "statementArray.length === 0";
        }

        return new Promise(function(resolve, reject) {
            var client = new postgresql.Client(connectionDescriptor);

            var statement = statementArray.pop();

            statementArray.map(function(statement) {
                client.query.apply(client, statement.concat(function(error, result) {
                    if (error !== null) {
                        reject(error);
                    }
                }));
            });

            client.query.apply(client, statement.concat(function(error, result) {
                if (error !== null) {
                    reject(error);
                } else {
                    resolve(result.rows);
                }
            }));

            client.on("drain", client.end.bind(client));
            
            client.connect(function(error) {
                if (error !== null) {
                    reject(error);
                }
            });
        });
    };
}

function ConnectionFactory(connectionDescriptor) {
    this.connection = function() {
        return new Context(connectionDescriptor);
    };
}

exports.connectionFactory = function(connectionDescriptor) {
    return new ConnectionFactory(connectionDescriptor);
};