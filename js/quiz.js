var DynamicQuiz = {};
DynamicQuiz.Constants = {};
DynamicQuiz.QuizElements = {};
DynamicQuiz.LogElements = {};
DynamicQuiz.App = {};

DynamicQuiz.Constants = {
    SCORE_TITLE: "Score",
    USERNAME: "username",
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
            logOutForm = doc.getElementsByClassName("logOutForm")[0];

        return {
            LogInForm: logInForm,
            LogOutForm: logOutForm
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

DynamicQuiz.QuizElements.Score.prototype.showScore = function (quizLocation) {
    "use strict";

    var main = quizLocation.Questionnaire,
        scoreMsg = DynamicQuiz.Constants.Messages.SCORE_MSG + " " + this.score,
        html = "<h3 class='score'>" + scoreMsg + "</h3>";

    var QuestionsForm = quizLocation.QuestionsForm;

    QuestionsForm.onsubmit = null;
    QuestionsForm.onclick = null;

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

    var fillQuestion = function (text, questionDiv) {
        questionDiv.innerHTML = "<label>" + text + "</label>";
    };

    return {
        fillQuestionnaire: function (question, quizLocation) {

            fillQuestion(question.getQuestion(), quizLocation.QuestionDiv);

            fillChoices(quizLocation.ChoicesList, question.getChoices());
        },

        setUserAnswer: function (answer, quizLocation) {

            if (answer < quizLocation.ChoicesList.children.length) {
                quizLocation.QuestionsForm.elements[answer].checked = true;
            }
        }
    };
}();

DynamicQuiz.QuizElements.Quiz = function (jsonFile) {
    "use strict";
    this.questions = new DynamicQuiz.QuizElements.QuestionsAndAnswers(jsonFile);
    this.userAnswers = [];
    this.score = new DynamicQuiz.QuizElements.Score();
    this.quizLocation = {};
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

    DynamicQuiz.QuizElements.Questionnaire.fillQuestionnaire(this.questions.next(), this.quizLocation);

    if (this.userPreviouslyAnswered()) {
        DynamicQuiz.QuizElements.Questionnaire.setUserAnswer(this.getUserAnswer(), this.quizLocation);
    }

};

DynamicQuiz.QuizElements.Quiz.prototype.previousQuestion = function () {
    "use strict";
    DynamicQuiz.QuizElements.Questionnaire.fillQuestionnaire(this.questions.previous(), this.quizLocation) ;
    DynamicQuiz.QuizElements.Questionnaire.setUserAnswer(this.getUserAnswer(), this.quizLocation);
};

DynamicQuiz.QuizElements.Quiz.prototype.goToNextQuestion = function () {
    "use strict";

    var choiceChecked = this.getChoiceChecked(this.quizLocation.QuestionsForm);

    if (choiceChecked >= 0) {

        this.saveUserAnswer(choiceChecked);

        if (this.questions.isCorrectChoice(choiceChecked)) {
            this.score.increaseScore();
        }

        if (!this.questions.noMoreQuestions()) {

            var QA = $(this.quizLocation.QADiv);

            QA.fadeTo("fast", 0, this.nextQuestion.bind(this));

            QA.fadeTo("fast", 1);
        }
        else {
            this.score.showScore(this.quizLocation);
        }
    }
    else {
        window.alert(DynamicQuiz.Constants.Messages.PICK_CHOICE_MSG);
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.goToPreviousQuestion = function () {
    "use strict";
    if (!this.questions.isFirstQuestion()) {

        var QA = $(this.quizLocation.QADiv);

        QA.fadeTo("fast", 0,  this.previousQuestion.bind(this));

        QA.fadeTo("fast", 1);

        this.score.decreaseScore();
    }
    else {
        window.alert(DynamicQuiz.Constants.Messages.FIRST_QUESTION);
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.setLocation = function(questionnaire, qaDiv, questionsForm, questionDiv, choicesList) {
    "use strict";

    this.quizLocation =  {
        Questionnaire: questionnaire,
        QADiv: qaDiv,
        QuestionsForm: questionsForm,
        QuestionDiv: questionDiv,
        ChoicesList: choicesList
    };
};


DynamicQuiz.QuizElements.Quiz.prototype.getQuestionnaire = function () {
    "use strict";
    return this.quizLocation.Questionnaire;
};

DynamicQuiz.QuizElements.Quiz.prototype.getQADiv = function () {
    "use strict";
    return this.quizLocation.QADiv;
};

DynamicQuiz.QuizElements.Quiz.prototype.getQuestionsForm = function () {
    "use strict";
    return this.quizLocation.QuestionsForm;
};

DynamicQuiz.QuizElements.Quiz.prototype.getQuestionDiv = function () {
    "use strict";
    return this.quizLocation.QuestionDiv;
};

DynamicQuiz.QuizElements.Quiz.prototype.getChoicesList = function () {
    "use strict";
    return this.quizLocation.ChoicesList;
};

DynamicQuiz.QuizElements.Quiz.prototype.noLocation = function () {
    "use strict";
    return Object.keys(this.quizLocation).length === 0;
};

DynamicQuiz.QuizElements.Quiz.prototype.loadQuestions = function() {
    "use strict";
    return this.questions.loadQuestions();

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



DynamicQuiz.LogElements.Log = function () {
    "use strict";
    var logged = false;

    var logIn = function (username, password) {

        var user = localStorage.getItem(DynamicQuiz.Constants.USERNAME);
        if (user === username) {
            logged = true;
        }
        else {
            localStorage.setItem(DynamicQuiz.Constants.USERNAME, username);
            localStorage.setItem(username, password);

            logged = true;
        }
    };

    var logOut = function () {
        logged = false;
        localStorage.clear();
    };

    var isUserLoggedIn = function () {
        return logged;
    };

    var userAlreadyExists = function () {
        return localStorage.length;
    };

    var logExistingUser = function () {
        logged = true;
        return localStorage.getItem(DynamicQuiz.Constants.USERNAME);
    };

    var deleteUsers = function () {
        localStorage.clear();
    };

    var noRememberIsChecked = function () {
        var noRemember = DynamicQuiz.Constants.DOMLookups.LogInForm.elements[2];
        return noRemember.checked;
    };

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

    var loadLogOutForm = function (username) {

        $(".logInForm").hide();

        writeUserWelcomeMessage(username);

        $(".logOutForm").show();
    };

    return {

        logUserIfWasAlreadyLoggedBefore: function () {

            if (userAlreadyExists()) {
                var username = logExistingUser();
                loadLogOutForm(username);
            }
        },

        logInUser: function () {

            if (!isUserLoggedIn() && logInFormHasNoDefaultValues()) {

                var userInfo = getUsernameAndPassword();

                logIn.apply(null, userInfo);
                var username = userInfo[0];

                if (noRememberIsChecked()) {
                    window.addEventListener("unload", function () { deleteUsers(); }, false);
                }

                loadLogOutForm(username);
            }
        },

        logOutUser: function () {

            logOut();

            loadLogInForm();
        }
    };
}();

DynamicQuiz.App = function () {
    "use strict";

    var quizzes = [];
    var currentQuiz;

    var createTabHTML = function () {

        var fragment = document.createDocumentFragment(),
            quizId = quizzes.length;

        var compiledTabTemplate = Handlebars.getTemplate("tab", "static/templates");

        fragment = fragmentFromString(compiledTabTemplate(quizId));

        return fragment;
    };

    var addQuizTab = function() {

        var quizzesList = document.getElementsByClassName("quizzesList")[0];

        var tab = createTabHTML();

        quizzesList.appendChild(tab);
    };

    var setQuizLocation = function (quiz) {

        var doc = document,
            questionnaire = doc.querySelectorAll(".questionnaire")[quizzes.length-1],
            qaDiv = doc.querySelectorAll(".QA")[quizzes.length-1],
            questionsForm = doc.querySelectorAll(".questionsForm")[quizzes.length-1],
            questionDiv = doc.querySelectorAll(".question")[quizzes.length-1],
            choicesList = doc.querySelectorAll(".choicesList")[quizzes.length-1];

        quiz.setLocation(questionnaire, qaDiv, questionsForm, questionDiv, choicesList);
    };


    var createQuizHTML = function () {

        var fragment = document.createDocumentFragment(),
            quizId = quizzes.length;

        var compiledQuizTemplate = Handlebars.getTemplate("quiz", "static/templates");

        fragment = fragmentFromString(compiledQuizTemplate(quizId));

        return fragment;
    };

    var addQuizToPage = function () {

        var quiz = createQuizHTML();
        document.getElementsByClassName("quizzes")[0].appendChild(quiz);
    };

    var addEventsToQuiz = function (quiz) {

        var questionsForm = quiz.getQuestionsForm();

        questionsForm.addEventListener("click", previousQuestionHandler, false);
        questionsForm.addEventListener("submit", nextQuestionHandler, false);
    };

    var getIndexFromQuizId = function (quizId) {
        return parseInt(quizId.slice(-1)) - 1;
    };

    var changeCurrentQuiz = function (quizId) {
        var index = getIndexFromQuizId(quizId);
        currentQuiz = quizzes[index];
    };


    var loadQuiz = function (quiz) {
        quiz.loadQuestions().done(function () {
            quiz.nextQuestion();
        });
    };

    var logInHandler = function (event) {

        event.preventDefault();

        DynamicQuiz.LogElements.Log.logInUser();
    };

    var logOutHandler = function (event) {

        event.preventDefault();

        DynamicQuiz.LogElements.Log.logOutUser();
    };

    var previousQuestionHandler = function (event) {

        var target = event.target;

        if (target.className.search(/backBtn/) > -1 ) {

            currentQuiz.goToPreviousQuestion();
        }
    };

    var nextQuestionHandler = function (event) {

        event.preventDefault();

        currentQuiz.goToNextQuestion();

    };

    var addLogEvents = function () {

        DynamicQuiz.Constants.DOMLookups.LogInForm.addEventListener("submit", logInHandler, false);
        DynamicQuiz.Constants.DOMLookups.LogOutForm.addEventListener("submit", logOutHandler, false);
    };

    var addTabEvents = function () {

        $('a[data-toggle="tab"]').on('hide.bs.tab', function (e) {

            var quizId = $(e.relatedTarget).attr("href");

            changeCurrentQuiz(quizId);
        });
    };

    var addEvents = function () {
        addLogEvents();
        addTabEvents();
    };

    return {
        startApplication: function  () {

            DynamicQuiz.LogElements.Log.logUserIfWasAlreadyLoggedBefore();

            addEvents();
        },

        addQuiz: function(quiz) {

            if (quiz !== null) {
                quizzes.push(quiz);

                if (quizzes.length === 1) {
                    currentQuiz = quizzes[0];
                }
            }

            addQuizTab();
            addQuizToPage();
            setQuizLocation(quiz);
            addEventsToQuiz(quiz);

            loadQuiz(quiz);
        }
    };
}();

var quiz = new DynamicQuiz.QuizElements.Quiz("Q&A.json");
DynamicQuiz.App.addQuiz(quiz);

var quiz2 = new DynamicQuiz.QuizElements.Quiz("Q&A2.json");
DynamicQuiz.App.addQuiz(quiz2);

DynamicQuiz.App.startApplication();
