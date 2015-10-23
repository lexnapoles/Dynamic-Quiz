var Quiz = function () {
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

    var clearNodeChilds = function (node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
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

            var doc = document;

            for (var i = 0; i < choices.length; i++) {

                var li = doc.createElement("LI"),
                    input = doc.createElement("INPUT");

                input.type = "radio";
                input.name = "choice";

                li.appendChild(input);

                var text = doc.createTextNode(choices[i]);
                li.appendChild(text);
                choicesList.appendChild(li);
            }
        };

        var fillQuestion = function (text) {

            var doc = document;

            var label = doc.createElement("LABEL"),
                questionText = doc.createTextNode(text);

            label.appendChild(questionText);

            Constants.DOMLookups.QuestionDiv.appendChild(label);
        };

        return {
            fillQuestionnaire: function (question) {

                clearNodeChilds(Constants.DOMLookups.QuestionDiv);
                clearNodeChilds(Constants.DOMLookups.ChoicesList);

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

        var doc = document;

        Constants.DOMLookups.QuestionsForm.onsubmit = null;
        var main = doc.getElementsByClassName("questionnarie")[0];
        clearNodeChilds(main);

        var scoreMsg = Constants.Messages.SCORE_MSG + " " + this.score;

        var h3 = doc.createElement("H3");
        h3.className = "score";

        var text = doc.createTextNode(scoreMsg);

        h3.appendChild(text);
        main.appendChild(h3);
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

    var Application = function () {
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

            Questionnaire.fillQuestionnaire(questions.next.call(questions));

            if (userPreviouslyAnswered()) {
                Questionnaire.setUserAnswer(getUserAnswer());
            }
        };

        var previousQuestion = function () {
            Questionnaire.fillQuestionnaire(questions.previous.call(questions));
            Questionnaire.setUserAnswer(getUserAnswer());
        };

        var nextQuestionHandler = function (event) {

            event.preventDefault();

            var choiceChecked = getChoiceChecked(Constants.DOMLookups.QuestionsForm);

            if (choiceChecked >= 0) {

                saveUserAnswer(choiceChecked);

                if (questions.isCorrectChoice.call(questions, choiceChecked)) {
                    score.increaseScore();
                }

                if (!questions.noMoreQuestions.call(questions)) {

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

                if (!questions.isFirstQuestion.call(questions)) {

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

            if (target.className === Constants.USERNAME || target.className === "password") {
                target.value = "";
            }
        };

        var defaultValueOnIfNoValue = function (event) {

            var target = event.target;

            if (target.value === "") {

                if (target.className === Constants.USERNAME) {
                    target.value = Constants.USERNAME;
                }
                else if (target.className === "password") {
                    target.value = "password";
                }
            }
        };

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

            var paragraph = doc.createElement("P"),
                text = doc.createTextNode(Constants.Messages.HELLO_MSG + ", " + username);

            paragraph.appendChild(text);

            var userMessageDiv = doc.getElementsByClassName("userMessage")[0];
            userMessageDiv.appendChild(paragraph);
        };

        var loadLogOutForm = function (username) {

            $(".logInForm").hide();

            writeUserWelcomeMessage(username);

            $(".logOutForm").show();
        };

        var logInFormInputValuesToDefault = function () {
            Constants.DOMLookups.LogInForm.elements[0].value = Constants.USERNAME;
            Constants.DOMLookups.LogInForm.elements[1].value = "password";
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
            startApplication: function () {

                questions.loadQuestions().done(function () {

                    if (Log.userAlreadyExists()) {
                        var username = Log.logExistingUser();
                        loadLogOutForm(username);
                    }

                    nextQuestion();

                    Constants.DOMLookups.QuestionsForm.addEventListener("click", previousQuestionHandler, false);
                    Constants.DOMLookups.QuestionsForm.addEventListener("submit", nextQuestionHandler, false);

                    Constants.DOMLookups.LogInForm.addEventListener("submit", logInHandler, false);
                    Constants.DOMLookups.LogInForm.addEventListener("click", defaultValueOff, false);
                    Constants.DOMLookups.LogInForm.addEventListener("mouseout", defaultValueOnIfNoValue, false);

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

Quiz.startQuiz();




