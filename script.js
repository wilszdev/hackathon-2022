let currentPrompt;
let currentPromptId;

$(document).ready(function() {
  $('#canvasDiv').hide();
  $('#endModal').hide();
  
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

canvas.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('touchstart', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.offsetX;
  pos.y = e.offsetY;
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

$("#nameButton").click(function name(){
  console.log($('#nameButton').val());
  hideNameModal();
});

function clearCanvas(){
  ctx.clearRect(0, 0, $('#canvasView')[0].width, $('#canvasView')[0].height);
}

function startRound() {
  hideStart();
  showCanvas();
  resize();

  api_get_prompt((p)=>{
    currentPrompt = p.description
    currentPromptId = p.id
    $('#drawObject').text(currentPrompt);
  });

  clearCanvas();

  let currentTime = timeLimit;

  $("#timeRemaining").text(timeLimit + " seconds left");

  let timerInterval = setInterval(() => {
    setTimer(currentTime);
    console.log("currentTime "+currentTime);
    currentTime--;
    if(currentTime < 0){
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

function endTime(){
  hideCanvas();
  showEnd();
  //send image
  $('#aiThought').text("");
  $('#congrats').text("");
  $('#numberCurrentPoints').text("");
  $('#endModalButton').hide();
  submit_image((score, top_categories) => {
    // score is an integer in range [0, 100]
    // top_categories is an array of strings
    let categories = top_categories;
    console.log('your score was ' + score + ' of 100')
    console.log(categories);

    if(currentPrompt == categories[0]){
      if(categories[0][0] == 'a')
        $('#aiThought').text("The AI thought your drawing was an " + categories[0]);
      else
        $('#aiThought').text("The AI thought your drawing was a " + categories[0]);
      
      $('#congrats').text("Nice Work!");
      $('#numberCurrentPoints').text(score + " points");
    }
    else {
      switch(categories.length){
        case 0:
          $('#aiThought').text("Oops! The AI didn't know what your drawing was???");
          break;
        case 1:
          if(categories[0][0] == 'a')
            $('#aiThought').text("Oops! The AI thought your drawing was an "+categories[0]+".");
          else
            $('#aiThought').text("Oops! The AI thought your drawing was a "+categories[0]+".");
          break;
        default:
          if(categories[0][0] == 'a')
            $('#aiThought').text("Oops! The AI thought your drawing was an "+categories[0]+". Or maybe a "+categories[1]+"???");
          else if(categories[1][0] == 'a')
            $('#aiThought').text("Oops! The AI thought your drawing was a "+categories[0]+". Or maybe an "+categories[1]+"???");
          else
            $('#aiThought').text("Oops! The AI thought your drawing was a "+categories[0]+". Or maybe a "+categories[1]+"???");
      }
      $('#congrats').text("Get good.");
      $('#numberCurrentPoints').text(score + " points");
    }
    totalScore+=score;
    $('#totalPoints').text(totalScore);
    $('#endModalButton').show();
  });
}

function nextRound(){
  round++;
  //edit round number
  $('#round').text("ROUND "+round);
  //totalScore = totalScore + score;
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
  $('#per').css("border", "0px dashed", "#e2ebf0");
  $('#pen').css("border", "2px dashed", "#e2ebf0");
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

/*

$('element').html() = "";

for(let i = 0; i < arr.length; i++){
  $('element').html()+="<p><a href=\""+link+"\">"+name+"</a></p>"
}
*/