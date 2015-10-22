var logInForm = document.getElementsByClassName("logInForm")[0],
    logOutForm = document.getElementsByClassName("logOutForm")[0],
    questionDiv = document.getElementsByClassName("question")[0],
    questionsForm = document.getElementsByClassName("questionsForm")[0],
    choicesList = document.getElementsByClassName("choicesList")[0];

var clearNodeChilds = function (node) {
    "use strict";

    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
};

var Constants = {
    SCORE_TITLE:            "Score",
    USERNAME:               "username",
    JSON_FILE:              "Q&A.json",
    Messages: {
        PICK_CHOICE_MSG:    "To proceed further, please pick a choice",
        FIRST_QUESTION:     "This is the first question",
        SCORE_MSG:          "Your final score is:",
        HELLO_MSG:          "Hello"
    }
};

function Question (obj) {
    "use strict";

    var question,
        choices,
        correctAnswer;

    if (obj !== null) {

        question = obj.question;
        choices = obj.choices;
        correctAnswer = obj.correctAnswer;
    }

    this.getQuestion = function () {
        return question;
    };

    this.getChoices = function () {
        return choices;
    };

    this.isCorrectChoice = function (choice) {
        return choice === correctAnswer;
    };
}

var Questionnaire = function () {
    "use strict";

    var fillChoices = function (choicesList, choices) {

        for (var i = 0; i < choices.length; i++) {

            var li = document.createElement("LI"),
                input = document.createElement("INPUT");

            input.type = "radio";
            input.name = "choice";

            li.appendChild(input);

            var text = document.createTextNode(choices[i]);
            li.appendChild(text);
            choicesList.appendChild(li);
        }
    };

    var fillQuestion = function (text) {

        var label = document.createElement("LABEL"),
            questionText = document.createTextNode(text);

        label.appendChild(questionText);

        questionDiv.appendChild(label);
    };

    return {
        fillQuestionnaire: function (question) {

            clearNodeChilds(questionDiv);
            clearNodeChilds(choicesList);

            fillQuestion(question.getQuestion());
            fillChoices(choicesList, question.getChoices());
        },

        setUserAnswer: function (answer) {

            if (answer < questionsForm.elements.length) {
                questionsForm.elements[answer].checked = true;
            }
        }
    };
}();

function Score() {
    "use strict";
    var score = 0;

    var changeTitle = function () {

        var title = document.getElementsByClassName("title")[0].firstChild;
        title.text = "Score";
    };


    this.increaseScore = function () {
        score++;
    };

    this.decreaseScore = function () {
        if (score > 0) {
            score--;
        }
    };

    this.showScore = function () {

        changeTitle();

        questionsForm.onsubmit = null;
        var main = document.getElementsByClassName("questionnarie")[0];
        clearNodeChilds(main);

        var scoreMsg = Constants.Messages.SCORE_MSG + " " + score;

        var h3 = document.createElement("H3");
        h3.className = "score";

        var text = document.createTextNode(scoreMsg);

        h3.appendChild(text);
        main.appendChild(h3);
    };
}

function QuestionsAndAnswers(jsonFile) {
    "use strict";

    var questions = [],
        currentQuestion = -1;

    this.loadQuestions = function () {

        return $.getJSON(jsonFile, function (data) {

            $.each(data, function (i) {
                questions[questions.length] = new Question(data[i]);
            });
        });
    }();

    this.next = function () {
        currentQuestion++;
        return questions[currentQuestion];
    };

    this.previous = function () {
        currentQuestion--;
        return questions[currentQuestion];

    };

    this.noMoreQuestions = function () {
        return currentQuestion >= questions.length - 1;
    };

    this.index = function () {
        return currentQuestion;
    };

    this.isFirstQuestion = function () {
        return currentQuestion === 0;
    };

    this.isCorrectChoice = function (choice) {
        return questions[currentQuestion].isCorrectChoice(choice);
    };
}

var Log = function () {
    "use strict";

    var logged = false;

    return {

        logIn: function (username, password) {

            var user = localStorage.getItem(Constants.USERNAME);
            if (user === null) {
                localStorage.setItem(Constants.USERNAME, username);
                localStorage.setItem(username, password);

                logged = true;
            }
            else if (user === username) {
                logged = true;
            }
        },

        logOut: function () {
            logged = false;
        },

        isUserLoggedIn: function () {
            return logged;
        },

        userAlreadyExists: function () {
            return localStorage.length;
        },

        logExistingUser: function () {
            logged = true;
            return localStorage.getItem(Constants.USERNAME);
        },

        deleteUsers: function () {
            localStorage.clear();
        }
    };
}();


