var config = require("zed/config");
var ui = require("zed/ui");
var http = require("zed/http");

module.exports = function(info) {
    var req = info.request;

    switch (req.path) {
        case "list-preferences":
            return config.getPreferences().then(function(allPrefs) {
                return {
                    status: 200,
                    body: JSON.stringify(allPrefs, null, 4)
                };
            });
        case "set-preference":
            var parsedBody = JSON.parse(req.body);
            config.setPreference(parsedBody.name, parsedBody.value);
            return {
                status: 200,
                body: JSON.stringify({
                    status: 'ok'
                })
            };
        case "close":
            http.stopServer("config");
            ui.hideWebview();
            return {
                status: 200
            };
    }
};
