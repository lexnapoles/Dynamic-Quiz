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

    var QuestionsForm = document.getElementsByClassName("questionsForm")[0];

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


            fillQuestion(question.getQuestion(), quizLocation.questionDiv);

            fillChoices(quizLocation.choicesList, question.getChoices());
        },

        setUserAnswer: function (answer, quizLocation) {

            if (answer < quizLocation.questionDiv.elements.length) {
                quizLocation.questionsForm.elements[answer].checked = true;
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
        DynamicQuiz.QuizElements.Questionnaire.setUserAnswer(this.getUserAnswer());
    }
};

DynamicQuiz.QuizElements.Quiz.prototype.previousQuestion = function () {
    "use strict";
    DynamicQuiz.QuizElements.Questionnaire.fillQuestionnaire(this.questions.previous(), this.quizLocation) ;
    DynamicQuiz.QuizElements.Questionnaire.setUserAnswer(this.getUserAnswer(), this.quizLocation);
};

DynamicQuiz.QuizElements.Quiz.prototype.goToNextQuestion = function () {
    "use strict";

    var QuestionsForm = document.getElementsByClassName("questionsForm")[0];

    var choiceChecked = this.getChoiceChecked(QuestionsForm);

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

DynamicQuiz.QuizElements.Quiz.prototype.setLocation = function(questionsForm, questionDiv, choicesList) {
    "use strict";

    var location = {
        questionsForm: questionsForm,
        questionDiv: questionDiv,
        choicesList: choicesList
    };

    this.quizLocation = location;
};

DynamicQuiz.QuizElements.Quiz.prototype.getQuestionsForm = function () {
    "use strict";
    return this.quizLocation.questionsForm;
};

DynamicQuiz.QuizElements.Quiz.prototype.getQuestionDiv = function () {
    "use strict";
    return this.quizLocation.questionDiv;
};

DynamicQuiz.QuizElements.Quiz.prototype.getChoicesList = function () {
    "use strict";
    return this.quizLocation.choicesList;
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
    var currentQuiz;

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
            currentQuiz.goToPreviousQuestion();
        }
    };

    var nextQuestionHandler = function (event) {

        event.preventDefault();

        currentQuiz.goToNextQuestion();
    };

    var addQuizTab = function() {

        var doc = document,
            quizzesList = doc.getElementsByClassName("quizzesList")[0],
            fragment = doc.createDocumentFragment(),
            quizNumber =  quizzes.length,
            html = "",
            liElement = doc.createElement("LI");

        liElement.setAttribute("role", "presentation");

        if (quizzes.length === 1) {
            liElement.setAttribute("class", "active");
        }

        window.alert(html);

        html +=  "<a href='#quiz" + quizNumber + "' " + "data-toggle='tab'>Quiz " + quizNumber + "</a></li>";

        window.alert(html);

        liElement.innerHTML = html;
        fragment.appendChild(liElement);
        quizzesList.appendChild(fragment);

        window.alert(quizzesList.innerHTML);
    };

    var setQuizLocation = function (quiz) {

        var doc = document,
            questionsForm = doc.querySelectorAll(".questionsForm")[quizzes.length-1],
            questionDiv = doc.querySelectorAll(".question")[quizzes.length-1],
            choicesList = doc.querySelectorAll(".choicesList")[[quizzes.length-1]];

        quiz.setLocation(questionsForm, questionDiv, choicesList);

    };


    var addQuizToHTML = function () {

        var doc = document,
            fragment = doc.createDocumentFragment(),
            div = doc.createElement("DIV"),
            id = "quiz" + quizzes.length + "' ",
            html = "";

        div.setAttribute("role", "tabpanel");
        div.setAttribute("id", id);

        if (quizzes.length === 1) {
            div.setAttribute("class", "quiz tab-pane fade in active");
        }
        else {
            div.setAttribute("class", "quiz tab-pane fade");
        }

        html += "<main class='questionnaire col-sm-8 col-md-8'>" +
                "<div class='QA'>" +
                "<div class='question'></div>" +
                "<form class='questionsForm form-horizontal'>" +
                "<div class='choices form-group'><ul class='choicesList text-center'></ul></div>" +
                "<div class='buttons text-center form-group'>" +
                "<button type='button' class='backBtn btn btn-default'>Back</button>" +
                "<button type='submit' class='nextBtn btn btn-default'>Next</button>" +
                "</div></form></div></main></div>";

        div.innerHTML = html;
        fragment.appendChild(div);

        doc.getElementsByClassName("quizzes")[0].appendChild(fragment);
    };

    var addEventsToQuiz = function (quiz) {

        var questionsForm = quiz.getQuestionsForm();

        questionsForm.addEventListener("click", previousQuestionHandler, false);
        questionsForm.addEventListener("submit", nextQuestionHandler, false);
    };

    return {
        startApplication: function () {

            if (DynamicQuiz.LogElements.Log.userAlreadyExists()) {
                var username = DynamicQuiz.LogElements.Log.logExistingUser();
                loadLogOutForm(username);
            }

            DynamicQuiz.Constants.DOMLookups.LogInForm.addEventListener("submit", logInHandler, false);

            DynamicQuiz.Constants.DOMLookups.LogOutForm.addEventListener("submit", logOutHandler, false);

            if (quizzes.length) {
                currentQuiz.loadQuestions().done(function () {

                    currentQuiz.nextQuestion();
                });
            }
        },

        addQuiz: function(quiz) {

            if (quiz !== null) {
                quizzes.push(quiz);

                if (quizzes.length === 1) {
                    currentQuiz = quizzes[0];
                }
            }

            addQuizTab();
            addQuizToHTML();
            setQuizLocation(quiz);
            addEventsToQuiz(quiz);
        }
    };
}();

var quiz = new DynamicQuiz.QuizElements.Quiz(DynamicQuiz.Constants.JSON_FILE);
DynamicQuiz.App.addQuiz(quiz);

DynamicQuiz.App.startApplication();

