var DynamicQuiz = {};
DynamicQuiz.Constants = {};
DynamicQuiz.QuizElements = {};
DynamicQuiz.LogElements = {};
DynamicQuiz.App = {};

DynamicQuiz.Constants = {
    SCORE_TITLE: "Score",
    USERNAME: "username",
    JSON_FILE: "Q&A.json",
    Messages: {
        PICK_CHOICE_MSG: "To proceed further, please pick a choice",
        FIRST_QUESTION: "This is the first question",
        SCORE_MSG: "Your final score is:",
        HELLO_MSG: "Hello"
    },
    DOMLookups: function () {
        "use strict";
        var doc = document,
            logInForm = doc.getElementsByClassName("logInForm")[0],
            logOutForm = doc.getElementsByClassName("logOutForm")[0],
            questionDiv = doc.getElementsByClassName("question")[0],
            questionsForm = doc.getElementsByClassName("questionsForm")[0],
            choicesList = doc.getElementsByClassName("choicesList")[0];

        return {
            LogInForm: logInForm,
            LogOutForm: logOutForm,
            QuestionDiv: questionDiv,
            QuestionsForm: questionsForm,
            ChoicesList: choicesList
        };
    }()
};

DynamicQuiz.QuizElements.Question =  function (obj) {
    "use strict";
    this.question = [];
    this.choices = [];
    this.correctAnswer = -1;

    if (obj !== null) {

        this.question = obj.question;
        this.choices = obj.choices;
        this.correctAnswer = obj.correctAnswer;
    }
};

DynamicQuiz.QuizElements.Question.prototype.getQuestion = function () {
    "use strict";
    return this.question;
};

DynamicQuiz.QuizElements.Question.prototype.getChoices = function () {
    "use strict";
    return this.choices;
};

DynamicQuiz.QuizElements.Question.prototype.isCorrectChoice = function (choice) {
    "use strict";
    return choice === this.correctAnswer;
};

DynamicQuiz.QuizElements.Score = function () {
    "use strict";
    this.score = 0;
};

DynamicQuiz.QuizElements.Score.prototype.changeTitle = function () {
    "use strict";
    var title = document.getElementsByClassName("title")[0].firstChild;
    title.text = "Score";
};

DynamicQuiz.QuizElements.Score.prototype.increaseScore = function () {
    "use strict";
    this.score++;
};

DynamicQuiz.QuizElements.Score.prototype.decreaseScore = function () {
    "use strict";
    if (this.score > 0) {
        this.score--;
    }
};

DynamicQuiz.QuizElements.Score.prototype.showScore = function () {
    "use strict";

    this.changeTitle();

    var main = document.getElementsByClassName("questionnaire")[0],
        scoreMsg = DynamicQuiz.Constants.Messages.SCORE_MSG + " " + this.score,
        html = "<h3 class='score'>" + scoreMsg + "</h3>";

    DynamicQuiz.Constants.DOMLookups.QuestionsForm.onsubmit = null;
    DynamicQuiz.Constants.DOMLookups.QuestionsForm.onclick = null;

    main.innerHTML = html;
};


DynamicQuiz.QuizElements.Questionnaire = function () {
    "use strict";
    var fillChoices = function (choicesList, choices) {

        var html = "";

        for (var i = 0, len = choices.length; i < len; i++) {
            html += "<li><input type='radio' name='choice'>" + choices[i] + "</li>";
        }

        choicesList.innerHTML = html;
    };

    var fillQuestion = function (text) {

        var html = "<label>" + text + "</label>";

        DynamicQuiz.Constants.DOMLookups.QuestionDiv.innerHTML = html;
    };

    return {
        fillQuestionnaire: function (question) {
            fillQuestion(question.getQuestion());
            fillChoices(DynamicQuiz.Constants.DOMLookups.ChoicesList, question.getChoices());
        },

        setUserAnswer: function (answer) {

            if (answer < DynamicQuiz.Constants.DOMLookups.QuestionsForm.elements.length) {
                DynamicQuiz.Constants.DOMLookups.QuestionsForm.elements[answer].checked = true;
            }
        }
    };
}();



DynamicQuiz.QuizElements.Quiz = function () {
    "use strict";
    this.questions = new DynamicQuiz.QuizElements.QuestionsAndAnswers(DynamicQuiz.Constants.JSON_FILE);
    this.userAnswers = [];
    this.score = new DynamicQuiz.QuizElements.Score();
};



