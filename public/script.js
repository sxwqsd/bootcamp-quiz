// Scipt

/**
 * Event generator
 */
function addEvent(eventName, data) {
    // Create the event.
    var event = new CustomEvent(eventName, { 'detail': data });
    document.dispatchEvent(event);
}

// Listning events
document.addEventListener('finishedQuiz', function(e) {
    $("#qaResult").style.display = 'block';
    $("#qa").style.display = 'none';
    $(".totalScore b").innerHTML = totalScore;

});

// get questions form json file
function getQuestion() {
    return fetch("./public/questions.json");
}

// Create options
function createOptions(option, optionIndex) {
    var optionNumber = optionIndex + 1;
    var optionElement = document.createElement("a");
    optionElement.setAttribute("href", "#");
    optionElement.setAttribute("answer-index", optionIndex);
    optionElement.innerHTML = optionNumber + ". " + option;
    return optionElement;
}

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
var questionContainer = $("#questionContainer");
var questionElem = $("#question");
var optionContainer = $("#options");
var startQuizAt = 0; // where you want to start question for quiz
var timeRemaining = 75; // time in second
var timeRemainingResetAt = timeRemaining; // time in second
var panelizeTimeOnWrongAns = 10; // 10 second will be deduct from time remaning
var scoreNumber = 5; // score for each correct answer
var questionResetAt = startQuizAt;
var totalScore = 0; // total quiz score
var highScore = []; // High Score
var currentQuestion;
var allQuestions;
var timeElm = $(".time span");
var answerStatus = $(".answer-status");
var timerStart; // scope to store interval instance

function startQuizTime() {
    timerStart = setInterval(function() {
        timeElm.innerHTML = timeRemaining;
        if (timeRemaining == 0) {
            clearInterval(timerStart);
            addEvent("finishedQuiz", { message: "time" });
        }
        timeRemaining--;
    }, 1000);
}


function loopOptions(options) {
    options.forEach(function(option, index) {
        var optEl = createOptions(option, index);
        optionContainer.append(optEl);
    });
}


// 

function setEventOnAnswerButtons() {
    var answerButtons = $$("#options a");
    if (answerButtons.length) {
        answerButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                var userAnswerIndex = e.target.getAttribute('answer-index');
                var answerIndex = currentQuestion.correctAnswerIndex;
                var isCorrectAnswer = checkAnswer(answerIndex, userAnswerIndex);

                if (isCorrectAnswer) {
                    answerStatus.innerHTML = "Correct";
                    totalScore += scoreNumber;
                } else {
                    answerStatus.innerHTML = "Wrong";
                    panelizeTime();
                }

                if (startQuizAt == allQuestions.length) {
                    answerStatus.innerHTML = " ";
                    clearInterval(timerStart);
                    addEvent("finishedQuiz", { message: "question" });
                } else {
                    changeQestion();
                }

            })
        });
    }
}

function panelizeTime() {
    if (timeRemaining >= panelizeTimeOnWrongAns) {
        timeRemaining -= panelizeTimeOnWrongAns;
    }
}

function checkAnswer(answerIndex, userAnswerIndex) {
    return answerIndex == userAnswerIndex;
}

function changeQestion() {
    optionContainer.innerHTML = "";
    currentQuestion = allQuestions[startQuizAt];
    questionElem.innerHTML = currentQuestion.question;
    loopOptions(currentQuestion.options);
    setEventOnAnswerButtons();
    startQuizAt++;
}

function startQuiz() {
    startQuizAt = questionResetAt; // reset question start from
    totalScore = 0; // reset score
    timeRemaining = timeRemainingResetAt;
    questionElem.style.display = "block";
    getQuestion()
        .then(function(res) { return res.json() })
        .then(function(data) {
            allQuestions = data;
            currentQuestion = data[startQuizAt];
            changeQestion();
        });

}

/**
 * Start quiz
 */

$(".start-quiz-btn").addEventListener('click', function() {
    $(".welcome").style.display = "none";
    $("#qa").style.display = "block";
    startQuiz();
    startQuizTime();
});

/**Store result */

$("#initilForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var initial = $("#initial").value;
    highScore.push(initial + "-" + totalScore);
    $("#qaResult").style.display = "none";
    $("#highScores").style.display = "block";
    $("#highScores ul").innerHTML = "";
    highScore.forEach(function(score, index) {
        var listNumber = index + 1;
        var scoreLi = document.createElement("li");
        scoreLi.innerHTML = listNumber + ". " + score;
        $("#highScores ul").append(scoreLi);
    });


});

// on go back
$(".goBack").addEventListener('click', function() {
    timeElm.innerHTML = 0;
    $("#highScores").style.display = "none";
    $(".welcome").style.display = "block";
});

//  clear high score
$(".clearHighScore").addEventListener('click', function() {
    highScore = [];
    timeElm.innerHTML = 0;
    $("#highScores").style.display = "none";
    $(".welcome").style.display = "block";
});