var Application = function () {
    "use strict";

    var questions = new QuestionsAndAnswers(Constants.JSON_FILE),
        userAnswers = [],
        score = new Score();

    var getChoiceChecked = function (form) {

        var choices = form.elements;

        for (var i = 0, len = choices.length; i < len; i++) {

            if (choices[i].checked) {

                return i;
            }
        }
        return -1;
    };

    var userPreviouslyAnswered = function () {
        return questions.index() < userAnswers.length;
    };

    var saveUserAnswer = function (answer) {
        if (userPreviouslyAnswered()) {
            userAnswers[questions.index()] = answer;
        }
        else {
            userAnswers[userAnswers.length] = answer;
        }
    };

    var getUserAnswer = function () {
        return userAnswers[questions.index()];
    };

    var nextQuestion = function () {

        Questionnaire.fillQuestionnaire(questions.next());

        if (userPreviouslyAnswered()) {
            Questionnaire.setUserAnswer(getUserAnswer());
        }
    };

    var previousQuestion = function () {
        Questionnaire.fillQuestionnaire(questions.previous());
        Questionnaire.setUserAnswer(getUserAnswer());
    };

    var nextQuestionHandler = function (event) {

        event.preventDefault();

        var choiceChecked = getChoiceChecked(questionsForm);

        if (choiceChecked >= 0) {

            saveUserAnswer(choiceChecked);

            if (questions.isCorrectChoice(choiceChecked)) {
                score.increaseScore();
            }

            if (!questions.noMoreQuestions()) {

                var QA = $(".QA");

                QA.fadeTo("fast", 0, nextQuestion);

                QA.fadeTo("fast", 1);
            }
            else {
                score.showScore();
            }
        }
        else {
            window.alert(Constants.Messages.PICK_CHOICE_MSG);
        }
    };

    var previousQuestionHandler = function (event) {

        var target = event.target;

        if (target.className === "backBtn") {

            if (!questions.isFirstQuestion()) {

                var QA = $(".QA");

                QA.fadeTo("fast", 0, previousQuestion);

                QA.fadeTo("fast", 1);

                score.decreaseScore();
            }
            else {
                window.alert(Constants.Messages.FIRST_QUESTION);
            }
        }
    };

    var defaultValueOff = function (event) {

        var target = event.target;

        if (target.className === "username" || target.className === "password") {
            target.value = "";
        }
    };

    var defaultValueOnIfNoValue = function (event) {

        var target = event.target;

        if (target.value === "") {

            if (target.className === "username") {
                target.value = "username";
            }
            else if (target.className === "password") {
                target.value = "password";
            }
        }
    };

    var getUsernameAndPassword = function () {

        var info = [],
            field = logInForm.elements;

        for (var i = 0, len = field.length; i < len; i++) {
            if (field[i].type !== "submit") {
                info[info.length] = field[i].value;
            }
        }
        return info;
    };

    var writeUserWelcomeMessage = function (username) {

        var paragraph = document.createElement("P"),
            text = document.createTextNode(Constants.message.HELLO_MSG + ", " + username);

        paragraph.appendChild(text);

        var userMessageDiv = document.getElementsByClassName("userMessage")[0];
        userMessageDiv.appendChild(paragraph);
    };

    var loadLogOutForm = function (username) {

        $(".logInForm").hide();

        writeUserWelcomeMessage(username);

        $(".logOutForm").show();
    };

    var logInFormInputvaluesToDefault = function () {
        logInForm.elements[0].value = "username";
        logInForm.elements[1].value = "password";
    };

    var logInFormHasNoDefaultValues = function () {
        return logInForm.elements[0].value !== "username";
    };

    var loadLogInForm = function () {

        $(".logOutForm").hide();

        logInFormInputvaluesToDefault();

        $(".logInForm").show();
    };

    var noRememberIsChecked = function () {
        var noRemember = logInForm.elements[2];
        return noRemember.checked;
    };

    var logInHandler = function (event) {

        event.preventDefault();

        if (!Log.isUserLoggedIn() && logInFormHasNoDefaultValues()) {

            var userInfo = getUsernameAndPassword();

            Log.logIn.apply(this, userInfo);
            var username = userInfo[0];

            if (noRememberIsChecked()) {
                window.addEventListener("unload", function () {
                    Log.deleteUsers();
                }, false);
            }

            loadLogOutForm(username);
        }
    };

    var logOutHandler = function (event) {

        event.preventDefault();

        Log.logOut();

        var userMessageDiv = document.getElementsByClassName("userMessage")[0];
        clearNodeChilds(userMessageDiv);

        loadLogInForm();
    };

    return {
        startQuiz: function () {

            questions.loadQuestions.done(function () {

                if (Log.userAlreadyExists()) {
                    var username = Log.logExistingUser();
                    loadLogOutForm(username);
                }

                nextQuestion();

                questionsForm.addEventListener("click", previousQuestionHandler, false);
                questionsForm.addEventListener("submit", nextQuestionHandler, false);

                logInForm.addEventListener("submit", logInHandler, false);
                logInForm.addEventListener("click", defaultValueOff, false);
                logInForm.addEventListener("mouseout", defaultValueOnIfNoValue, false);

                logOutForm.addEventListener("submit", logOutHandler, false);
            });
        }
    };
}();

Application.startQuiz();


