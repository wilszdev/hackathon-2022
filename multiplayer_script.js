var xCursorPosition = -1;
var yCursorPosition = -1;
function getCursorPosition(event) {
  xCursorPosition = event.clientX;
  yCursorPosition = event.clientY;
  console.log("xCursorPosition "+xCursorPosition+" yCursorPosition "+yCursorPosition);
}

$("#nameButton").click(function name(){
  console.log($('#nameButton').val());
  hideNameModal();
});

function submit_image(callback) {
  canvas.toBlob((blob) => {
    api_submit_prompt(currentPromptId, blob, (response) => {
      callback(response.score, response.categories)
    });
  }, "image/png");
}