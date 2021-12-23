
/*

FEATURES:
	- Ability to reset game.
	- Computer opponent moves second paddle. (simple AI)
	- Ball slowly speeds up after each bounce.
	- Ball trajectory changed based on where it hits paddle.
	- Hitbox detection.

*/

let gs = {

	gamePaused: true,

	screen: {
		padding: 30,
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
		speed: 3 // # of milliseconds to move 1%
	},

	player1: {
		score: 0,
		pos: 50, // Percentage between 0 and 100
		drawPaddle: function(){
			ctx.fillStyle = "white";
			let offset = gs.screen.padding + gs.player1.pos*(gs.screen.height - gs.screen.padding*2 - gs.paddle.height)/100;
			ctx.fillRect(gs.screen.padding, offset, gs.paddle.width, gs.paddle.height);
		},
		keyPressed: {
			up: false,
			down: false
		}
	},

	player2: {
		score: 0,
		pos: 50, // Percentage between 0 and 100
		drawPaddle: function(){
			ctx.fillStyle = "white";
			let offset = gs.screen.padding + gs.player2.pos*(gs.screen.height - gs.screen.padding*2 - gs.paddle.height)/100;
			ctx.fillRect(gs.screen.width - gs.screen.padding - gs.paddle.width, offset, gs.paddle.width, gs.paddle.height);
		},
		keyPressed: {
			up: false,
			down: false
		}
	}

};

addEventListener("keydown", (e) => {
	if (e.code === "ArrowDown"){
		gs.player1.keyPressed.down = true;
	}
	if (e.code === "ArrowUp"){
		gs.player1.keyPressed.up = true;
	}
});

addEventListener("keyup", (e) => {
	if (e.code === "ArrowDown"){
		gs.player1.keyPressed.down = false;
	}
	if (e.code === "ArrowUp"){
		gs.player1.keyPressed.up = false;
	}
});

const canvas = document.getElementById("pongBoard");
let ctx = canvas.getContext("2d");

clearScreen();
drawPaddles();

/**********************
 * FUNCTIONS
 *********************/

function clearScreen(){
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, gs.screen.width, gs.screen.height);
}

function drawPaddles(){
	gs.player1.drawPaddle();
	gs.player2.drawPaddle();
}

let lastTime = null;
function playAnimation(time){
	if (lastTime != null){
		let delta = time - lastTime;
		
		// Move player1
		if (gs.player1.keyPressed.down && !gs.player1.keyPressed.up){
			gs.player1.pos = gs.player1.pos + (delta/gs.paddle.speed);
		}
		if (!gs.player1.keyPressed.down && gs.player1.keyPressed.up) {
			gs.player1.pos = gs.player1.pos - (delta/gs.paddle.speed);
		}
		if (gs.player1.pos < 0 ){
			gs.player1.pos = 0;
		}
		if (gs.player1.pos > 100){
			gs.player1.pos = 100;
		}

		clearScreen();
		drawPaddles();
	}
	lastTime = time;
	window.requestAnimationFrame(playAnimation);
}

window.requestAnimationFrame(playAnimation);