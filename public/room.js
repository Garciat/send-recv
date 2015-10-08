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
        var content = rawMessage.content;
        var parsed = marked(content);
        
        return {
            isURL: content.indexOf('http') >= 0,
            content: content,
            htmlContent: $sce.trustAsHtml(parsed)
        };
    }
    
    function fetchMessages() {
        $http.get('/rooms/' + roomId + '/messages').then(function (response) {
            $scope.messages = response.data.reverse().map(parseMessage);
        });
    }
    
    function sendMessage(message) {
        $scope.sending = true;
        
        $http.post('/rooms/' + roomId + '/messages', message).then(function () {
            $scope.editor.content = '';
            $scope.sending = false;
        });
    }
    
    function blobToDataURL(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var dataURL = event.target.result;
                resolve(dataURL);
            };
            reader.readAsDataURL(blob);
        });
    }
    
    function loadImage(url) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function(event) {
                resolve(image);
            };
            image.src = url;
        });
    }
    
    function downscaleImage(source) {
        var canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0);
        return canvas.toDataURL('image/webp', 0.2);
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
        
        blobToDataURL(blob)
        .then(loadImage)
        .then(downscaleImage)
        .then(function (dataURL) {
            sendMessage({ content: '![](' + dataURL + ')' });
        })
    };
    
    $scope.sendMessage = function () {
        sendMessage($scope.editor);
    };
    
    socket.on('update', function () {
        fetchMessages();
    })
    
    fetchMessages();
    
    socket.emit('join room', roomId);
    
});
