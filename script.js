$(document).ready(function() {
  $('#canvasDiv').hide();
  $('#endModal').hide();
});

// get canvas 2D context and set him correct size
let canvas = $('#canvasview')[0];
let ctx = canvas.getContext('2d');
resize();

let round = 1;
let totalScore = 0

$('#round').text("ROUND "+round);

// last known position
let pos = { x: 0, y: 0 };

window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('touchstart', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.offsetX*1;
  pos.y = e.offsetY*0.9;
}


// resize canvas
function resize() {
  $("#canvasview")[0].width = $("#canvasview")[0].clientWidth;
  $("#canvasview")[0].height = $("#canvasview")[0].clientHeight;
  ctx.width = $("#canvasview")[0].width;
  ctx.height = $("#canvasview")[0].height;
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

$('#pencil')[0].click(function(){col = $("#colorpicker")[0].value;});
$('#eraser')[0].click(function(){col = "#e2ebf0";});


function draw(e) {
  console.log("draw "+col);
  // mouse left button must be pressed
  if (e.buttons !== 1) return;
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

function hideNameModal(){
  $(".nameCollector")[0].style.display = "none";
  $(".nameCollector")[0].style.opacity = 0;
}

$("#nameButton")[0].click(function(){
  $("#nameScore")[0].html() = $('#nameInput')[0].value+": ";
  hideNameModal();
});

function clearCanvas(){
  ctx.clearRect(0, 0, $('#canvasview')[0].width, $('#canvasview')[0].height);
}

let listOfPrompts = ["Amongus", "Minion", "Apple", "Piano", "Amongus", "Minion", "Apple"]

function startRound(){

  hideStart();
  showCanvas();

  //generate prompt
  if(listOfPrompts.length > 1){
    let randInt = Math.floor(Math.random() * 10);
    let currentPrompt = listOfPrompts[randInt];
    $('#drawObject').text(currentPrompt);
    listOfPrompts.splice(randInt, randInt+1);
  }
  else
    return;

  clearCanvas();

  const timeLimit = 3;
  let currentTime = timeLimit;

  $("#timeRemaining").text(timeLimit + " seconds left");

  let timerInterval = setInterval(
    function f(){
      setTimer(currentTime);
      console.log("currentTime "+currentTime);
      currentTime--;
      if(currentTime < 0){
        clearInterval(timerInterval);
        endTime();
      }
    }
  ,1000);
}

function setTimer(i){
  if(i == 1){
    $("#timeRemaining").text(i + " second left");
  }
  else{
    $("#timeRemaining").text(i + " seconds left");
  }
}

function endTime(){
  hideCanvas();
  showEnd();
  //send image
  //edit modal
  //add points
  //change points on screen;
}

function nextRound(){
  round++;
  //edit round number
  $('#round').text("ROUND "+round);
  //totalScore = totalScore + score;
  hideEnd();
  showStart();
}
//$("#startModal").css("display","initial");

function submit_image() {
  api_get_prompt((response) => {
    let id = response.id
    canvas.toBlob((blob) => {
      api_submit_prompt(id, blob, (response) => {
        alert('your score was ' + response.score + ' of 100')
      });
    }, "image/png");
  });
}

function pencil(){
  erase = false;
  col = $("#colorpicker")[0].value;
  $('#per').css("border", "0px dashed", "#e2ebf0");
  $('#pen').css("border", "2px dashed", "#e2ebf0");
}

function eraser(){
  erase = true;
  col = "#e2ebf0";
  $('#pen').css("border", "0px dashed white");
  $('#per').css("border", "2px dashed white");
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