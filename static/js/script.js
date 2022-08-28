let currentPrompt;
let currentPromptId;
let currentTimeRemaining;

var xCursorPosition = -1;
var yCursorPosition = -1;
function getCursorPosition(event) {
  xCursorPosition = event.clientX;
  yCursorPosition = event.clientY;
  console.log("xCursorPosition "+xCursorPosition+" yCursorPosition "+yCursorPosition);
}

$(document).ready(function() {
  $('#canvasDiv').hide();
  $('#endModal').hide();
  $('#timer').hide();
  
  resize();
  pencil();
});

const timeLimit = 30;

// get canvas 2D context and set him correct size
let canvas = document.getElementById('canvasView');
let ctx = canvas.getContext('2d');
resize();

let round = 1;
let totalScore = 0;

$('#round').text("ROUND "+round);

// last known position
let pos = { x: 0, y: 0 };

window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('touchmove', draw);

document.addEventListener('mousedown', setPosition);

document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = xCursorPosition - canvas.getBoundingClientRect()["x"];
  pos.y = yCursorPosition - canvas.getBoundingClientRect()["y"];
}

// resize canvas
function resize() {
  var w = document.getElementById('canvasDiv').offsetWidth,
	    h = document.getElementById('canvasDiv').offsetHeight;
	ctx.canvas.width = w;
	ctx.canvas.height = h;
}

//current colour of the line
let col = "#000000";
//current width of the line
let lineWid = 3;

let erase = false;

$(document).click(function(){

  if(!erase){
    col = $("#colorpicker")[0].value;
  }
  else{
    col = "rgb(225, 234, 239)";
  }
});

$('#eraser')[0].click(function(){col = "#e2ebf0";});

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1)
    return;
  if(xCursorPosition> canvas.getBoundingClientRect()["x"]+canvas.getBoundingClientRect()["width"] ^ yCursorPosition>canvas.getBoundingClientRect()["y"]+canvas.getBoundingClientRect()["height"] ^ xCursorPosition<canvas.getBoundingClientRect()["x"] ^ yCursorPosition<canvas.getBoundingClientRect()["y"]){
    ctx.clearPath();
    return;
  } 
  // pos.x 
  $('#pencil')[0].click(function(){col = $("#colorpicker")[0].value;});
  ctx.beginPath(); // begin

  ctx.lineWidth = lineWid;
  ctx.lineCap = 'round';
  ctx.strokeStyle = col;
  
  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to

  ctx.stroke(); // draw it!
}

function clearCanvas(){
  ctx.clearRect(0, 0, $('#canvasView')[0].width, $('#canvasView')[0].height);
}

function startRound() {
  hideStart();
  showCanvas();
  resize();

  api_get_prompt((p) => {
    currentPrompt = p.description
    currentPromptId = p.prompt
    $('#drawObject').text(currentPrompt);
  });

  clearCanvas();

  currentTimeRemaining = timeLimit;

  $("#timeRemaining").text(timeLimit + " seconds left");
  $('#timer').show();
  let timerInterval = setInterval(() => {
    setTimer(currentTimeRemaining);
    currentTimeRemaining--;
    if(currentTimeRemaining < 0){
      clearInterval(timerInterval);
      endTime();
    }
  }, 1000);
} 

function setTimer(i){
  if(i == 1){
    $("#timeRemaining").text(i + " second left");
  }
  else{
    $("#timeRemaining").text(i + " seconds left");
  }
}

function doSkip() {
  currentTimeRemaining = 1
}

function endTime(){
  hideCanvas();
  showEnd();
  //send image
  $('#aiThought').text("");
  $('#congrats').text("Processing...");
  $('#numberCurrentPoints').text("");
  $('#endModalButton').hide();
  submit_image((score, top_categories) => {    
    totalScore += score
    let thought = "The AI had no clue what on earth you drew..."
    let congrats = "Do better!"

    if (top_categories.length > 0) {
      let cat_art = top_categories.map((category) => {
        let desc = category.description;
        const vowels = "aeiouAEIOU";
        let is_vowel = vowels.includes(desc[0])
        let article = is_vowel ? 'an' : 'a';
        return `${article} ${desc}`;
      });

      if (top_categories[0].description === currentPrompt) {
        thought = `The AI thought your drawing was ${cat_art[0]}.`;
        congrats = "Nice Work!";
      } else {
        congrats = "Get good.";
        
        if (top_categories.length == 1) {
          thought = `Oops! The AI thought your drawing was ${cat_art[0]}.`;
        } else {
          thought = `Oops! The AI thought your drawing was ${cat_art[0]}, or maybe ${cat_art[1]}??`;
        }
      }
    }

    $('#aiThought').text(thought);
    $('#congrats').text(congrats);
    $('#numberCurrentPoints').text("+" + score + " points");
    $('#totalPoints').text(totalScore);
    $('#endModalButton').show();
  });
}

function nextRound(){
  round++;
  $('#round').text("ROUND "+round);
  hideEnd();
  showStart();
}

function submit_image(callback) {
  canvas.toBlob((blob) => {
    api_submit_prompt(currentPromptId, blob, (response) => {
      callback(response.score, response.categories)
    });
  }, "image/png");
}

function eraser(){
  erase = true;
  col = "#e2ebf0";
  $('#pen').css("border", "0px dashed white");
  $('#per').css("border", "2px dashed white");
}

function pencil(){
  erase = false;
  col = $("#colorpicker")[0].value;
  $('#per').css("border", "0px dashed white");
  $('#pen').css("border", "2px dashed white");
}

function penSizeChange(){
  lineWid = $('#sizes').val();
}

function showStart(){
  $('#startModal').show();
}
function hideStart(){
  $('#startModal').hide();
}
function showCanvas(){
  $('#canvasDiv').show();
}
function hideCanvas(){
  $('#canvasDiv').hide();
}
function showEnd(){
  $('#endModal').show();
}
function hideEnd(){
  $('#endModal').hide();
}

function startup() {
  canvas.addEventListener('touchstart', handleStart);
  canvas.addEventListener('touchend', handleEnd);
  canvas.addEventListener('touchcancel', handleCancel);
  canvas.addEventListener('touchmove', handleMove);
}

document.addEventListener("DOMContentLoaded", startup);

const ongoingTouches = [];

function handleStart(evt) {
  evt.preventDefault();
  log('touchstart.');
  const el = document.getElementById('canvas');
  const ctx = el.getContext('2d');
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    log(`touchstart: ${i}.`);
    ongoingTouches.push(copyTouch(touches[i]));
    const color = colorForTouch(touches[i]);
    log(`color of touch with id ${touches[i].identifier} = ${color}`);
    ctx.beginPath();
    ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  }
}
