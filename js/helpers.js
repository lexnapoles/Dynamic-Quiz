function fragmentFromString(strHTML) {
    "use strict";
    var temp = document.createElement('template');
    temp.innerHTML = strHTML;
    return temp.content;
}

var createHTMLFromTemplate = function (fileName, directory, args) {
    "use strict";
    var compiledTemplate = Handlebars.getTemplate(fileName, directory);
    return compiledTemplate(args);
};