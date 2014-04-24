require("../module/pollster/pollster-synchronize.js").synchronize(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/POLLSTER").then(function(result) {
    console.log(result);
}).catch(function(error) {
    console.log(error.stack);
});