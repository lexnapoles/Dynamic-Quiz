var questionDiv  = document.getElementsByClassName("question")[0];
var questionsForm = document.forms[0];
var choicesList = document.getElementsByClassName("choicesList")[0];


var clearNodeChilds = function(node) {
    "use strict";

    while(node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
};

function Question() {
    "use strict";

    var question;
    var choices;
    var correctChoice;

    this.getQuestion = function () {
        return question;
    };

    this.getChoices = function () {
        return choices;
    };

    this.setQuestion = function(value) {
        question = value;
    };

    this.setChoices = function(values) {
        choices = values;
    };

    this.setCorrectChoice = function(value) {
        correctChoice = value;
    };

    this.isCorrectChoice = function (choice) {
        return choice === correctChoice;
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

    var currentQuestion = 0;

    this.nextQuestion = function(){

        var question;

        if(currentQuestion !== 0) {
            currentQuestion++;
            question = questions[currentQuestion];

        }
        else {
            question = questions[currentQuestion];
            currentQuestion++;
        }

        return question;
    };

    this.previousQuestion = function() {
        currentQuestion--;
        return questions[currentQuestion];
    };

    this.noMoreQuestions = function() {
        return currentQuestion >= questions.length;
    };
}



var Application = function() {
    "use strict";

    var allQuestions = new QuestionsAndAnswers("Q&A.json");

    var userAnswers = [];

    var question = new Question();

    var score = new Score();

    var currentQuestion = 0;

    var getChoiceChecked = function(form) {

        var choices = form.elements;

        for(var i = 0, len = choices.length; i < len; i++) {

            if(choices[i].checked) {

                return i;
            }
        }
        return -1;
    };

    var saveUserAnswer = function(answer) {
        if(userAnswers.length > 0) {
            userAnswers[currentQuestion] = answer;
        }
        else {
            userAnswers[userAnswers.length] = answer;
        }
    };

    var getCurrentUserAnswer = function() {
        return userAnswers[currentQuestion];
    };

    var nextQuestion = function() {

        Questionnaire.fillQuestionnaire(allQuestions.nextQuestion());
        Questionnaire.setUserAnswer(getCurrentUserAnswer());
    };

    var previousQuestion = function() {
        Questionnaire.fillQuestionnaire(allQuestions.previousQuestion());
        Questionnaire.setUserAnswer(getCurrentUserAnswer());
    };

    var nextQuestionHandler = function(event) {

        event.preventDefault();

        var choiceChecked = getChoiceChecked(questionsForm);

        if (choiceChecked >= 0) {

            saveUserAnswer(choiceChecked);

            if (question.isCorrectChoice(choiceChecked)) {
                score.increaseScore();
            }

            currentQuestion++;
            if (currentQuestion < allQuestions.length) {

                $(".QA").fadeTo("fast", 0,  nextQuestion);

                $(".QA").fadeTo("fast", 1);
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

            if (currentQuestion > 0) {

                currentQuestion--;

                $(".QA").fadeTo("fast", 0, function () {
                    previousQuestion();
                });

                $(".QA").fadeTo("fast", 1);

                score.decreaseScore();
            }
            else {
                window.alert("This is the first question");
            }
        }
    };

    return {
        startQuiz: function () {

            nextQuestion();

            questionsForm.addEventListener("click", previousQuestionHandler, false);
            questionsForm.addEventListener("submit", nextQuestionHandler, false);

        }
    };
}();

Application.startQuiz();


