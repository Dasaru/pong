
//Maybe use?
/*
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
*/

// Need global game object to contain state.

/*

FEATURES:
	- Ability to reset game.
	- Computer opponent moves second paddle. (simple AI)
	- Ball slowly speeds up after each bounce.
	- Ball trajectory changed based on where it hits paddle.
	- Hitbox detection.

*/

/*
const keyCodes = {
	13: "enter",
	38: "down",
	40: "up"
}
*/

let gs = {

	gamePaused: true,

	screen: {
		padding: 60,
		width: 500,
		height: 400
	},

	ball: {
		width: 10,
		dirX: 0,
		dirY: 0,
		coordX: 0,
		coordY: 0
	},

	paddle: {
		width: 10,
		height: 80,
	},

	player1: {
		score: 0,
		pos: 150, // SHOULD BE A PERCENTAGE BETWEEN 0 AND 100
		drawPaddle: function(){
			ctx.fillStyle = "white";
			//REPLACE gs.player1.pos with percentage!!!
			ctx.fillRect(gs.screen.padding, gs.screen.padding + gs.player1.pos, gs.paddle.width, gs.paddle.height);
		}
	},

	player2: {
		score: 0,
		pos: 50,
		drawPaddle: function(){
			ctx.fillStyle = "white";
			ctx.fillRect(gs.screen.width - gs.screen.padding - gs.paddle.width, gs.screen.padding + gs.player2.pos, gs.paddle.width, gs.paddle.height);
		}
	}

};

const canvas = document.getElementById("pongBoard");
let ctx = canvas.getContext("2d");

clearScreen();

//display temp paddles
gs.player1.drawPaddle();
gs.player2.drawPaddle();

/**********************
 * FUNCTIONS
 *********************/

function clearScreen(){
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, gs.screen.width, gs.screen.height);
}

/*
let lastTime = null;
function playAnimation(time){
	if (lastTime != null){
		let delta = time - lastTime;

	}
	lastTime = time;
	window.requestAnimationFrame(playAnimation);
}

window.requestAnimationFrame(playAnimation);
*/