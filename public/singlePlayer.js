const rows = document.querySelectorAll('.row');
const forfeitButton = document.querySelector("#forfeit-button");
const infoDisplay = document.querySelector('#info-display');
const turnDislay = document.querySelector("#turn-display");
const modalBackdrop = document.getElementById('modal-backdrop');
const playAgainModal = document.getElementById('play-again-modal');
const playAgainButton = document.querySelector('#play-again-button');
const winnerDisplay = document.getElementById('winner');
const difficultyDropdown = document.getElementById('difficulty-dropdown');
const userScoreDisplay = document.querySelector('.p1.score');
const computerScoreDisplay = document.querySelector('.p2.score');

let board = {
	"topLeft": "",
	"topCenter": "",
	"topRight": "",
	"midLeft": "",
	"midCenter": "",
	"midRight": "",
	"botLeft": "",
	"botCenter": "",
	"botRight": ""
};

const user = 'X';
const computer = 'O';
let computerScore = 0;
let userScore = 0;
let gameMode = 'easy'

// list of hadnwriting type fonts for symbol variety
let fonts = ['Crafty Girls', 'Delius Unicase', 'Gochi Hand', 'Patrick Hand SC', 'Schoolbell', 'Walter Turncoat']


/**
 * Creates event listeners for all buttons
*/
function startSoloPlay(){
	for(var i = 0; i < 3; i++){
		for(var j  = 0; j < 3; j++){
			var currCellID = Object.keys(board)[3*i+j];
			rows[i].children[j].textContent = board[currCellID];
			rows[i].children[j].addEventListener('click', handleTilePlace);
		}
	}
	difficultyDropdown.addEventListener('change', changeDifficulty);
	forfeitButton.addEventListener('click', forfeit);
	playAgainButton.addEventListener('click', reset)
}

/**
 * updates the gameMode variable to the value of the dropdown
*/
function changeDifficulty(event){
	gameMode = difficultyDropdown.value;
}

/**
 * Refreshes the board (displayed and not)
 * re-enables all boards, re-enables difficulty dropdown
 * Hides Play Again Modal
*/
function reset(){
	//update scores
	userScoreDisplay.textContent = userScore;
	computerScoreDisplay. textContent = computerScore;

	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 3; j++){
			var currCellID = Object.keys(board)[3*i+j];
			board[currCellID] = '';
			rows[i].children[j].textContent = board[currCellID];
			rows[i].children[j].disabled = false;
		}
	}
	difficultyDropdown.disabled = false;

	//Hide Play Again Modal
	modalBackdrop.classList.add('hidden');
	playAgainModal.classList.add('hidden');
}

/**
 * updates the computer score and resets board
*/
function forfeit(){
	//increment computer score
	computerScore++;
	//reset board & update scores
	reset();
}

/**
 * Handler for when a tile is clicked
 *  - disables difficulty dropdown
 *  - updates the board to match user's input
 *  - checks for winner
 *  - starts computer's turn
 *  - checks if computer won
*/
function handleTilePlace(event){
	//hide the difficulty options
	difficultyDropdown.disabled = true;
	board[event.target.id] = user;
	event.target.style.fontFamily = fonts[Math.floor(Math.random()*fonts.length)]
	event.target.textContent = user;
	event.target.disabled = true;
	var winner = checkWinner();
	if (!winner){ // computer goes is there was no winner
		//Begin Computer Turn
		if(gameMode === 'easy') 
			computerRandom();
		else if(gameMode  === 'impossible')
			computerBestMove();
		winner = checkWinner();
	}

	if(winner) // checks for winner
		gameOver(winner);
}

/**
 * Computer finds all empty spaces
 * randomly places a tile in one of them
*/
function computerRandom(){
	disableBoard();
	var availableSpaces = [];
	for(var i = 0; i < Object.keys(board).length; i++)
		if(!(board[Object.keys(board)[i]]))
			availableSpaces.push(Object.keys(board)[i]);

	var chosenSpot = Math.floor(Math.random() * availableSpaces.length)

	board[availableSpaces[chosenSpot]] = computer;
	document.getElementById(availableSpaces[chosenSpot]).style.fontFamily = fonts[Math.floor(Math.random()*fonts.length)]
	document.getElementById(availableSpaces[chosenSpot]).textContent = computer;
	enableBoard();
}

