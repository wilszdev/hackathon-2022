api_get_recent((results)=>{
  for (let i = 0; i < results.length && i < 6; ++i) {
    res = results[i]
    let n = i + 1;
    $(`#image${n}`).attr('src', `data:image/png;base64,${res.img}`);
    $(`#prompt${n}`).text(res.description);
    $(`#score${n}`).text(res.score);
    $(`#element${n}`).show();
  }
  for (let i = results.length; i < 6; ++i)
  {
    let n = i + 1;
    $(`#element${n}`).hide();
  }
});
