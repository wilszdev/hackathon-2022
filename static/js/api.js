const baseUrl = "https://gothic-welder-360715.ts.r.appspot.com/api/prompts/"

function api_xhr(method, url, data, callback) {
    req = new XMLHttpRequest();
    req.open(method, url, true);

    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            callback(req.response)
        }
    };
    
    req.send(data)
}

function api_get_prompt(callback) {
    url = baseUrl + 'new'

    api_xhr("POST", url, null, (raw_response) => {
        response = JSON.parse(raw_response);
        callback(response)
    });
}

function api_submit_prompt(prompt_guid, blob, callback) {
    url = baseUrl + prompt_guid + '/submit'

    api_xhr("POST", url, blob, (raw_response)=>{
        response = JSON.parse(raw_response);
        callback(response)
    });
}