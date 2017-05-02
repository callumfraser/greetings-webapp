var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var express_handlebars = require('express-handlebars');
var app = express();

var sessionNames = [];
var language;
var counter;
var port = process.env.PORT || 3000;

var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var namesGreeted1 = [];

var nameSchema = Schema({
    name: String,
    amount: Number
});


var NamesGreeted = mongoose.model("NamesGreeted", nameSchema);


var mongoDB = 'mongodb://localhost/greetingDatabase';
mongoose.connect(mongoDB);


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('./public'));

app.use(bodyParser.json());

app.engine('handlebars', express_handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res, next) {
    NamesGreeted.distinct("name", function(err, results) {
        if (sessionNames[0] !== undefined) {
            var lastName = sessionNames.length - 1;
            var nameForGreeting = sessionNames[lastName].name;
        };
        counter = results.length
        if (nameForGreeting == undefined || nameForGreeting == "") {
            language = "";
            nameForGreeting = "";
        } else {
            if (err) {
                return next(err)
            } else {
            }
        }
        res.render('greetings', {
          greeting: language + nameForGreeting,
          amount: results.length,
        });
    });
});

app.post('/', function(req, res, next) {
    sessionNames.push({
        "name": req.body.firstName
    });
    var clearButton = req.body.clearButton;
    var greetButton = req.body.greetButton;

    if (req.body.language == "isiXhosa") {
        language = "Molo, "
    } else if (req.body.language == "English") {
        language = "Hello, "
    } else if (req.body.language == "Afrikaans") {
        language = "Hallo, "
    } else if ((req.body.afrikaans && req.body.english && req.body.isiXhosa) == undefined) {
        language = "Please choose a language, "
    }
    if (greetButton) {
        NamesGreeted.findOne({
            name: req.body.firstName
        }, function(err, searchName) {
            if (err) {
                return next(err)
            } else {
                if (!searchName && (req.body.firstName !== "")) {
                    var newName = new NamesGreeted({
                        name: req.body.firstName,
                        amount: 1
                    });

                    newName.save(function(err) {
                        if (err) {
                            return console.error(err);
                        }
                    })
                } else {
                    NamesGreeted.update({
                            name: req.body.firstName
                        }, {
                            $inc: {
                                amount: 1
                            }
                        },
                        function(err) {
                            if (err) {
                                console.log("update not working")
                            }
                        });
                }
            }
        })
    } else if (clearButton) {
        NamesGreeted.remove({}, function(err) {
            if (err) {
                return console.log(err)
            }
        })
    };
    res.redirect('/');
});


app.get('/greeted', function(req, res, next) {
    var xx;
    NamesGreeted.distinct("name", function(err, results) {

        if (err) {
            return next(err);
        } else {
            res.render('greeted', {namesGreeted : results});

        }
    });
});

app.get('/counter/:userName', function(req, res, next) {

    NamesGreeted.findOne({
        name: req.params.userName
    }, function(err, UrlName) {
        if (err) {
            return next(err);
        } else {
            if (UrlName) {
                var resultOfNameSearch = "Hello, " + UrlName.name + ". You have been greeted " + UrlName.amount + " times since last update."
            } else {
                var resultOfNameSearch = "Sorry, that name has not been greeted yet."
            }
          }
            res.render("counter", {
            resultOfNameSearch
            })
            //

    });
});

app.listen(port, '0.0.0.0', function() {
    console.log("App listening on port")
});
