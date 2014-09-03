var sections = [{
    name: "Editor",
    items: [{
        name: "useSoftTabs",
        doc: "Use spaces instead of tabs."
    }, {
        name: "tabSize"
    }, {
        name: "wordWrap"
    }, {
        name: "globalAutoRevert",
        doc: "Automatically reload files that are changed on disk."
    }, {
        name: "wordWrapColumn",
        type: "number"
    }, {
        name: "trimWhitespaceOnSave"
    }, {
        name: "trimEmptyLines"
    }, {
        name: "behaviorsEnabled",
        doc: "Enables 'intelligent' behaviors, e.g. automatically inserting a closing bracket when opening one."
    }, {
        name: "wrapBehaviorsEnabled",
        doc: "Will wrap selection in brackets when typing a bracket."
    }, {
        name: "autoIndentOnPaste"
    }, {
        name: "detectIndentation",
        doc: "Automatically detect indentation on file load"
    }]
}, {
    name: "UI",
    items: [{
        name: "fontSize"
    }, {
        name: "fontFamily"
    }, {
        name: "theme"
    }, {
        name: "keybinding"
    }, {
        name: "showMenus",
        doc: "Show window menus"
    }, {
        name: "persistentTree",
        doc: "Always show tree on the left of the screen"
    }, {
        name: "showGutter"
    }, {
        name: "dimInactiveEditors"
    }, {
        name: "showPrintMargin"
    }, {
        name: "printMarginColumn"
    }, {
        name: "showFoldWidgets"
    }, {
        name: "showInvisibles"
    }, {
        name: "displayIndentGuides"
    }, {
        name: "highlightActiveLine"
    }, {
        name: "highlightGutterLine"
    }, {
        name: "highlightSelectedWord"
    }, {
        name: "nativeScrollBars"
    }, {
        name: "scrollSpeed",
        doc: "Sets the scroll speed"
    }, {
        name: "scrollPastEnd"
    }, {
        name: "animatedScroll"
    }]
}, {
    name: "Project",
    items: [{
        name: "gotoExclude",
        type: "string-list",
        doc: "Path patterns to exclude from the project (not visible in tree, goto, file search)."
    }]
}, {
    name: "Code completion",
    items: [{
        name: "autoTriggerCompletion",
        doc: "With this enabled code completion is automatically triggered when e.g. a '.' is typed."
    }, {
        name: "continuousCompletion",
        doc: "Enables as-you-type completion (still in beta)."
    }, {
        name: "continuousCompletionDelay",
        doc: "Number of ms before continuous completion is shows"
    }]
}, {
    name: "Remote editing",
    items: [{
        name: "zedremServer"
    }, {
        name: "hygienicModeRemote",
        doc: "Do not create .zedstate files on remote servers"
    }]
}];


function jsonRequest(method, url, body) {
    return new Promise(function(resolve) {
        function reqListener() {
            resolve(JSON.parse(this.responseText));
        }

        var oReq = new XMLHttpRequest();
        oReq.onload = reqListener;
        oReq.open(method, url, true);

        if (body) {
            oReq.send(JSON.stringify(body));
        } else {
            oReq.send();
        }
    });
}

function setPref(name, value) {
    return jsonRequest("POST", "/action/set-preference", {
        name: name,
        value: value
    });
}

function changeNumPref(event) {
    var name = event.target.getAttribute("name");
    var value = event.target.value;

    setPref(name, parseInt(value, 10));
}

function changeStringPref(event) {
    var name = event.target.getAttribute("name");
    var value = event.target.value;

    setPref(name, value);
}

function changeStringListPref(event) {
    var name = event.target.getAttribute("name");
    var value = event.target.value;

    setPref(name, value.split('|'));
}

function changeBoolPref(event) {
    var name = event.target.getAttribute("name");
    var value = event.target.checked;

    setPref(name, value);
}

function niceName(name) {
    var newS = [];
    for (var i = 0; i < name.length; i++) {
        if (name[i].toUpperCase() === name[i]) { // uppercase
            newS.push(' ');
            newS.push(name[i].toLowerCase());
        } else {
            newS.push(name[i]);
        }
    }
    newS[0] = newS[0].toUpperCase();
    return newS.join('');
}

function safeString(value) {
    return value.replace(/"/g, "&quot;");
}

window.onload = function() {
    jsonRequest("GET", "/action/list-preferences").then(function(allPrefs) {
        var html = '';
        console.log("All prefs", allPrefs);
        sections.forEach(function(section) {
            html += '<h2>' + section.name + '</h2><table>';
            section.items.forEach(function(item) {
                var val = allPrefs[item.name];
                addHtmlFor(item.name, val, item);
                delete allPrefs[item.name];
            });
            html += '</table>';
        });
        if (Object.keys(allPrefs).length > 0) {
            html += '<h2>Miscelaneous</h2><table>';
            Object.keys(allPrefs).forEach(function(name) {
                var val = allPrefs[name];
                addHtmlFor(name, val);
            });
            html += '</table>';
        }
        document.getElementById("prefs").innerHTML = html;

        function addHtmlFor(name, val, item) {
            item = item || {};
            html += '<tr><td class="name">' + niceName(name) + '</td><td>';
            var type = item.type || typeof val;
            switch (type) {
                case 'string':
                    html += '<input type="text" name="' + name + '" onchange="changeStringPref(event)" value="' + safeString(val) + '" class="string-pref">';
                    break;
                case 'number':
                    html += '<input type="text" name="' + name + '" onchange="changeNumPref(event)" value="' + val + '" class="num-pref">';
                    break;
                case 'boolean':
                    html += '<input type="checkbox" name="' + name + '" onclick="changeBoolPref(event)" value="true" class="bool-pref" ' + (val ? "checked" : "") + '>';
                    break;
                case 'string-list':
                    html += '<input type="text" name="' + name + '" onchange="changeStringListPref(event)" value="' + safeString(val.join("|")) + '" class="string-list-pref"> (use <tt>|</tt> as separator)';
            }
            if (item.doc) {
                html += '<div class="doc">' + item.doc + '</div>';
            }
            html += '</td></tr>';
        }
    }).
    catch (function(err) {
        console.error(err);
    });

    var closers = document.querySelectorAll(".action-close");
    for (var i = 0; i < closers.length; i++) {
        var closer = closers[i];
        closer.addEventListener("click", function() {
            jsonRequest("POST", "/action/close");
        });
    }
};

window.onkeyup = function(event) {
    if(event.keyCode === 27) {
        jsonRequest("POST", "/action/close");
    }
};
