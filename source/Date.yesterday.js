// Date.now
Date.yesterday = function now() {
    var d = new Date();
    return d.setDate(d.getDate() - 1);
};
