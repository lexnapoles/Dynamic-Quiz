function fragmentFromString(strHTML) {
    "use strict";
    var temp = document.createElement('template');
    temp.innerHTML = strHTML;
    return temp.content;
}
