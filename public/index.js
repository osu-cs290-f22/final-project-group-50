const singlePlayerButton = document.getElementById('single-player-button');
const multiPlayerButton = document.getElementById('multi-player-button');

const joinLobbyButton = document.getElementById('join-lobby-button');
const createLobbyButton = document.getElementById('create-lobby-button');
const roomIdNum = document.getElementById('room-id-num');


/**
 * Creates event listeners for current URL
*/
var slashSplit = window.location.href.split('/');
if(slashSplit[slashSplit.length-1]==='home'){
	singlePlayerButton.addEventListener('click', () => window.location.href="/solo");
	multiPlayerButton.addEventListener('click', () => window.location.href="/multiplayer");
} else if (slashSplit[slashSplit.length-1]==='multiplayer'){
	console.log('multi')
	joinLobbyButton.addEventListener('click', joinLobby)
	createLobbyButton.addEventListener('click', createLobby)
}

/**
 * asks server to join lobby
*/
function joinLobby(event){
	//ask server if lobby exists
	//join lobby
	var roomId = roomIdNum.value.padStart(4, '0');
	var socket = io();
	socket.emit('join-room', roomId, (response) => {
		if(response) {
			window.location.href="/multiplayer/"+roomId;
		}
		else
			console.log("That room is unavailable");
	});
}

/**
 * asks server to create lobby
 * joins lobby once created (if server is not full)
*/
function createLobby(event){
	//create the lobby
	var socket = io();
	socket.emit('make-room', (response) => {
		if(response){
			window.location.href = '/multiplayer/'+response.roomId;
		} else
			console.log('server is full');
	});
}