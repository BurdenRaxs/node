//服务器及页面响应部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
    users=[];
    app.use('/', express.static(__dirname + '/public'));
    server.listen(80);

//socket部分
io.on('connection', function(socket) {
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称
        }
    });
    socket.on('disconnect', function() {
        //将断开连接的用户从users中删除
        users.splice(socket.userIndex, 1);
        //通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
});