/**
 * initiates minimax algorithm with alpha beta pruning
*/
function computerBestMove(){
	disableBoard();
	var bestTally = -Infinity;
	var bestMove;
	for(var i = 0; i < Object.keys(board).length; i++){
		var currCellID = Object.keys(board)[i];
		// Is the spot available?
		if(!(board[currCellID])){
			board[currCellID] = computer;
			var tally = minimax(board, 0, -Infinity, Infinity, false);
			board[currCellID] = '';
			if(tally > bestTally) {
				bestTally = tally;
				bestMove = currCellID;
			}
		}
	}
	board[bestMove] = computer;
	document.getElementById(bestMove).style.fontFamily = fonts[Math.floor(Math.random()*fonts.length)]
	document.getElementById(bestMove).textContent = computer;
	enableBoard();
}

//lookup table for minimax algorithm
var tallys = {
	X: -1,
	O: 1,
	tie: 0
}

/**
 * Recursive function for the minimax algorithm with alpha beta pruning
*/
function minimax(board, depth, alpha, beta, isMaximizing){
	var result = checkWinner();
	if(result){
		return tallys[result];
	}

	if(isMaximizing) {
		var bestTally = -Infinity;
		for(var i = 0; i < Object.keys(board).length; i++){
			var currCellID = Object.keys(board)[i];
			// Is the spot available?
			if(!(board[currCellID])){
				board[currCellID] = computer;
				var tally = minimax(board, depth+1, alpha, beta, false);
				board[currCellID] = '';
				bestTally = Math.max(tally, bestTally);
				alpha = Math.max(alpha, tally);
				if(beta <= alpha)
					break;
			}
		}
		return bestTally;
	} else {
		var bestTally = Infinity;
		for(var i = 0; i < Object.keys(board).length; i++){
			var currCellID = Object.keys(board)[i];
			// Is the spot available?
			if(!(board[currCellID])){
				board[currCellID] = user;
				var tally = minimax(board, depth+1, alpha, beta, true);
				board[currCellID] = '';
				bestTally = Math.min(tally, bestTally)
				beta = Math.min(beta, tally);
				if(beta <= alpha)
					break;
			}
		}
		return bestTally;
	}
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

/**
 * enables all board tiles that are empty
*/
function enableBoard(){
	Object.entries(board).forEach( (e) => {if(!e[1]) document.getElementById(e[0]).disabled = false});
}

/**
 * helper function that makes sure 3 things are the same and not falsey
*/
function equals3(a, b, c) {
	return a == b && a == c && a;
}

/**
 * checks to see if there is a winner
*/
function checkWinner(){
	var cellData = Object.values(board);
	
	// Horizontal
	for(var i = 0; i < 3; i++){
		if(equals3(cellData[3*i+0], cellData[3*i+1], cellData[3*i+2]))
			return cellData[3*i];
	}

	// Vertical
	for(var j = 0; j < 3; j++){
		if(equals3(cellData[3*0+j], cellData[3*1+j], cellData[3*2+j]))
			return cellData[j];
	}

	// Diagonals
	if(equals3(cellData[0], cellData[4], cellData[8]))
		return cellData[0];

	if(equals3(cellData[2], cellData[4], cellData[6]))
		return cellData[2];

	//check for cat's game
	var cat = true;
	for(var i = 0; i < cellData.length; i++)
		if(!cellData[i]) cat = false;
	if(cat){
		return 'tie';
	}

	return false;
}

/**
 * disables board
 * displays play again modal
 * increments winner score if there was one
 * displayes the winner in the modal
*/
function gameOver(winner){
	disableBoard();
	modalBackdrop.classList.remove('hidden');
	playAgainModal.classList.remove('hidden');
	if(winner===user){
		userScore++;
		userScoreDisplay.textContent = userScore;
		winnerDisplay.textContent = winner + " Wins!";
	} else if(winner===computer){
		computerScore++;
		computerScoreDisplay.textContent = computerScore;
		winnerDisplay.textContent = winner + ' Wins!';
	}
	else
		winnerDisplay.textContent = "Cat's Game!";
}

export default startSoloPlay