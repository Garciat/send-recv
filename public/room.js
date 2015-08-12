'use strict';

var app = angular.module('send-recv', ['btford.socket-io']);

app.factory('socket', function (socketFactory) {
    return socketFactory();
});

app.controller('RoomCtrl', function ($scope, $sce, $http, $location, socket) {
    var roomId = window.location.pathname.split('/').slice(-1)[0];
    
    $scope.messages = [];
    $scope.editor = {
        content: ''
    };
    
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
        $http.post('/rooms/' + roomId + '/messages', $scope.editor).then(function () {
            $scope.editor.content = '';
        });
    };
    
    socket.on('update', function () {
        fetchMessages();
    })
    
    fetchMessages();
    
    socket.emit('join room', roomId);
    
});