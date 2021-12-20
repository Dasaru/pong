
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
		pos: 0,
		score: 0
	},

	player2: {
		pos: 0,
		score: 0
	}

};

const canvas = document.getElementById("pongBoard");
let ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, gs.screen.width, gs.screen.height);

//display temp paddles
//draw player1 paddle
ctx.fillStyle = "white";
ctx.fillRect(gs.screen.padding, gs.screen.padding + gs.player1.pos, gs.paddle.width, gs.paddle.height);

//draw player2 paddle
ctx.fillStyle = "white";
ctx.fillRect(gs.screen.width - gs.screen.padding - gs.paddle.width, gs.screen.padding + gs.player1.pos, gs.paddle.width, gs.paddle.height);