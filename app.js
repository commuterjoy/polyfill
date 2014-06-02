'use strict';

var express             = require('express'),
    fs                  = require('fs');

var app = express();

var polyfillDirectory = JSON.parse(fs.readFileSync('agent.js.json', { encoding: 'utf8' }));
var userAgentPatterns = JSON.parse(fs.readFileSync('agent.json', { encoding: 'utf8' }));
var polyfills = {};

// TODO - load polyfills in to memory

var loadPolyfills = function () {
    var source = __dirname + '/minified/'
    fs.readdirSync(source).forEach(function (filename) {
        if (filename[0] === '.') return;
        console.log('loading ', filename)
        var pf = fs.readFileSync(source + filename, 'utf8');
        polyfills[filename.replace('.js', '')] = pf;
    });
}

var findUserAgent = function (ua) {
    return Object.keys(userAgentPatterns).filter(function(k) {
        var r = new RegExp(userAgentPatterns[k]);
        return r.test(ua);
    });
};

var getPolyfillsFor = function (browserFamily) {
    var fills = polyfillDirectory[browserFamily][0].fill; // FIXME ignore brower version number for now 
    console.log(fills);
    return fills.split(' ').map(function (fill) {
        return polyfills[fill];
    });
};

//
loadPolyfills(); 

//console.log('user is using ' + browser, pf);

app.get('/', function (req, res) {

    // TODO - move to middleware/polyfill and match the
    // entry point to your application
    var ua = req.headers['user-agent'];

    var browser = findUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36');
    var pf = getPolyfillsFor(browser);

    // TODO - vary on x-browser-family
    res.send(200, pf);
});

var server = app.listen(process.env.PORT || 5000);
console.log('application running');

module.exports = app;
