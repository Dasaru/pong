
let gs = {

	gamePaused: true,
	lastTickTime: null,

	screen: {
		padding: 30,
		width: 500,
		height: 400
	},

	ball: {
		size: 10,
		coordX: 0,
		coordY: 0,
		velX: 0.8, // (-1 to 1) ratio: 1 = rate of 1% per 10 milliseconds
		velY: -0.8,
		minSpeed: 0.8,
		maxSpeed: 5
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
		keyCode: {
			up: "KeyA",
			down: "KeyZ"
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
		keyCode: {
			up: "ArrowUp",
			down: "ArrowDown"
		},
		keyPressed: {
			up: false,
			down: false
		}
	}

};

addEventListener("keydown", (e) => {
	//Player 1
	if (e.code === gs.player1.keyCode.up){
		gs.player1.keyPressed.up = true;
	}
	if (e.code === gs.player1.keyCode.down){
		gs.player1.keyPressed.down = true;
	}
	//Player 2
	if (e.code === gs.player2.keyCode.up){
		gs.player2.keyPressed.up = true;
	}
	if (e.code === gs.player2.keyCode.down){
		gs.player2.keyPressed.down = true;
	}
});

addEventListener("keyup", (e) => {
	//Player 1
	if (e.code === gs.player1.keyCode.up){
		gs.player1.keyPressed.up = false;
	}
	if (e.code === gs.player1.keyCode.down){
		gs.player1.keyPressed.down = false;
	}
	//Player 2
	if (e.code === gs.player2.keyCode.up){
		gs.player2.keyPressed.up = false;
	}
	if (e.code === gs.player2.keyCode.down){
		gs.player2.keyPressed.down = false;
	}
});

addEventListener("keypress", (e) => {
	if (e.code === "Enter") {
		if (gs.gamePaused){
			startGame();
		} else {
			pauseGame();
		}
	}
});

const canvas = document.getElementById("pongBoard");
let ctx = canvas.getContext("2d");

clearScreen();
drawPaddles();
resetBall();
window.requestAnimationFrame(playAnimation);

/**********************
 * FUNCTIONS
 *********************/

 function playAnimation(time){
	if (gs.lastTickTime != null){
		let delta = time - gs.lastTickTime;

		movePlayer(gs.player1, delta);
		movePlayer(gs.player2, delta);
		moveBall(delta);

		clearScreen();
		drawPaddles();
		drawBall();

		drawBorders();
		drawScoreboard();

		if (gs.gamePaused){
			displayPauseMessage();
		}
	}
	gs.lastTickTime = time;
	window.requestAnimationFrame(playAnimation);
}

function clearScreen(){
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, gs.screen.width, gs.screen.height);
}

function drawPaddles(){
	gs.player1.drawPaddle();
	gs.player2.drawPaddle();
}

function resetBall(){
	gs.ball.coordX = Math.floor(gs.screen.width/2 - gs.ball.size/2);
	gs.ball.coordY = Math.floor(gs.screen.height/2 - gs.ball.size/2);
}

function drawBall(){
	ctx.fillStyle = "white";
	ctx.fillRect(gs.ball.coordX, gs.ball.coordY, gs.ball.size, gs.ball.size);
}

function drawBorders(){
	const borderThickness = 3;
	ctx.fillStyle = "#444";
	ctx.fillRect(0, gs.screen.padding - borderThickness, gs.screen.width, borderThickness);
	ctx.fillRect(0, gs.screen.height - gs.screen.padding, gs.screen.width, borderThickness);
}

function drawScoreboard(){
	ctx.fillStyle = "#888";
	ctx.textAlign = 'center';
	ctx.font = "24px Arial";
	ctx.fillText(gs.player1.score + " - " + gs.player2.score, gs.screen.width/2, gs.screen.padding - 7);
}

function startGame(){
	gs.gamePaused = false;
}

function pauseGame(){
	gs.gamePaused = true;
}

function displayPauseMessage(){
	ctx.fillStyle = "#aaa"
	ctx.textAlign = "center";
	ctx.font = "24px Arial";
	ctx.fillText("Paused", gs.screen.width/2, gs.screen.height*0.4);
}

function movePlayer(player, delta){
	if (player.keyPressed.down && !player.keyPressed.up){
		player.pos = player.pos + (delta/gs.paddle.speed);
	}
	if (!player.keyPressed.down && player.keyPressed.up) {
		player.pos = player.pos - (delta/gs.paddle.speed);
	}
	if (player.pos < 0 ){
		player.pos = 0;
	}
	if (player.pos > 100){
		player.pos = 100;
	}
}

function moveBall(delta){
	if (gs.gamePaused) return;
	gs.ball.coordX = gs.ball.coordX + (delta/10)*gs.ball.velX;
	gs.ball.coordY = gs.ball.coordY + (delta/10)*gs.ball.velY;
}