DynamicQuiz.QuizElements.Quiz.prototype.getChoiceChecked = function (form) {
    "use strict";
    var choices = form.elements;

    for (var i = 0, len = choices.length; i < len; i++) {

        if (choices[i].checked) {

            return i;
        }
    }
    return -1;
};

DynamicQuiz.QuizElements.QuestionsAndAnswers = function(jsonFile) {
    "use strict";
    this.questions = [];
    this.currentQuestion = -1;
    this.jsonFile = jsonFile;
};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.loadQuestions = function () {
    "use strict";
    var that = this;
    return $.getJSON(that.jsonFile, function (data) {
        $.each(data, function (i) {
            that.questions[that.questions.length] = new DynamicQuiz.QuizElements.Question(data[i]);
        });
    });
};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.next = function () {
    "use strict";
    this.currentQuestion++;
    return this.questions[this.currentQuestion];
};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.previous = function () {
    "use strict";
    this.currentQuestion--;
    return this.questions[this.currentQuestion];

};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.noMoreQuestions = function () {
    "use strict";
    return this.currentQuestion >= this.questions.length - 1;
};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.index = function () {
    "use strict";
    return this.currentQuestion;
};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.isFirstQuestion = function () {
    "use strict";
    return this.currentQuestion === 0;
};

DynamicQuiz.QuizElements.QuestionsAndAnswers.prototype.isCorrectChoice = function (choice) {
    "use strict";
    return this.questions[this.currentQuestion].isCorrectChoice(choice);
};


DynamicQuiz.QuizElements.Quiz.prototype.userPreviouslyAnswered = function () {
    "use strict";
    return this.questions.index() < this.userAnswers.length;
};

