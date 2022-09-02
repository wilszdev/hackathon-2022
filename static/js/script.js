let currentPrompt;
let currentPromptId;

var xCursorPosition = -1;
var yCursorPosition = -1;
function getCursorPosition(event) {
  xCursorPosition = event.clientX;
  yCursorPosition = event.clientY;
}

$(document).ready(function() {
  $('#canvasDiv').hide();
  $('#endModal').hide();
  $('#timer').hide();

  resize();
  activatePencil();
});

const timeLimit = 60;
let timerInterval = null;
let currentTimeRemaining;

// get canvas 2D context and set him correct size
let canvas = document.getElementById('canvasView');
let ctx = canvas.getContext('2d');
const backgroundColour = "#e2ebf0"
resize();

let round = 1;
let totalScore = 0;

$('#round').text("ROUND "+round);

// last known position
let pos = { x: 0, y: 0 };

$(window).resize(resize);
$(document).mousemove(draw);
$(document).mousedown(setPosition);
$(document).mouseenter(setPosition);

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

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1)
    return;

  if (erase) {
    col = backgroundColour;
  } else {
    col = $("#colorpicker")[0].value;
  }

  // pos.x
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
  ctx.fillStyle = backgroundColour
  ctx.fillRect(0, 0, $('#canvasView')[0].width, $('#canvasView')[0].height);
}

function startRound() {
  $("#skipButton").show();
  $('#startModal').hide();
  $('#canvasDiv').show();
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
  timerInterval = setInterval(() => {
    $("#timeRemaining").text(`${currentTimeRemaining} second${currentTimeRemaining == 1 ? "" : "s"} left`);
    currentTimeRemaining--;
    if(currentTimeRemaining < 0){
      clearInterval(timerInterval);
      endTime();
    }
  }, 1000);
}

function doSkip() {
  currentTimeRemaining = 0
  if (timerInterval != null) clearInterval(timerInterval);
  endTime()
}

function endTime(){
  $("#skipButton").hide();
  $('#canvasDiv').hide();
  $('#endModal').show();
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
  $('#endModal').hide();
  startRound();
}

function submit_image(callback) {
  canvas.toBlob((blob) => {
    api_submit_prompt(currentPromptId, blob, (response) => {
      callback(response.score, response.categories)
    });
  }, "image/png");
}

function activateEraser(){
  erase = true;
  $('#pen').css("border", "0px dashed white");
  $('#per').css("border", "2px dashed white");
}

function activatePencil(){
  erase = false;
  $('#per').css("border", "0px dashed white");
  $('#pen').css("border", "2px dashed white");
}

function penSizeChange(){
  lineWid = $('#sizes').val();
}

function startup() {
  canvas.addEventListener('touchstart', handleStart);
  canvas.addEventListener('touchmove', handleMove);
}

document.addEventListener("DOMContentLoaded", startup);

const ongoingTouches = [];

function handleStart(evt) {
  evt.preventDefault();
  console.log('touchstart.');
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    ongoingTouches.push(copyTouch(touches[i]));
    const color = colorForTouch(touches[i]);
    ctx.beginPath();
    ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function handleMove(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX-$('#canvasView').offset().left, ongoingTouches[idx].pageY-$('#canvasView').offset().top);
      ctx.lineTo(touches[i].pageX-$('#canvasView').offset().left, touches[i].pageY-$('#canvasView').offset().top);
      ctx.lineWidth = lineWid;
      ctx.strokeStyle = col;
      ctx.stroke();

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
    } else {
      console.log(log('can\'t figure out which touch to continue'));
    }
  }
}

function colorForTouch(touch) {
  let r = touch.identifier % 16;
  let g = Math.floor(touch.identifier / 3) % 16;
  let b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  const color = `#${r}${g}${b}`;
  return color;
}

function copyTouch({ identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }
  return -1;    // not found
}
