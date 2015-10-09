var loginForm = document.getElementsByClassName("loginForm")[0];
var questionDiv  = document.getElementsByClassName("question")[0];
var questionsForm = document.getElementsByClassName("questionsForm")[0];
var choicesList = document.getElementsByClassName("choicesList")[0];

var clearNodeChilds = function(node) {
    "use strict";

    while(node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
};

function Question(obj) {
    "use strict";

    var question;
    var choices;
    var correctAnswer;

    if(obj !== null) {

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

    this.isCorrectChoice = function(choice) {
        return choice === correctAnswer;
    };
}

var Questionnaire = function() {
    "use strict";

    var fillChoices = function(choicesList, choices) {

        for(var i = 0; i < choices.length; i++) {

            var li = document.createElement("LI");
            var input = document.createElement("INPUT");
            input.type = "radio";
            input.name = "choice";

            li.appendChild(input);

            var text = document.createTextNode(choices[i]);
            li.appendChild(text);
            choicesList.appendChild(li);
        }
    };

    var fillQuestion = function(text) {

        var label = document.createElement("LABEL");

        var questionText = document.createTextNode(text);
        label.appendChild(questionText);

        questionDiv.appendChild(label);
    };

    return {
                fillQuestionnaire: function(question) {

                    clearNodeChilds(questionDiv);
                    clearNodeChilds(choicesList);

                    fillQuestion(question.getQuestion());
                    fillChoices(choicesList, question.getChoices());
        },

        setUserAnswer: function(answer) {

            if(answer < questionsForm.elements.length)
            {
                questionsForm.elements[answer].checked = true;
            }
        }
    };
}();

function Score() {
    "use strict";
    var score = 0;

    var changeTitle = function() {

        var title = document.getElementsByClassName("title")[0].firstChild;
        title.text = "Score";
    };


    this.increaseScore = function() {
        score++;
    };

    this.decreaseScore = function() {
        if(score > 0) {
            score--;
        }
    };

    this.showScore = function() {

        changeTitle();

        questionsForm.onsubmit = null;
        var main = document.getElementsByClassName("questionnarie")[0];
        clearNodeChilds(main);

        var scoreMsg = "Your final score is: " + score;

        var h3 = document.createElement("H3");
        h3.className = "score";

        var text = document.createTextNode(scoreMsg);

        h3.appendChild(text);
        main.appendChild(h3);
};
}

function QuestionsAndAnswers(jsonFile) {
    "use strict";

    var questions = [];
    var currentQuestion = -1;

    this.loadQuestions = function() {

      return $.getJSON(jsonFile, function(data) {

          $.each(data, function (i) {
              questions[questions.length] = new Question(data[i]);
           });
        });
    }();

    this.next = function(){
        currentQuestion++;
        return questions[currentQuestion];
    };

    this.previous = function() {
        currentQuestion--;
        return questions[currentQuestion];

    };

    this.noMoreQuestions = function() {
        return currentQuestion >= questions.length - 1;
    };

    this.index = function() {
        return currentQuestion;
    };

    this.isFirstQuestion = function() {
        return currentQuestion === 0;
    };

    this.isCorrectChoice = function(choice) {
        return questions[currentQuestion].isCorrectChoice(choice);
    };
}

var Application = function() {
    "use strict";

    var questions = new QuestionsAndAnswers("Q&A.json");

    var userAnswers = [];

    var score = new Score();

    var getChoiceChecked = function(form) {

        var choices = form.elements;

        for(var i = 0, len = choices.length; i < len; i++) {

            if(choices[i].checked) {

                return i;
            }
        }
        return -1;
    };

    var userPreviouslyAnswered = function() {
        return questions.index() < userAnswers.length;
    };

    var saveUserAnswer = function(answer) {
        if(userPreviouslyAnswered()) {
            userAnswers[questions.index()] = answer;
        }
        else {
            userAnswers[userAnswers.length] = answer;
        }
    };

    var getUserAnswer = function() {
        return userAnswers[questions.index()];
    };

    var nextQuestion = function() {

        Questionnaire.fillQuestionnaire(questions.next());

        if(userPreviouslyAnswered()) {
            Questionnaire.setUserAnswer(getUserAnswer());
        }
    };

    var previousQuestion = function() {
        Questionnaire.fillQuestionnaire(questions.previous());
        Questionnaire.setUserAnswer(getUserAnswer());
    };

    var nextQuestionHandler = function(event) {

        event.preventDefault();

        var choiceChecked = getChoiceChecked(questionsForm);

        if (choiceChecked >= 0) {

            saveUserAnswer(choiceChecked);

            if (questions.isCorrectChoice(choiceChecked)) {
                score.increaseScore();
            }

            if (!questions.noMoreQuestions()) {

                var QA = $(".QA");

                QA.fadeTo("fast", 0,  nextQuestion);

                QA.fadeTo("fast", 1);
            }
            else {
                score.showScore();
            }
        }
        else {
            window.alert("To proceed further, please pick a choice");
        }
    };

    var previousQuestionHandler = function(event) {

        var target = event.target;

        if(target.className === "backBtn") {

            if (!questions.isFirstQuestion()) {

                var QA = $(".QA");

                QA.fadeTo("fast", 0, previousQuestion);

                QA.fadeTo("fast", 1);

                score.decreaseScore();
            }
            else {
                window.alert("This is the first question");
            }
        }
    };

    var loginHandler = function(event) {

    };

    var defaultValueOff = function (event) {

        var target = event.target;

        if (target.className === "username" || target.className === "password") {
            target.value = "";
        }
    };

    var defaultValueOnIfNoValue = function (event) {

        var target = event.target;

        if(target.value === "") {

            if (target.className === "username") {
                target.value = "username";
            }
            else if (target.className === "password") {
                target.value = "password";
            }
        }
    };


    return {
        startQuiz: function () {

            questions.loadQuestions.done( function() {

                nextQuestion();

                questionsForm.addEventListener("click", previousQuestionHandler, false);
                questionsForm.addEventListener("submit", nextQuestionHandler, false);

                loginForm.addEventListener("submit", loginHandler, false);
                loginForm.addEventListener("click",defaultValueOff, false);
                loginForm.addEventListener("mouseout", defaultValueOnIfNoValue, false);
            });
        }
    };
}();

Application.startQuiz();


