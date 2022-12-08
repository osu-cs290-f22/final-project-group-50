const rows = document.querySelectorAll('.row');
const readyButton = document.querySelector("#ready-button");
const forfeitButton = document.querySelector("#forfeit-button");
const infoDisplay = document.querySelector('#info-display');
const turnDisplay = document.querySelector("#turn-display");
const playAgainButton = document.querySelector('#play-again-button');
const p1_connected_span = document.querySelector('.p1 .player .connected span');
const p1_connected_text = document.querySelector('.p1 .player .connected');
const p2_connected_span = document.querySelector('.p2 .player .connected span');
const p2_connected_text = document.querySelector('.p2 .player .connected');
const p1_ready_span = document.querySelector('.p1 .player .ready span');
const p1_ready_text = document.querySelector('.p1 .player .ready');
const p2_ready_span = document.querySelector('.p2 .player .ready span');
const p2_ready_text = document.querySelector('.p2 .player .ready');

let currentPlayer = true; // true = player 1
let playerNum = 0; // 0 for single player. 1 & 2 for multiplayer
let ready  = false;
let enemyReady = false;
let roomId = '';

/**
 * Main function for multiplayer logic
*/
function startMultiPlayer(){
	// Get roomId from URL
	roomId = window.location.href.split('/')[window.location.href.split('/').length-1];

	// Instantiate Socket
	const socket = io();

	// Get Your Player Num
	socket.emit('get-player-num', roomId, (pNum) => getPlayerNum(socket, pNum));

	// update the status lights
	socket.on('status-change', (status) => updateStatus(status))

	// On enemy ready
	socket.on('enemy-ready', () => onEnemyReady());

	// Ready button click
	readyButton.addEventListener('click', () => readyButtonListener(socket));

	//play again button clicked
	playAgainButton.addEventListener('click', () => playAgain(socket));

	// forfeit button clicked
	forfeitButton.addEventListener('click', () => forfeit(socket));

	// setup tile listeners
	setupTileListeners(socket);

	// on mark recieved
	socket.on('mark', (id, val, boardData) => markCell(id, val, boardData))

	// on game over
	socket.on('game-over', (winner) => gameOver(socket, winner));

	// on board clear
	socket.on('clear-board', (boardData) => clearBoard(socket, boardData));

	// update score
	socket.on('update-score', (score) => updateScore(score))
}

/**
 * Displayes the current turn's active player 
*/
function vsPlay(){
	if(ready && enemyReady) {
		if(currentPlayer===true){
			turnDisplay.textContent = "Your Go"
		}
		if(currentPlayer===false){
			turnDisplay.textContent = "Enemy's Go"
		}
	}
}

/**
 * Updates the Client's Displayed Ready Status 
*/
function playerReady(){
	if((ready && playerNum===1) || (enemyReady&&playerNum===2)){
		p1_ready_span.classList.add('green');
		p1_ready_text.classList.remove('inactive');
	}
	if((ready && playerNum===2) || (enemyReady&&playerNum===1)){
		p2_ready_span.classList.add('green');
		p2_ready_text.classList.remove('inactive');
	}
	if((!ready && playerNum===1) || (!enemyReady&&playerNum===2)){
		p1_ready_span.classList.remove('green');
		p1_ready_text.classList.add('inactive');
	}
	if((!ready && playerNum===2) || (!enemyReady&&playerNum===1)){
		p2_ready_span.classList.remove('green');
		p2_ready_text.classList.add('inactive');
	}
}

/**
 * Callback Function to get playerNum from server 
*/
function getPlayerNum(socket, pNum){
	playerNum = parseInt(pNum);

	playerConnectedOrDisconnected(playerNum)

	// Join SocketIO Room
	socket.emit('join-socket-room', roomId, playerNum)
	disableBoard();

	// Get Ready Statuses
	socket.emit('get-ready-status', roomId, (player_ready) => getReadyStatus(player_ready));
}

/**
 * Updates the Client's Programmatic Ready Statuses 
*/
function getReadyStatus(player_ready){
	if(playerNum === 1) {
		ready = player_ready.p1_ready;
		enemyReady = player_ready.p2_ready;
	} else if(playerNum === 2) {
		ready = player_ready.p2_ready;
		enemyReady = player_ready.p1_ready;
	}
	playerReady();
}

/**
 * Called When Server emits enemy-ready 
*/
function onEnemyReady() {
	enemyReady = true;
	playerReady(); //update ready lights
	vsPlay(); // attempt to start game
}

/**
 * handler for readyButton
 * Emits to the server that the player is ready
 * Hides Ready Button
*/
function readyButtonListener(socket){
	if(!ready){
		ready = true;
		playerReady();
		socket.emit('player-ready', roomId, playerNum, (cb) => {
			getCurrentPlayer(cb);
			if(currentPlayer) enableBoard(cb);
			vsPlay();
		});
	}
	readyButton.parentElement.classList.remove('ready-button-container');
	readyButton.parentElement.classList.add('hidden');
}

/**
 * Handler for Play Again Button 
*/
function playAgain(socket){
	// Hide the Modal
	document.getElementById('modal-backdrop').classList.toggle('hidden');
	document.getElementById('play-again-modal').classList.toggle('hidden');

	// Clear the Board
	socket.emit('clear-board', roomId); // also "un-ready"s all players
}

/**
 * Tells the server to clear the clients' boards
 * Increment the opposing player's score 
*/
function forfeit(socket) {
	socket.emit('clear-board', roomId);
	socket.emit('forfeit', roomId, playerNum);
}