DynamicQuiz.QuizElements.Quiz.prototype.saveUserAnswer = function (answer) {
    "use strict";
    if (this.userPreviouslyAnswered()) {
        this.userAnswers[this.questions.index()] = answer;
    }
    else {
        this.userAnswers[this.userAnswers.length] = answer;
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.getUserAnswer = function () {
    "use strict";
    return this.userAnswers[this.questions.index()];
};

DynamicQuiz.QuizElements.Quiz.prototype.nextQuestion = function () {
    "use strict";
    DynamicQuiz.QuizElements.Questionnaire.fillQuestionnaire(this.questions.next());

    if (this.userPreviouslyAnswered()) {
        DynamicQuiz.QuizElements.Questionnaire.setUserAnswer(this.getUserAnswer());
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.previousQuestion = function () {
    "use strict";
    DynamicQuiz.QuizElements.Questionnaire.fillQuestionnaire(this.questions.previous());
    DynamicQuiz.QuizElements.Questionnaire.setUserAnswer(this.getUserAnswer());
};

DynamicQuiz.QuizElements.Quiz.prototype.goToNextQuestion = function () {
    "use strict";
    var choiceChecked = this.getChoiceChecked(DynamicQuiz.Constants.DOMLookups.QuestionsForm);

    if (choiceChecked >= 0) {

        this.saveUserAnswer(choiceChecked);

        if (this.questions.isCorrectChoice(choiceChecked)) {
            this.score.increaseScore();
        }

        if (!this.questions.noMoreQuestions()) {

            var QA = $(".QA");

            QA.fadeTo("fast", 0, this.nextQuestion.bind(this));

            QA.fadeTo("fast", 1);
        }
        else {
            this.score.showScore();
        }
    }
    else {
        window.alert(DynamicQuiz.Constants.Messages.PICK_CHOICE_MSG);
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.goToPreviousQuestion = function () {
    "use strict";
    if (!this.questions.isFirstQuestion()) {

        var QA = $(".QA");

        QA.fadeTo("fast", 0,  this.previousQuestion.bind(this));

        QA.fadeTo("fast", 1);

        this.score.decreaseScore();
    }
    else {
        window.alert(DynamicQuiz.Constants.Messages.FIRST_QUESTION);
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.loadQuestions = function() {
    "use strict";
    return this.questions.loadQuestions();

};

DynamicQuiz.LogElements.Log = function () {
    "use strict";
    var logged = false;

    return {
        logIn: function (username, password) {

            var user = localStorage.getItem(DynamicQuiz.Constants.USERNAME);
            if (user === username) {
                logged = true;
            }
            else {
                localStorage.setItem(DynamicQuiz.Constants.USERNAME, username);
                localStorage.setItem(username, password);

                logged = true;
            }
        },

        logOut: function () {
            logged = false;
            localStorage.clear();
        },

        isUserLoggedIn: function () {
            return logged;
        },

        userAlreadyExists: function () {
            return localStorage.length;
        },

        logExistingUser: function () {
            logged = true;
            return localStorage.getItem(DynamicQuiz.Constants.USERNAME);
        },

        deleteUsers: function () {
            localStorage.clear();
        }
    };
}();

DynamicQuiz.App = function () {
    "use strict";

    var quizzes = [];
    quizzes.push(new DynamicQuiz.QuizElements.Quiz());
    var quiz = quizzes[0];

    var getUsernameAndPassword = function () {

        var info = [],
            field = DynamicQuiz.Constants.DOMLookups.LogInForm.elements;

        for (var i = 0, len = field.length; i < len; i++) {
            if (field[i].type !== "submit") {
                info[info.length] = field[i].value;
            }
        }
        return info;
    };

    var writeUserWelcomeMessage = function (username) {

        var doc = document;

        var html = "<p>" + DynamicQuiz.Constants.Messages.HELLO_MSG + ", " + username + "</p>";

        var userMessageDiv = doc.getElementsByClassName("userMessage")[0];
        userMessageDiv.innerHTML = html;
    };

    var loadLogOutForm = function (username) {

        $(".logInForm").hide();

        writeUserWelcomeMessage(username);

        $(".logOutForm").show();
    };

    var logInFormInputValuesToDefault = function () {
        DynamicQuiz.Constants.DOMLookups.LogInForm.elements[0].value = "";
        DynamicQuiz.Constants.DOMLookups.LogInForm.elements[1].value = "";
    };

    var logInFormHasNoDefaultValues = function () {
        return DynamicQuiz.Constants.DOMLookups.LogInForm.elements[0].value !== DynamicQuiz.Constants.USERNAME;
    };

    var loadLogInForm = function () {

        $(".logOutForm").hide();

        logInFormInputValuesToDefault();

        $(".logInForm").show();
    };

    var noRememberIsChecked = function () {
        var noRemember = DynamicQuiz.Constants.DOMLookups.LogInForm.elements[2];
        return noRemember.checked;
    };

    var LogInUser = function () {

        if (!DynamicQuiz.LogElements.Log.isUserLoggedIn() && logInFormHasNoDefaultValues()) {

            var userInfo = getUsernameAndPassword();

            DynamicQuiz.LogElements.Log.logIn.apply(null, userInfo);
            var username = userInfo[0];

            if (noRememberIsChecked()) {
                window.addEventListener("unload", function () {
                    DynamicQuiz.LogElements.Log.deleteUsers();
                }, false);
            }

            loadLogOutForm(username);
        }
    };

    var logOutUser = function () {

        DynamicQuiz.LogElements.Log.logOut();

        loadLogInForm();
    };


    var logInHandler = function (event) {

        event.preventDefault();

        LogInUser();
    };

    var logOutHandler = function (event) {

        event.preventDefault();

        logOutUser();
    };

    var previousQuestionHandler = function (event) {

        var target = event.target;

        if (target.className.search(/backBtn/) > -1 ) {
            quiz.goToPreviousQuestion();
        }
    };

    var nextQuestionHandler = function (event) {

        event.preventDefault();

        quiz.goToNextQuestion();
    };

    return {
        startApplication: function () {

            quiz.loadQuestions().done(function () {

                if (DynamicQuiz.LogElements.Log.userAlreadyExists()) {
                    var username = DynamicQuiz.LogElements.Log.logExistingUser();
                    loadLogOutForm(username);
                }

                quiz.nextQuestion();

                DynamicQuiz.Constants.DOMLookups.QuestionsForm.addEventListener("click", previousQuestionHandler, false);
                DynamicQuiz.Constants.DOMLookups.QuestionsForm.addEventListener("submit", nextQuestionHandler, false);

                DynamicQuiz.Constants.DOMLookups.LogInForm.addEventListener("submit", logInHandler, false);

                DynamicQuiz.Constants.DOMLookups.LogOutForm.addEventListener("submit", logOutHandler, false);
            });
        },

        addQuiz: function(quiz) {

            if (quiz !== null) {
                quizzes.push(quiz);
            }
        }
    };
}();

DynamicQuiz.App.startApplication();


