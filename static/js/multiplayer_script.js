function displayAll() {
  for (let i = 0; i < 6; ++i) {
    let n = i + 1;
    $(`#image${n}`).hide()
    $(`#prompt${n}`).hide()
    $(`#score${n}`).hide()
  }
  
  api_get_recent((results)=>{
    for (let i = 0; i < results.length; ++i) {
      res = results[i]
      let n = i + 1;
      $(`#image${n}`).attr('src', `data:image/png;base64,${res.img}`)
      $(`#prompt${n}`).text(res.description)
      $(`#score${n}`).text(res.score)
      $(`#image${n}`).show()
      $(`#prompt${n}`).show()
      $(`#score${n}`).show()
    }
  });
};

interval = setInterval(() => {
  displayAll();
}, 5000);