/**
 * On server telling client to clear the board
 * clears the display board
 * unhides the ready button
 * asks server for player statuses (connection and disconnection)
 * gets current player, enables board for 'X'; disables board for 'O'
*/
function clearBoard(socket, boardData) {
	for(var i = 0; i < 3; i++){
		for(var j  = 0; j < 3; j++){
			rows[i].children[j].textContent = "";
		}
	}

	readyButton.parentElement.classList.add('ready-button-container');
	readyButton.parentElement.classList.remove('hidden');

	// Get Ready Statuses
	socket.emit('get-ready-status', roomId, (player_ready) => getReadyStatus(player_ready));

	getCurrentPlayer(boardData);
	if(currentPlayer) enableBoard(boardData);
	else disableBoard();
}

/**
 * Updates the Score
*/
function updateScore(score){
	document.querySelector('.p1.score').textContent = score.p1;
	document.querySelector('.p2.score').textContent = score.p2;
}

/**
 * Creates Listeners for board tiles
 *  - listener will emit to the server that it marked a board location
 *  - disables board
*/
function setupTileListeners(socket){
	for(var i = 0; i < 3; i++){
		for(var j  = 0; j < 3; j++){
			rows[i].children[j].addEventListener('click', (event) => {
				if(ready && enemyReady){
					socket.emit('mark', roomId, playerNum, event.target.id);
					disableBoard();
				}
			});
		}
	}
}

/**
 * On server informing which cell is marked
 *  - Marks the cell designated by server
*/
function markCell(id, val, boardData){
	document.getElementById(id).textContent = val;
	if(!currentPlayer){ // Enemy went
		enableBoard(boardData);
	}
	currentPlayer = !currentPlayer;
	vsPlay();
}

/**
 * updates the Connected and Ready Status for all Players
*/
function updateStatus(status) {
	if(status.player1){
		p1_connected_span.classList.add('green');
		p1_connected_text.classList.remove('inactive');
	}
	else{
		p1_connected_span.classList.remove('green');
		p1_connected_text.classList.add('inactive');
	}
	if(status.player2){
		p2_connected_span.classList.add('green');
		p2_connected_text.classList.remove('inactive');
	}
	else{
		p2_connected_span.classList.remove('green');
		p2_connected_text.classList.add('inactive');
	}
	if(status.p1_ready){
		p1_ready_span.classList.add('green');
		p1_ready_text.classList.remove('inactive');
	}
	else{
		p1_ready_span.classList.remove('green');
		p1_ready_text.classList.add('inactive');
	}
	if(status.p2_ready){
		p2_ready_span.classList.add('green');
		p2_ready_text.classList.remove('inactive');
	}
	else{
		p2_ready_span.classList.remove('green');
		p2_ready_text.classList.add('inactive');
	}
}

/**
 * Called when game is over
 *  - disables board (client side)
 *  - get's score from server
 *  - unhides replay modal
 *  - Displayed who won the game
*/
function gameOver(socket, winner){
	disableBoard();
	socket.emit('get-score', roomId, (score) => {
		document.querySelector('.p1.score').textContent = score.p1;
		document.querySelector('.p2.score').textContent = score.p2;
	})
	document.getElementById('modal-backdrop').classList.toggle('hidden');
	document.getElementById('play-again-modal').classList.toggle('hidden');
	var winnerText;
	if(winner===0) winnertext = "Cat's Game!";
	else if (winner===1) winnerText = "X Wins!";
	else if (winner===2) winnerText = "O Wins!";
	document.getElementById('winner').textContent = winnerText;
}

/**
 * gets current player by checking which player has the most marks on the board
 *  - X if num tile is same
 *  - O if X has more
*/
function getCurrentPlayer(boardData){
	var usedSpaces = Object.values(Object.fromEntries(Object.entries(boardData).filter(([key, val]) => val)));
	currentPlayer = (playerNum===1) // assume player1
	if(usedSpaces){ // board has been played on
		//find Mode
		var modeMap = {};
		var maxEl = usedSpaces[0];
		for(var i = 0; i < usedSpaces.length; i++){
			var el = usedSpaces[i];
			if(modeMap[el] == null)
				modeMap[el] = 1;
			else
				modeMap[el]++;
		}
		// modeMap ex: {'X': 2, 'O': 1}
		// 'X' val will always be >= 'O' val
		if((modeMap['X'] && modeMap['O']) && modeMap['X'] > modeMap['O']){
			currentPlayer = (playerNum===2);
		}
	}
}

/**
 * Updates the connection status of a player
*/
function playerConnectedOrDisconnected(num){
	let player = '.p' + (parseInt(num)) + " .player";
	document.querySelector(player + ' .connected span').classList.toggle('green')
	if(num===playerNum) document.querySelector('#player-'+num+"-name").style.fontWeight = 'bold';
}

/**
 * Enables the Spaces on the board that are empty
*/
function enableBoard(boardData){
	var freeSpaces = Object.keys(Object.fromEntries(Object.entries(boardData).filter(([key, val]) => !val)));
	freeSpaces.forEach(e => document.getElementById(e).disabled = false);
}

/**
 * Disables all board tiles
*/
function disableBoard(){
	for(var i = 0; i < 3; i++){
		for(var j  = 0; j < 3; j++){
			rows[i].children[j].disabled = true;
		}
	}
}

export default startMultiPlayer