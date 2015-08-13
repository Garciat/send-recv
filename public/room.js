'use strict';

var app = angular.module('send-recv', ['btford.socket-io', 'ja.qr']);

app.factory('socket', function (socketFactory) {
    return socketFactory();
});

app.controller('RoomCtrl', function ($scope, $sce, $http, $location, socket) {
    var roomId = window.location.pathname.split('/').slice(-1)[0];
    
    $scope.qrText = window.location.toString();
    $scope.messages = [];
    $scope.editor = {
        content: ''
    };
    $scope.sending = false;
    
    function parseMessage(rawMessage) {
        var parsed = marked(rawMessage.content);
        
        return {
            htmlContent: $sce.trustAsHtml(parsed)
        };
    }
    
    function fetchMessages() {
        $http.get('/rooms/' + roomId + '/messages').then(function (response) {
            $scope.messages = response.data.reverse().map(parseMessage);
        });
    }
    
    $scope.sendMessage = function () {
        $scope.sending = true;
        
        $http.post('/rooms/' + roomId + '/messages', $scope.editor).then(function () {
            $scope.editor.content = '';
            $scope.sending = false;
        });
    };
    
    socket.on('update', function () {
        fetchMessages();
    })
    
    fetchMessages();
    
    socket.emit('join room', roomId);
    
});
