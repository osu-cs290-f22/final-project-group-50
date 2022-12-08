const express = require("express")
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const expressHandlebars = require('express-handlebars')
const editJsonFile = require('edit-json-file')
const fs = require('fs')
let serverData = editJsonFile('./serverData.json')

//register handlebars engine with express
app.engine('handlebars', expressHandlebars.engine({
	defaultLayout: "main"
}));
app.set('view engine', 'handlebars');

//set static folder
app.use(express.static('public/'));

//start server
server.listen(PORT, () => console.log('== Server running on port', PORT));

//Front Page
app.get('/', (req, res, next) => {
	res.redirect('/home')
});
app.get('/home', (req, res, next) => {
	res.status(200).render('frontPage');
})

//Solo Play Page
app.get('/solo', (req, res, next) => {
	var board = {
		topLeft: "",
		topCenter: "",
		topRight: "",
		midLeft: "",
		midCenter: "",
		midRight: "",
		botLeft: "",
		botCenter: "",
		botRight: ""
	}
	res.status(200).render('gamePage', {multiplayer: false, p1: "Human", p2: "Computer", board: [board]});
});

//Multiplayer Select Page
app.get('/multiplayer', (req, res, next) => {
	res.status(200).render('multiplayerSelectPage')
})

//Multiplayer Page
app.get('/multiplayer/:n', (req, res, next) => {
	try{
		var n = req.params.n;
		if(parseInt(n)!==-1){ // make sure it isn't trying to load the filler room
			var {roomId: _, player1: _, player2: _, p1_ready: _, p2_ready: _, score: _, ...boardData} = serverData.get("gameRooms").find(o => o.roomId===n);
			if(boardData){
				console.log("== A player has joined game lobby", n + '.');
				res.status(200).render('gamePage', {multiplayer: true, roomId: n, p1: "Player 1", p2: "Player 2", board: [boardData]});
			} else res.redirect('/404');
		} else res.redirect('/404');
	} catch (e) {
		res.redirect('/404');
	}
});

//404 Page
app.get('*', (req, res, next) =>{
	res.status(404).render('404');
});


// ---- Socket.IO ----

//Handle a socket connection request from web client
io.on('connection', socket => {
	console.log('New WS connection')

	// on join room request
	socket.on('join-room', (roomId, callback) => joinRoom(roomId, callback));

	// on create room reequest
	socket.on('make-room', (callback) => makeRoom(callback));

	// Get Player Num
	socket.on('get-player-num', (roomId, callback) => getPlayerNum(roomId, callback));

	// Client Room Join Request
	socket.on('join-socket-room', (roomId, playerNum) => joinSocketRoom(socket, roomId, playerNum));

	// Get Ready Status
	socket.on('get-ready-status', (roomId, callback) => getReadyStatus(roomId, callback))

	// On ready
	socket.on('player-ready', (roomId, playerNum, callback) => playerReady(socket, roomId, playerNum, callback));

	// Initiate Game Logic
	socket.on('mark', (roomId, playerNum, cellId) => markCell(socket, roomId, playerNum, cellId));

	// Get Score
	socket.on('get-score', (roomId, callback) => getScore(roomId, callback));

	// On Clear Board
	socket.on('clear-board', (roomId) => clearBoard(roomId));

	// On Player Forfeit
	socket.on('forfeit', (roomId, playerNum) => forfeit(socket, roomId, playerNum))

	//Handle player disconnect
	socket.on('disconnecting', () => disconnecting(socket));
})

/**
 * Makes a room in serverData (id is lowest number available in server)
 *  - server can hold 10000 games
*/
function makeRoom(callback){
	//reinitialize serverData
	serverData = editJsonFile('./serverData.json');

	//check to see if server is full
	if(serverData.get("gameRooms").length===10000) callback(false);
	else {
		//get the lowest roomId
		var id = serverData.get("gameRooms").reduce((prev, curr) => {
			return (prev.roomId < curr.roomId) ? prev.roomId : curr.roomId;
		});
		// increment id by 1 and format
		id = (parseInt(id) + 1).toString().padStart(4, '0');

		//make room
		serverData.append('gameRooms', {
			"roomId": id,
			"player1": false,
			"p1_ready": false,
			"player2": false,
			"p2_ready": false,
			"score": {
				"p1": 0,
				"p2": 0
			},
			"topLeft": "",
			"topCenter": "",
			"topRight": "",
			"midLeft": "",
			"midCenter": "",
			"midRight": "",
			"botLeft": "",
			"botCenter": "",
			"botRight": ""
		})
		serverData.save();
		callback({roomId: id, playerNum: 1});
	}
}

