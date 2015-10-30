var DynamicQuiz = function () {
    "use strict";

    var Constants = {
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
            var doc = document;
            var logInForm = doc.getElementsByClassName("logInForm")[0],
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

    function Question(obj) {
        this.question = [];
        this.choices = [];
        this.correctAnswer = -1;

        if (obj !== null) {

            this.question = obj.question;
            this.choices = obj.choices;
            this.correctAnswer = obj.correctAnswer;
        }
    }

    Question.prototype.getQuestion = function () {
        return this.question;
    };

    Question.prototype.getChoices = function () {
        return this.choices;
    };

    Question.prototype.isCorrectChoice = function (choice) {
        return choice === this.correctAnswer;
    };

    var Questionnaire = function () {

        var fillChoices = function (choicesList, choices) {

            var html = "";

            for (var i = 0, len = choices.length; i < len; i++) {
                html += "<li><input type='radio' name='choice'>" + choices[i] + "</li>";
            }

            choicesList.innerHTML = html;
        };

        var fillQuestion = function (text) {

            var html = "<label>" + text + "</label>";

            Constants.DOMLookups.QuestionDiv.innerHTML = html;
        };

        return {
            fillQuestionnaire: function (question) {

                fillQuestion(question.getQuestion());
                fillChoices(Constants.DOMLookups.ChoicesList, question.getChoices());
            },

            setUserAnswer: function (answer) {

                if (answer < Constants.DOMLookups.QuestionsForm.elements.length) {
                    Constants.DOMLookups.QuestionsForm.elements[answer].checked = true;
                }
            }
        };
    }();

    function Score() {
        this.score = 0;
    }

    Score.prototype.changeTitle = function () {
        var title = document.getElementsByClassName("title")[0].firstChild;
        title.text = "Score";
    };

    Score.prototype.increaseScore = function () {
        this.score++;
    };

    Score.prototype.decreaseScore = function () {
        if (this.score > 0) {
            this.score--;
        }
    };

    Score.prototype.showScore = function () {

        Score.prototype.changeTitle();

        var main = document.getElementsByClassName("questionnaire")[0],
            scoreMsg = Constants.Messages.SCORE_MSG + " " + this.score,
            html = "<h3 class='score'>" + scoreMsg + "</h3>";

        Constants.DOMLookups.QuestionsForm.onsubmit = null;
        Constants.DOMLookups.QuestionsForm.onclick = null;

        main.innerHTML = html;
    };

    function QuestionsAndAnswers(jsonFile) {

        this.questions = [];
        this.currentQuestion = -1;
        this.jsonFile = jsonFile;
    }

    QuestionsAndAnswers.prototype.loadQuestions = function () {
        var that = this;
        return $.getJSON(that.jsonFile, function (data) {
            $.each(data, function (i) {
                that.questions[that.questions.length] = new Question(data[i]);
            });
        });
    };

    QuestionsAndAnswers.prototype.next = function () {
        this.currentQuestion++;
        return this.questions[this.currentQuestion];
    };

    QuestionsAndAnswers.prototype.previous = function () {
        this.currentQuestion--;
        return this.questions[this.currentQuestion];

    };

    QuestionsAndAnswers.prototype.noMoreQuestions = function () {
        return this.currentQuestion >= this.questions.length - 1;
    };

    QuestionsAndAnswers.prototype.index = function () {
        return this.currentQuestion;
    };

    QuestionsAndAnswers.prototype.isFirstQuestion = function () {
        return this.currentQuestion === 0;
    };

    QuestionsAndAnswers.prototype.isCorrectChoice = function (choice) {
        return this.questions[this.currentQuestion].isCorrectChoice(choice);
    };


    var Log = function () {
        var logged = false;

        return {
            logIn: function (username, password) {

                var user = localStorage.getItem(Constants.USERNAME);
                if (user === username) {
                    logged = true;
                }
                else {
                    localStorage.setItem(Constants.USERNAME, username);
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
                return localStorage.getItem(Constants.USERNAME);
            },

            deleteUsers: function () {
                localStorage.clear();
            }
        };
    }();



    var Quiz = function() {

        this.questions = new QuestionsAndAnswers(Constants.JSON_FILE);
        this.userAnswers = [];
        this.score = new Score();
    };

    Quiz.prototype.getChoiceChecked = function (form) {

        var choices = form.elements;

        for (var i = 0, len = choices.length; i < len; i++) {

            if (choices[i].checked) {

                return i;
            }
        }
        return -1;
    };

    Quiz.prototype.userPreviouslyAnswered = function () {
        return this.questions.index() < this.userAnswers.length;
    };

    Quiz.prototype.saveUserAnswer = function (answer) {
        if (this.userPreviouslyAnswered()) {
            this.userAnswers[this.questions.index()] = answer;
        }
        else {
            this.userAnswers[this.userAnswers.length] = answer;
        }
    };

    Quiz.prototype.getUserAnswer = function () {
        return this.userAnswers[this.questions.index()];
    };

    Quiz.prototype.nextQuestion = function () {
        Questionnaire.fillQuestionnaire(this.questions.next());

        if (this.userPreviouslyAnswered()) {
            Questionnaire.setUserAnswer(this.getUserAnswer());
        }
    };

    Quiz.prototype.previousQuestion = function () {
        Questionnaire.fillQuestionnaire(this.questions.previous());
        Questionnaire.setUserAnswer(this.getUserAnswer());
    };

    Quiz.prototype.goToNextQuestion = function () {

        var choiceChecked = this.getChoiceChecked(Constants.DOMLookups.QuestionsForm);

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
            window.alert(Constants.Messages.PICK_CHOICE_MSG);
        }
    };

    Quiz.prototype.goToPreviousQuestion = function () {

        if (!this.questions.isFirstQuestion()) {

            var QA = $(".QA");

            QA.fadeTo("fast", 0,  this.previousQuestion.bind(this));

            QA.fadeTo("fast", 1);

            this.score.decreaseScore();
        }
        else {
            window.alert(Constants.Messages.FIRST_QUESTION);
        }
    };

    Quiz.prototype.loadQuestions = function() {
        return this.questions.loadQuestions();

    };

    var Application = function () {
        
        var quizes = [];
        var quizes[0] = new Quiz();

         var getUsernameAndPassword = function () {

            var info = [],
                field = Constants.DOMLookups.LogInForm.elements;

            for (var i = 0, len = field.length; i < len; i++) {
                if (field[i].type !== "submit") {
                    info[info.length] = field[i].value;
                }
            }
            return info;
        };

        var writeUserWelcomeMessage = function (username) {

            var doc = document;

            var html = "<p>" + Constants.Messages.HELLO_MSG + ", " + username + "</p>";

            var userMessageDiv = doc.getElementsByClassName("userMessage")[0];
            userMessageDiv.innerHTML = html;
        };

        var loadLogOutForm = function (username) {

            $(".logInForm").hide();

            writeUserWelcomeMessage(username);

            $(".logOutForm").show();
        };

        var logInFormInputValuesToDefault = function () {
            Constants.DOMLookups.LogInForm.elements[0].value = "";
            Constants.DOMLookups.LogInForm.elements[1].value = "";
        };

        var logInFormHasNoDefaultValues = function () {
            return Constants.DOMLookups.LogInForm.elements[0].value !== Constants.USERNAME;
        };

        var loadLogInForm = function () {

            $(".logOutForm").hide();

            logInFormInputValuesToDefault();

            $(".logInForm").show();
        };

        var noRememberIsChecked = function () {
            var noRemember = Constants.DOMLookups.LogInForm.elements[2];
            return noRemember.checked;
        };

        var LogInUser = function () {

            if (!Log.isUserLoggedIn() && logInFormHasNoDefaultValues()) {

                var userInfo = getUsernameAndPassword();

                Log.logIn.apply(null, userInfo);
                var username = userInfo[0];

                if (noRememberIsChecked()) {
                    window.addEventListener("unload", function () {
                        Log.deleteUsers();
                    }, false);
                }

                loadLogOutForm(username);
            }
        };

        var logOutUser = function () {

            Log.logOut();

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
                quizes[0].goToPreviousQuestion();
            }
        };

        var nextQuestionHandler = function (event) {

            event.preventDefault();

            quizes[0].goToNextQuestion();
        };

        return {
            startApplication: function () {

                quizes[0].loadQuestions().done(function () {

                    if (Log.userAlreadyExists()) {
                        var username = Log.logExistingUser();
                        loadLogOutForm(username);
                    }

                    quizes[0].nextQuestion();

                    Constants.DOMLookups.QuestionsForm.addEventListener("click", previousQuestionHandler, false);
                    Constants.DOMLookups.QuestionsForm.addEventListener("submit", nextQuestionHandler, false);

                    Constants.DOMLookups.LogInForm.addEventListener("submit", logInHandler, false);

                    Constants.DOMLookups.LogOutForm.addEventListener("submit", logOutHandler, false);
                });
            }
        };
    }();

    return {
        startQuiz: function () {
            Application.startApplication();
        }
    };
}();

DynamicQuiz.startQuiz();






