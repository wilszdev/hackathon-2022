// create canvas element and append it to document body
let canvas = document.getElementById('mainCanvas');

// get canvas 2D context and set him correct size
let ctx = canvas.getContext('2d');
resize();

// last known position
let pos = { x: 0, y: 0 };

window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.offsetX-50;
  pos.y = e.offsetY-20;
}

// resize canvas
function resize() {
  ctx.canvas.width = document.getElementById('mainCanvas').width;
  ctx.canvas.height = document.getElementById('mainCanvas').height;
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin

  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c0392b';
  
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