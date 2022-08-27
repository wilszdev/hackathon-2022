// get canvas 2D context and set him correct size
let canvas = $('#canvasview')[0];
let ctx = canvas.getContext('2d');
resize();

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
  $("#canvasview")[0].width = $("#canvasview")[0].offsetWidth;
  $("#canvasview")[0].height = $("#canvasview")[0].offsetHeight;
  ctx.width = $("#canvasview")[0].width;
  ctx.height = $("#canvasview")[0].height;
}

//current colour of the line
let col = $("#colorpicker")[0].value;
//current width of the line
let lineWid = 3;

let erase = false;

$(document).click(function(){
  if(!erase)
    col = $("#colorpicker")[0].value;
});

$('#pencil')[0].click(function(){col = $("#colorpicker")[0].value;});
$('#eraser')[0].click(function(){col = "#e2ebf0"; alert();});


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

$("#canvasModal")[0].click(function(){

  //generate prompt
  if(listOfPrompts.length > 1){
    let randInt = Math.floor(Math.random() * 10);
    let currentPrompt = listOfPrompts[randInt];
    listOfPrompts.splice(randInt, randInt+1);
  }
  else
    return;

  clearCanvas();

  const timeLimit = 10;
  let timeLeft = timeLimit;

  $("#startModal").style.display = "none";

  $("#timeRemaining").innerHTML = timeLeft + " seconds left";

  let intervalTimer = setInterval(function f(){
    timeLeft--;

    switch(timeLeft){
      case 1:
        $("#timeRemaining").innerHTML = timeLeft + " second left";
        break;
      case -1:
        clearInterval(intervalTimer);
        break;
      default:
        $("#timeRemaining").innerHTML = timeLeft + " seconds left";
        break;
    }
    
    $("#timeRemaining").innerHTML = timeLeft;
    console.log(timeLeft);
  },1000);
  
  document.getElementById('startModal').style.display = "initial";
});

function setTimer(time){
  $("#timer").innerHTML = time;
  console.log();
}
function w(){};


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
}
function eraser(){
  erase = true;
  col = "#e2ebf0"; 
  console.log(col);
}
