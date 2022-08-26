// create canvas element and append it to document body
let canvas = document.getElementById('mainCanvas');

// get canvas 2D context and set him correct size
let ctx = canvas.getContext('2d');
resize();

// last known position
let pos = { x: 0, y: 0 };

//current colour of the line
let col = '#c0392b';
//current width of the line
let lineWid = 1;

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
  canvas.width = document.getElementById('mainCanvas').offsetWidth;
  canvas.height = document.getElementById('mainCanvas').offsetHeight;
  ctx.canvas.width = canvas.width;
  ctx.canvas.height = canvas.height;
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

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
  document.getElementsByClassName("nameCollector")[0].style.display = "none";
  document.getElementsByClassName("nameCollector")[0].style.opacity = 0;
}

document.getElementById('nameButton').addEventListener("click",function(){
  document.getElementById("nameScore").innerHTML = document.getElementById('nameInput').value+": ";
  hideNameModal();
});

document.getElementById('startModal').addEventListener("click",function(){
  const timeLimit = 2;
  let timeLeft = timeLimit;

  document.getElementById('startModal').style.display = "none";

  document.getElementById('timer').innerHTML = timeLeft;

  let intervalTimer = setInterval(function f(){
    timeLeft--;
    document.getElementById('timer').innerHTML = timeLeft;
    
    if(timeLeft <= 0){
      clearInterval(intervalTimer);
    }
    console.log(timeLeft);
  },1000);
  
  //document.getElementById('startModal').style.display = "block";
});

function setTimer(time){
  document.getElementById('timer').innerHTML = time;
  console.log();
}
function w(){}