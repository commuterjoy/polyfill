'use strict';

var express             = require('express'),
    fs                  = require('fs');

var app = express();

var polyfillDirectory = JSON.parse(fs.readFileSync('agent.js.json', { encoding: 'utf8' }));
var userAgentPatterns = JSON.parse(fs.readFileSync('agent.json', { encoding: 'utf8' }));
var polyfills = {};

// Loads polyfills in to memory
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

// FIXME ignore brower version number for now 
var getPolyfillsFor = function (browserFamily) {
    var fills = (polyfillDirectory.hasOwnProperty(browserFamily)) ?
            polyfillDirectory[browserFamily][0].fill : ''; 
    return fills.split(' ').map(function (fill) {
        return polyfills[fill];
    }).join("\n");
};

loadPolyfills(); 

app.get('/', function (req, res) {

    // TODO - move to middleware/polyfill and match the
    // entry point to your application
    var ua = req.headers['user-agent'];

    var browser = findUserAgent(ua);
    var pf = getPolyfillsFor(browser);
   
    // Cachable output - private? 
    res.setHeader('X-Polyfill-Family', browser);
    res.setHeader('Vary', 'User-Agent');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(200, pf);
});

var server = app.listen(process.env.PORT || 5000);
console.log('application running');

module.exports = app;
