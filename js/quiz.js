var questionDiv  = document.getElementsByClassName("question")[0];
var questionsForm = document.getElementsByClassName("questionsForm")[0];
var choicesList = document.getElementsByClassName("choicesList")[0];

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

    this.getCorrectAnswer = function() {
        return correctChoice;
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

    var fillChoices = function(location, choices) {

        for(var i = 0; i < choices.length; i++) {

            var li = document.createElement("LI");
            var input = document.createElement("INPUT");
            input.type = "radio";
            input.name = "choice";

            li.appendChild(input);

            var text = document.createTextNode(choices[i]);
            li.appendChild(text);

            location.appendChild(li);
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

            fillQuestion(question.getQuestion());
            fillChoices(choicesList, question.getChoices());
        }
    };
}();


var Application = function() {
    "use strict";

    var allQuestions = ["What is the capital of Spain?","How many sides has an hexagon?", "What is the biggest creature on Earth?"];

    var choicesForQuestions = [ ["Barcelona", "Sevilla", "Madrid", "Coimbra","Sri Lanka"],
                                [2,7, 340, 6, 10],
                                ["Eagle","Lion", "You", "Doberman", "Blue whale"] ];

    var correctAnswerForQuestions = [2,3,4];

    var question = new Question();


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

    var showScore = function() {

    };

    var nextQuestionHandler = function(event) {

        event.preventDefault();

        var choiceChecked = getChoiceChecked(questionsForm);
        if(choiceChecked > 0) {

            currentQuestion++;

            if(currentQuestion < allQuestions.length) {

                if (question.isCorrectChoice(choiceChecked)) {
                    //Increase score
                }

                Questionnaire.fillQuestionnaire(getCurrentQuestion());
            }

            else {
                //showScore();
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




