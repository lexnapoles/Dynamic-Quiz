Handlebars.getTemplate = function(name, folder) {
    "use strict";
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
        $.ajax({
            url : folder + '/' + name + '.hbs',
            success : function(data) {
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {};
                }
                Handlebars.templates[name] = Handlebars.compile(data);
            },
            async : false
        });
    }
    return Handlebars.templates[name];
};

Handlebars.registerHelper("quizActiveIfFirstQuiz", function(id) {
    "use strict";
    if (id === 1) {
        return "in active";
    }
    return "";
});

Handlebars.registerHelper("tabActiveIfFirstQuiz", function(id) {
    "use strict";
    if (id === 1) {
        return "class='active'";
    }
    return "";
});

