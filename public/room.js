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
    
    function sendMessage(message) {
        $http.post('/rooms/' + roomId + '/messages', message).then(function () {
            $scope.editor.content = '';
            $scope.sending = false;
        });
    }
    
    $scope.getSendButtonClasses = function () {
        return {
            'btn-default': !$scope.editor.content,
            'btn-primary': $scope.editor.content,
            'btn-warning': $scope.sending
        };
    };
    
    $scope.acceptPaste = function (event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        if (items[0].type == 'text/plain') return;
        var blob = items[0].getAsFile();
        var reader = new FileReader();
        reader.onload = function(event) {
            var dataURL = event.target.result;
            sendMessage({ content: '![](' + dataURL + ')' });
        };
        reader.readAsDataURL(blob);
    };
    
    $scope.sendMessage = function () {
        $scope.sending = true;
        
        sendMessage($scope.editor);
    };
    
    socket.on('update', function () {
        fetchMessages();
    })
    
    fetchMessages();
    
    socket.emit('join room', roomId);
    
});
