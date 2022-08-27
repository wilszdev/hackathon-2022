const path = require('path');
const express = require('express');
const app = express();

var bodyParser = require("../node_modules/body-parser");
const server = require('http').Server(app);
const io = require('socket.io')(server);

var {spawn} = require("child_process"); 

const PORT = 3000;

///
var client_list = [];

app.use(express.static(path.join(__dirname, '/')));
app.set('css', __dirname + '/css');
//app.use(bodyParser.urlencoded({ extended:false }));

console.log('App active: navigate to THISDEVICEIPADDRESS:3000');

var subProcess = spawn('python',["api/flaskapp.py"]); 

app.get("/", (req,res)=> { 
    res.sendFile(path.join(__dirname, './index.html'));

    var subProcess = spawn('python',["api/flaskapp.py"]); 

    subProcess.stdout.on('data', function(data) {
        console.log(data.toString('ascii'));
    });
    
    subProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    subProcess.stderr.on('data', (data)=>{
        console.log(data);
    });
});


io.on('connect', (socket)=>{
    console.log('New Client Connected');
    var client_ip_addr = (socket.request.connection.remoteAddress).substring(7);
    console.log(client_ip_addr + " , " + socket.id);

    socket.on('disconnect', () => {
        console.log("User Disconnected");

        remove_client(socket.id, client_ip_addr);
        io.emit("UpdateClientList", client_list);
        console.log(client_list);

    });

    add_client(socket.id, client_ip_addr);
    io.emit("UpdateClientList", client_list);
    console.log(client_list);

    // CMulti = Challenge Multiplayer
    socket.on("CMulti", function(data) {
        var sender = data[0];
        var receiver = data[1];
        console.log("Challenge proposal received! From: " + sender + " to " + receiver);
        //need to get receiver id
        io.to(receiver).emit('IncomingChallenge', sender);
    });

    socket.on("CAccepted", function(data) {
        io.to(data).emit("MultiGameBeginning", "");
    });
});

io.on('connect_error', function(err) {
    console.log("client connect_error: ", err);
});
io.on('connect_timeout', function(err) {
    console.log("client connect_timeout: ", err);
});

function get_client_list() {
    return client_list;
}

function add_client(id, addr) {
    if (client_list.includes(id, addr) == false) {
        client_list.push([id, addr]);
    }
}

function remove_client(id, addr) {
    for (var i=0;i<client_list.length;i++) {
        if (client_list[i][1] == addr) {
            client_list.splice(i,1);
        }
    }
}

server.listen(PORT);