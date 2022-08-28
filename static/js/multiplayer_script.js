function displayAll() {
  api_get_recent((results)=>{
    for (let i = 0; i < results.length; ++i) {
      res = results[i]
      let n = i + 1;
      $(`#image${n}`).attr('src', `data:image/png;base64,${res.img}`)
      $(`#prompt${n}`).text(res.desc)
      $(`#score${n}`).text(res.score)
    }
  });
};

interval = setInterval(() => {
  displayAll();
}, 5000);
