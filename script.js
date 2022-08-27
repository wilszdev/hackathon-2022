// get canvas 2D context and set him correct size
let ctx = document.getElementById('canvasview').getContext('2d');
resize();

// last known position
let pos = { x: 0, y: 0 };

window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.offsetX;
  pos.y = e.offsetY;
}

// resize canvas
function resize() {
  $("#canvasview").width = $("#canvasview").offsetWidth;
  $("#canvasview").height = $("#canvasview").offsetHeight;
  ctx.width = $("#canvasview").width;
  ctx.height = $("#canvasview").height;
}

//current colour of the line
let col = document.getElementById('colorpicker').value;
//current width of the line
let lineWid = 3;

console.log();
document.addEventListener("click",function(){
  col = document.getElementById('colorpicker').value;
});

function draw(e) {
  console.log(col);
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

$("#nameButton").click(function(){
  $("#nameScore").innerHTML = $('#nameInput').value+": ";
  hideNameModal();
});

$("#startModal").click(function(){
  const timeLimit = 2;
  let timeLeft = timeLimit;

  $("#startModal").style.display = "none";

  $("#timer").innerHTML = timeLeft;

  let intervalTimer = setInterval(function f(){
    timeLeft--;
    $("#timer").innerHTML = timeLeft;
    
    if(timeLeft <= 0){
      clearInterval(intervalTimer);
    }
    console.log(timeLeft);
  },1000);
  
  //document.getElementById('startModal').style.display = "block";
});

function setTimer(time){
  $("#timer").innerHTML = time;
  console.log();
}
function w(){};