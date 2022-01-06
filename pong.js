
let gs = {
	
	gameStarted: false,
	gamePaused: true,
	lastTickTime: null,

	screen: {
		padding: 30,
		width: 500,
		height: 400
	},

	menu: {
		itemSelectedIndex: 0,
		items: [
			{
				name: "New Game",
				visible: true,
				select: function(){
					console.log("New Game selected");
				}
			},
			{
				name: "Continue",
				visible: true,
				select: function(){
					console.log("Continue selected");
				}
			},
			{
				name: "Reset",
				visible: true,
				select: function(){
					console.log("Reset Game selected");
				}
			}
		],
		showMenu: function(){
			ctx.fillStyle = "#aaa"
			ctx.font = "24px Arial";
			ctx.textAlign = "left";
			let items = gs.menu.items.filter((item)=>{
				return item.visible;
			});
			for (let i=0; i < items.length; i++){
				ctx.fillText(items[i].name, gs.screen.width/2-50, gs.screen.height*0.6+i*26);
			}
			ctx.fillText(">", gs.screen.width/2-70, gs.screen.height*0.6 + gs.menu.itemSelectedIndex*26);
		}
	},

	ball: {
		size: 10,
		coordX: 0,
		coordY: 0,
		velX: 0, // (-1 to 1) ratio: 1 = rate of 1% per 10 milliseconds
		velY: 0,
		minXSpeed: 1.2,
		maxXSpeed: 5,
		minYSpeed: 0.6,
		maxYSpeed: 5
	},

	paddle: {
		width: 10,
		height: 81,
		speed: 8 // # of milliseconds to move 1%
	},

	player1: {
		score: 0,
		pos: 50, // Percentage between 0 and 100
		drawPaddle: function(){
			ctx.fillStyle = "white";
			let offset = getOffset(gs.player1.pos);
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
			let offset = getOffset(gs.player2.pos);
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
			unpauseGame();
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

		if (!gs.gamePaused){
			movePaddle(gs.player1, delta);
			movePaddle(gs.player2, delta);
			moveBall(delta);
		}

		clearScreen();
		drawPaddles();
		drawBall();

		drawBorders();
		drawScoreboard();

		if (gs.gamePaused){
			displayMainMessage("Paused");
			displayMainMenu();
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
	resetBallSpeed();
	randomizeBallDirection();
}

function resetBallSpeed(){
	gs.ball.velX = gs.ball.minXSpeed;
	gs.ball.velY = gs.ball.minYSpeed;
}

function randomizeBallDirection(){
	let direction = (Math.floor(Math.random()*2)) ? 1 : -1;
	gs.ball.velX = direction * gs.ball.minXSpeed;
	direction = (Math.floor(Math.random()*2)) ? 1 : -1;
	gs.ball.velY = direction * gs.ball.minYSpeed;
}

function speedUpBall(playerHit){
	// Increase ball.velX speed
	const absX = Math.abs(gs.ball.velX);
	const signX = (gs.ball.velX > 0) ? 1 : -1;
	if (absX === gs.ball.minXSpeed){
		gs.ball.velX = signX * 1.8;
	} else if (absX < gs.ball.maxXSpeed){
		gs.ball.velX = signX * (absX + 0.4);
	}

	// Change velY direction based on paddle movement and collision.
	const absY = Math.abs(gs.ball.velY);
	const ballCenter = Math.floor(gs.ball.size / 2);
	const third = Math.floor(gs.paddle.height / 3);
	const topThird = getOffset(playerHit.pos) + third - ballCenter;
	const botThird = getOffset(playerHit.pos) + 2*third - ballCenter;

	// Change velY based on paddle hitbox.
	if (gs.ball.coordY < topThird){
		//top hit
		if (absY < gs.ball.maxYSpeed){
			gs.ball.velY -= 0.6;
		}
	} else if (gs.ball.coordY > botThird) {
		//bottom hit
		if (absY < gs.ball.maxYSpeed){
			gs.ball.velY += 0.6;
		}
	}

	// Change velY based on paddle movement
	if (playerHit.keyPressed.up && absY < gs.ball.maxYSpeed){
		gs.ball.velY -= 0.6;
	} else if (playerHit.keyPressed.down && absY < gs.ball.maxYSpeed) {
		gs.ball.velY += 0.6;
	}
}

function resetPaddles(){
	gs.player1.pos = 50;
	gs.player2.pos = 50;
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

function resetScore(){
	gs.player1.score = 0;
	gs.player2.score = 0;
}

function getOffset(playerPos){
	return gs.screen.padding + playerPos*(gs.screen.height - gs.screen.padding*2 - gs.paddle.height)/100;
}

function startGame(){
	gs.gameStarted = true;
}

function stopGame(){
	gs.gameStarted = false;
}

function pauseGame(){
	gs.menu.itemSelectedIndex = 0;
	gs.gamePaused = true;
}

function unpauseGame(){
	gs.gamePaused = false;
}

function resetGame(){
	gs.gamePaused = true;
	resetBall();
	resetPaddles();
	resetScore();
}

function displayMainMessage(message){
	ctx.fillStyle = "#aaa"
	ctx.textAlign = "center";
	ctx.font = "24px Arial";
	ctx.fillText(message, gs.screen.width/2, gs.screen.height*0.4);
}

function displayMainMenu(){
	gs.menu.showMenu();
}

function movePaddle(player, delta){
	if (player.keyPressed.down && !player.keyPressed.up){
		player.pos = player.pos + (delta/gs.paddle.speed);
	}
	if (!player.keyPressed.down && player.keyPressed.up) {
		player.pos = player.pos - (delta/gs.paddle.speed);
	}
	player.pos = keepInBoundary(player.pos, 0, 100);
}

function keepInBoundary(val, min, max){
	if (val < min) val = min;
	if (val > max) val = max;
	return val;
}

function playerScore(player){
	resetBall();
	resetPaddles();
	pauseGame();
	player.score++;
}

function paddleHit(player){
	let offset = getOffset(player.pos);
	speedUpBall(player);
	return (gs.ball.coordY + gs.ball.size) >= offset && gs.ball.coordY <= (offset + gs.paddle.height);
}

function moveBall(delta){
	const bound = {
		left: gs.screen.padding + gs.paddle.width,
		right: gs.screen.width - gs.screen.padding - gs.paddle.width - gs.ball.size,
		top: gs.screen.padding,
		bottom: gs.screen.height - gs.screen.padding - gs.ball.size
	}
	gs.ball.coordX = gs.ball.coordX + (delta/10)*gs.ball.velX;
	// left side hitbox
	if (gs.ball.coordX < bound.left) {
		if (paddleHit(gs.player1)){
			gs.ball.coordX = bound.left;
			gs.ball.velX = -gs.ball.velX;
		} else {
			playerScore(gs.player2);
		}
	}
	// right side hitbox
	if (gs.ball.coordX > bound.right) {
		if (paddleHit(gs.player2)){
			gs.ball.coordX = bound.right;
			gs.ball.velX = -gs.ball.velX;
		} else {
			playerScore(gs.player1);
		}
	}
	gs.ball.coordY = gs.ball.coordY + (delta/10)*gs.ball.velY;
	// top side hitbox
	if (gs.ball.coordY < bound.top) {
		gs.ball.coordY = bound.top;
		gs.ball.velY = -gs.ball.velY;
	}
	// bottom side hitbox
	if (gs.ball.coordY > bound.bottom) {
		gs.ball.coordY = bound.bottom;
		gs.ball.velY = -gs.ball.velY;
	}
}