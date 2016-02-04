 jQuery(function($)
            {
				var socket = io.connect();
				var $nickForm = $('#setNick');
				var $nickError = $('#nickError');
				var $nickBox = $('#nickname');
				var $users = $('#users');
				var $messageBox = $('#message');
				var $chat = $('#chat');
				var $messageForm = $('#send-message');
				
				
				
				
				//set nick name
                $nickForm.submit(function(e){
                    e.preventDefault();
                    socket.emit("new user",$nickBox.val(),function(data){
                        //show error if name is not available
                        if(data)
                        {//
                            //window.location.replace("/chat");
							$('.login-page').hide();
                            $('.container').show();
                        }
                        else
                        {
                            $nickError.html('That username is already taken! Try again');
                        }
                    });
					});
					
					
					
					//show online users
                socket.on('usernames', function (data) {
                    var html = '';
                for(var i=0;i<data.length;i++)
                {
                    html+="<img src='assets/img/photo.jpg' width='64px' height='64px' alt='bootstrap Chat box user image' class='img-circle' />  -  "+data[i]+"<hr class='hr-clas-low' />";
					console.log("username"+data[i]);
                }
                    $users.html(html);
                });
				
				
				//diconnect users
				socket.on('diconnected user', function (data){
					
					console.log('disconnect');
					$chat.append('<div class="plain-msg"><b>'+data.nick+ '</b> left the conversation</div><hr class="hr-clas" />');
					
					});
				
				
				
				//send message to server
                $messageForm.submit(function(e){
                    e.preventDefault();
                    socket.emit('send message',$messageBox.val(), function (data) {
                        $chat.append('<div class="chat-box-error">'+data+ '</div><hr class="hr-clas" />');
                    });
                    $messageBox.val("");

                });

                //show old msgs on chat box
                socket.on('load old msgs', function (docs) {
                    for(var i=docs.length-1;i>=0;i--)
                    {
                        displayMsg(docs[i]);
                    }

                });


                //receive message from server
                socket.on('new message',function(data){
                    displayMsg(data);
                });

                //Display function for old msgs
                function displayMsg(data)
                {
                    $chat.append('<div class="chat-box-left">'+data.msg+'</div><div class="chat-box-name-left"><img src="assets/img/photo.jpg"  alt="bootstrap Chat box user image" class="img-circle" /> - '+data.nick+'</div><hr class="hr-clas" />');

                }
			
			
			});