var http = require("zed/http");
var ui = require("zed/ui");

module.exports = function() {
    return http.startServer("config", "Configuration:Preference:Http Request").then(function(url) {
        return ui.showWebview(url + "/static/index.html");
    });
};