/**
 * Attempts to join a room given  a room ID
*/
function joinRoom(roomId, callback){
	//reinitialize serverData
	serverData = editJsonFile('./serverData.json');

	var roomData = serverData.get("gameRooms").find(o => o.roomId===roomId);
	if(roomData && !(roomData.player1 && roomData.player2)) // room is avalable and not full
		if(roomData.player1){
			callback(2);
		}
		else {
			callback(1);
		}
	else {
		callback(false);
	}
}

/**
 * Returns a players number upon request
*/
function getPlayerNum(roomId, callback) {
	var gameData = serverData.get('gameRooms').find(o => o.roomId === roomId);
	callback((!gameData.player1) ? 1 : 2);
}

/**
 * Puts player in a socketio room
 * emits the change in status of all players to all players
*/
function joinSocketRoom(socket, roomId, playerNum){
	console.log("== join socket room pNum:",playerNum)
	var roomData = serverData.get("gameRooms").find(o => o.roomId===roomId);

	// Join the Room
	socket.join(roomId.toString())
	
	// Put ID in serverData
	if(playerNum===1)
		roomData.player1 = socket.id;
	else if(playerNum===2)
		roomData.player2 = socket.id;
	serverData.save();

	io.to(roomId).emit('status-change', {
				player1: roomData.player1, 
				player2: roomData.player2, 
				p1_ready: roomData.p1_ready, 
				p2_ready: roomData.p2_ready});
}

/**
 * Returns the ready status of all players upon request
*/
function getReadyStatus(roomId, callback) {
	var gameData = serverData.get('gameRooms').find(o => o.roomId===roomId);
	callback({p1_ready: gameData.p1_ready, p2_ready: gameData.p2_ready})
}

/**
 * Handles a player clicking the ready button
 * Emits to all other players in room that the player is ready
 * returns the boardData
*/
function playerReady(socket, roomId, playerNum, callback){
	socket.to(roomId.toString()).emit('enemy-ready');
	var roomData = serverData.get("gameRooms").find(o => o.roomId===roomId);
	var {roomId: _, player1: _, player2: _, p1_ready: _, p2_ready: _, score: _, ...boardData} = roomData;
	if(playerNum===1)
		roomData.p1_ready = true;
	else if (playerNum===2)
		roomData.p2_ready = true;	
	serverData.save();
	callback(boardData)
}

/**
 * Handles a cell being marked
 *  - checks to see if there was a winner
 *    - if winner update serverData's score count accordingly
*/
function markCell(socket, roomId, playerNum, cellId){
	// Update sever with new info
	var gameData = serverData.get("gameRooms").find(o => o.roomId===roomId);
	gameData[cellId] = (parseInt(playerNum)===1) ? 'X' : 'O';
	serverData.save();

	// Inform client boards of change
	var {roomId: _, player1: _, player2: _, p1_ready: _, p2_ready: _, score: _, ...boardData} = gameData;
	io.to(roomId.toString()).emit('mark', cellId, gameData[cellId], boardData);

	// make game board from JSON data
	let board = [gameData['topLeft'], gameData['topCenter'], gameData['topRight'],
				 gameData['midLeft'], gameData['midCenter'], gameData['midRight'],
				 gameData['botLeft'], gameData['botCenter'], gameData['botRight']];
	// check if game over
	if((board[0] && (board[0] === board[1] && board[1] === board[2])) //top row
	|| (board[3] && (board[3] === board[4] && board[4] === board[5])) //middle row
	|| (board[6] && (board[6] === board[7] && board[7] === board[8])) //bottom row

	|| (board[0] && (board[0] === board[3] && board[3] === board[6])) //left column
	|| (board[1] && (board[1] === board[4] && board[4] === board[7])) //center column
	|| (board[2] && (board[2] === board[5] && board[5] === board[8])) //right column

	|| (board[0] && (board[0] === board[4] && board[4] === board[8])) //top left -> bottom right diagonal
	|| (board[2] && (board[2] === board[4] && board[4] === board[6]))){//top-left -> bottom left diagonal
		//Tell clients who won
		io.to(roomId.toString()).emit('game-over', playerNum);

		//update score in serverData
		gameData['score']['p'+playerNum]++;
		serverData.save();
	} else {

		//check for cat's game
		var cat = true;
		for(var i = 0; i < board.length; i++)
			if(!board[i]) cat = false;
		if(cat)
			io.to(roomId).emit('game-over', 0);
	}
}

