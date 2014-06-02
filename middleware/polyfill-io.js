'use strict';

var fs                  = require('fs');

var polyfillDirectory = JSON.parse(fs.readFileSync('agent.js.json', { encoding: 'utf8' }));
var userAgentPatterns = JSON.parse(fs.readFileSync('agent.json', { encoding: 'utf8' }));
var polyfills = {};

// Loads polyfills in to memory
var cachePolyfills = function () {
    var source = __dirname + '/../minified/'
    fs.readdirSync(source).forEach(function (filename) {
        if (filename[0] === '.') return;
        console.log('loading polyfill, ', filename)
        var pf = fs.readFileSync(source + filename, 'utf8');
        polyfills[filename.replace('.js', '')] = pf;
    });
}

// Returns the browser family (Eg, Firefox, Opera) from a given user-agent string
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

cachePolyfills(); 

///

module.exports = function (req, res, next) {
    var ua = req.headers['user-agent'];
    var browser = findUserAgent(ua);
    res.polyfill = getPolyfillsFor(browser);
    res.setHeader('X-Polyfill-Family', browser);
    res.setHeader('Vary', 'User-Agent');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    next();
};
