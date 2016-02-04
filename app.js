
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
	 path = require('path'),
    //nicknames = [];
    users = {};
//var sanitize= require('validator');
server.listen(8082);

//connecting to mongoDb
mongoose.connect('mongodb://mubeen:aptech@ds060968.mongolab.com:60968/chat',function(err)
                    {
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            console.log("Connected to mongoDb");
                        }

                    });

//creating schema in mongodb

        var chatSchema = mongoose.Schema({
        nick:String,
            msg:String,
            created:{type:Date,default:Date.now}

        });
//creating model in mongoDb
var Chat = mongoose.model("Message",chatSchema);


app.use(express.static(path.join(__dirname, 'public')));

//routing on server
app.get('/chat', function (req, res) {

    res.sendfile(__dirname+'/public/index.html');
});



//Connection open on socket
io.sockets.on('connection',function(socket){
    //Get old messages on chat box with limit of 8 msgs
    var query = Chat.find({});
    //for desc "-created" or for asc "created" sort by created date property
    query.sort('-created').limit(8).exec(function(err,docs){
        if(err) throw  err;
         socket.emit('load old msgs',docs);
    });

    //if we dont want limit so write this code shown below
    //Chat.find({},function(err,docs){
    //
    //    if(err) throw  err;
    //    socket.emit('load old msgs',docs);
    //})


    //Getting nick names
    socket.on('new user', function (data,callback) {
        //checking of nicknames
        if(data in users)
        {
            callback(false);

        }
        else
        {
            callback(true);
            socket.nickname = data;
            //nicknames.push(socket.nickname);
            users[socket.nickname] = socket;
            updateNicknames();

        }
    });

    //when user disconnect
    socket.on('disconnect', function (data) {

        if(!socket.nickname)
		
        return;
		io.sockets.emit('diconnected user',{nick:socket.nickname});
        delete  users[socket.nickname];
        //nicknames.splice(nicknames.indexOf(socket.nickname),1);
        updateNicknames();
		
    });

    //update username list
    function updateNicknames()
    {
        io.sockets.emit('usernames',Object.keys(users));
    }

    //Receive msg on server
    socket.on('send message',function(data,callback){

        //var validate = sanitize(data).escape();
        //Checking msg


        //send msg to everyone include me
        var msg = data.trim();
        if(msg.substr(0,3)==='/w ')
        {
            msg = msg.substr(3);
            var ind = msg.indexOf(' ');
            if(ind !== -1)
            {
                var name = msg.substring(0,ind);
                var msg = msg.substring(ind+1);
                if(name in users)
                {
                    users[name].emit('whisper',{msg:msg,nick:socket.nickname});
                    console.log("whisper");
                }
                else
                {
                    callback("Error! Please Enter a valid user name");
                }

            }
            else
            {
                callback("Error! Please Enter your message");
            }

        }
        else
        {
            var newMsg = new Chat({msg:msg,nick:socket.nickname});
            newMsg.save(function (err) {
                if(err) throw err;
                io.sockets.emit('new message',{msg:msg,nick:socket.nickname});

            });

        }


        //send msg to everyone except me
        //socket.broadcast.emit('new message',data);


    });

});