/**
 * returns the room's score data upon request
*/
function getScore(roomId, callback){
	var roomData = serverData.get("gameRooms").find(o => o.roomId===roomId);
	callback(roomData.score)
}

/**
 * Handles player  forfiet by increasing opponent score
*/
function forfeit(socket, roomId, playerNum) {
	var roomData = serverData.get("gameRooms").find(o => o.roomId===roomId);
	var enemyNum = (playerNum===1) ? 2 : 1;
	roomData['score']['p'+enemyNum]++;
	getScore(roomId, (response) => {
		io.to(roomId).emit('update-score', response)
	})
}

/**
 * Handles Board Clear request
 *  - Clears the serverData Board
 *  - sets player ready values to false
 *  - tells all players to clear their boards
*/
function clearBoard(roomId){
	//clear the server board
	var roomData = serverData.get("gameRooms").find(o => o.roomId===roomId);
	roomData.topLeft = "";
	roomData.topCenter = "";
	roomData.topRight = "";
	roomData.midLeft = "";
	roomData.midCenter = "";
	roomData.midRight = "";
	roomData.botLeft = "";
	roomData.botCenter = "";
	roomData.botRight = "";
	serverData.save();
	
	//"un ready" players
	roomData.p1_ready = false;
	roomData.p2_ready = false;

	//emit clearboard to client
	var {roomId: _, player1: _, player2: _, p1_ready: _, p2_ready: _, score: _, ...boardData} = roomData;
	io.to(roomId).emit('clear-board', boardData);
}

/**
 * Handles player disconnection
 *  - sets playr's connection and ready statuses to false
 *  - emits a status change to all other players
 *  - deletes the room in serverData if no one is in it anymore
*/
function disconnecting(socket){
	var roomId = Array.from(socket.rooms)[1];
	//If player disconnecting from game room
	if(roomId){
		var roomData = serverData.get("gameRooms").find(o => o.roomId === roomId);
		if(roomData.player1 === socket.id){
			roomData.player1 = false;
			roomData.p1_ready = false;
		} else if (roomData.player2 === socket.id){
			roomData.player2 = false;
			roomData.p2_ready = false;
		}
		serverData.save();

		socket.to(roomId).emit('status-change', {
				player1: roomData.player1, 
				player2: roomData.player2, 
				p1_ready: roomData.p1_ready, 
				p2_ready: roomData.p2_ready});

		// Delete room if no one is in it.
		if(!roomData.player1 && !roomData.player2){
			// get room index
			var i;
			for(i = 0; i < serverData.get("gameRooms").length; i++)
				if((serverData.get("gameRooms")[i].roomId) === Array.from(socket.rooms)[1]) 
					break;

			fs.readFile('./serverData.json', 'utf8', (err, jsonString) => {
				var data = JSON.parse(jsonString);
				data['gameRooms'].splice(i, i);
				const toWrite = JSON.stringify(data, null, 2)
				fs.writeFile('./serverData.json', toWrite, err => {
					if(err) console.log("BROKE!!");
				});
			});
			serverData = editJsonFile('./serverData.json')
		}
	}
}