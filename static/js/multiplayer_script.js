function displayAll() {
  api_get_recent((results)=>{
    for (let i = 0; i < results.length; ++i) {
      let n = i + 1;
      $(`#image${n}`).attr('src', `data:image/png;base64,${results.img}`)
      $(`#prompt${n}`).text(results.desc)
      $(`#score${n}`).text(results.score)
    }
  });
};

interval = setInterval(() => {
  displayAll();
}, 5000);
