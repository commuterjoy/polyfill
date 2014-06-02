'use strict';

var express             = require('express');
var polyfill            = require('./middleware/polyfill-io');

var app = express();
app.set('view engine', 'jade');

app.use(polyfill);
app.get('/', function (req, res) {
    res.render('polyfill', { polyfill: res.polyfill });
});

app.get('/example', function (req, res) {
    res.render('example', { polyfill: res.polyfill });
});

app.listen(process.env.PORT || 5000);
console.log('application running');
