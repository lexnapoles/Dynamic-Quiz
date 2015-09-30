var questionDiv  = document.getElementsByClassName("question")[0];
var choicesDiv = document.getElementsByClassName("choices")[0];
var questionsForm = document.getElementsByClassName("questionsForm")[0];

var allQuestions = ["What is the capital of Spain?","How many sides has an hexagon?", "What is the biggest creature on Earth?"];

function Question() {
    "use strict";

    var question;

    this.getQuestion = function () {
        return question;
    };

    this.setQuestion = function(value) {
        question = value;
    };
}


function Choices() {
    "use strict";

    var choices;
    var correctChoice;

    this.getChoices = function () {
        return choices;
    };

    this.setChoices = function(values) {
        choices = values;
    };

    this.setCorrectChoice = function(value) {
        correctChoice = value;
    };

    this.IsCorrectAnswer = function (choice) {
        return choice === choices[correctChoice];
    };
}

var Questionnaire = function() {
    "use strict";

    var question = new Question();
    var choices = new Choices();

    var fillChoices = function(location, choices) {

        for(var i = 0; i < choices.length; i++) {

            var choice = document.createElement("INPUT");
            choice.type = "radio";
            choice.name = "choice";
            location.appendChild(choice);

            var text = document.createTextNode(choices[i]);
            location.appendChild(text);
        }
    };

    var fillQuestion = function(text) {
        var label = document.createElement("LABEL");

        var questionText = document.createTextNode(text);
        label.appendChild(questionText);

        questionDiv.appendChild(label);
    };

    return {
        fillQuestionnaire: function(quest, chs, correctChoice) {
                question.setQuestion(quest);
                choices.setChoices(chs);
                choices.setCorrectChoice(correctChoice);

                fillQuestion(question.getQuestion());
                fillChoices(choicesDiv, choices.getChoices());
            }
        };
}();


var firstQuestion = allQuestions[0];
var choices = ["Barcelona", "Sevilla", "Madrid", "Coimbra"];
Questionnaire.fillQuestionnaire(firstQuestion, choices, 2);

var nextHandler = function(event) {
    "use strict";

    event.preventDefault();
};

questionsForm.addEventListener("submit", nextHandler, false);



