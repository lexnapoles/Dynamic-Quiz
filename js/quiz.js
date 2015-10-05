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
                questionsForm.elements[answer].checked();
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


var Application = function() {
    "use strict";

    var allQuestions = ["What is the capital of Spain?","How many sides has an hexagon?", "What is the heaviest creature on Earth?"];

    var choicesForQuestions = [ ["Barcelona", "Sevilla", "Madrid", "Coimbra","Sri Lanka"],
                                [2,7, 340, 6, 10],
                                ["Eagle","Lion", "You", "Doberman", "Blue whale"] ];

    var correctAnswerForQuestions = [2,3,4];

    var userAnswers = [];

    var question = new Question();

    var score = new Score();

    var currentQuestion = 0;

    var getCurrentQuestion = function() {

        question.setQuestion(allQuestions[currentQuestion]);
        question.setChoices(choicesForQuestions[currentQuestion]);
        question.setCorrectChoice(correctAnswerForQuestions[currentQuestion]);

        return question;
    };

    var getChoiceChecked = function(form) {

        var choices = form.elements;

        for(var i = 0, len = choices.length; i < len; i++) {

            if(choices[i].checked) {

                return i;
            }
        }
        return -1;
    };

    var nextQuestionHandler = function(event) {

        event.preventDefault();

        var choiceChecked = getChoiceChecked(questionsForm);
        if(choiceChecked > 0) {

            if (question.isCorrectChoice(choiceChecked)) {
               score.increaseScore();
            }

            currentQuestion++;
            if(currentQuestion < allQuestions.length) {
                Questionnaire.fillQuestionnaire(getCurrentQuestion());
            }
            else {

                score.showScore();
            }
        }
    };

    return {
        startQuiz: function () {

            Questionnaire.fillQuestionnaire(getCurrentQuestion());

            questionsForm.addEventListener("submit", nextQuestionHandler, false);
        }
    };
}();

Application.startQuiz();


