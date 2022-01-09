
let gs = {
	
	gameStarted: false,
	gamePaused: true,
	gameWinner: null,
	scoreToWin: 3,
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
					startGame();
					unpauseGame();
					gs.menu.setItemVisibility("New Game", false);
					gs.menu.setItemVisibility("Continue", true);
					gs.menu.setItemVisibility("Reset", true);
				}
			},
			{
				name: "Continue",
				visible: false,
				select: function(){
					unpauseGame();
				}
			},
			{
				name: "Options",
				visible: true,
				select: function(){
				}
			},
			{
				name: "Reset",
				visible: false,
				select: function(){
					resetGame();
				}
			}
		],
		setItemVisibility: function(itemName, value){
			if (typeof value !== "boolean") {
				throw new TypeError("function setItemVisibility: Expected boolean value for second argument.");
			};
			for (let i=0; i < gs.menu.items.length; i++){
				if (gs.menu.items[i].name === itemName){
					gs.menu.items[i].visible = value;
					return true;
				}
			}
			throw new TypeError("function setItemVisibility: Invalid menu item for first argument.");
		},
		getVisibleItems: function() {
			return gs.menu.items.filter((item)=>{
				return item.visible;
			});
		},
		showMenu: function(){
			ctx.fillStyle = "#aaa"
			ctx.font = "24px Arial";
			ctx.textAlign = "left";
			const items = gs.menu.getVisibleItems();
			for (let i=0; i < items.length; i++){
				ctx.fillText(items[i].name, gs.screen.width/2-50, gs.screen.height*0.6+i*26);
			}
			ctx.fillText(">", gs.screen.width/2-70, gs.screen.height*0.6 + gs.menu.itemSelectedIndex*26);
		},
		callSelectedMenuItem: function(){
			const visibleItems = gs.menu.getVisibleItems();
			visibleItems[gs.menu.itemSelectedIndex].select();
		}
	},

	ball: {
		size: 10,
		coordX: 0,
		coordY: 0,
		velX: 0,
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
	// Player 1
	if (e.code === gs.player1.keyCode.up){
		gs.player1.keyPressed.up = true;
	}
	if (e.code === gs.player1.keyCode.down){
		gs.player1.keyPressed.down = true;
	}
	// Player 2
	if (e.code === gs.player2.keyCode.up){
		gs.player2.keyPressed.up = true;
	}
	if (e.code === gs.player2.keyCode.down){
		gs.player2.keyPressed.down = true;
	}
	// Pause menu
	if (e.code === "Enter") {
		if (gs.gamePaused){
			gs.menu.callSelectedMenuItem();
		} else {
			pauseGame();
		}
	}
	// Main menu selection
	if (gs.gamePaused){
		const visibleItems = gs.menu.getVisibleItems();
		if (e.code === gs.player2.keyCode.down){
			gs.menu.itemSelectedIndex++;
		} else if (e.code === gs.player2.keyCode.up) {
			gs.menu.itemSelectedIndex--;
		}
		gs.menu.itemSelectedIndex = keepInBoundary(gs.menu.itemSelectedIndex, 0, visibleItems.length-1);
	}
});

addEventListener("keyup", (e) => {
	// Player 1
	if (e.code === gs.player1.keyCode.up){
		gs.player1.keyPressed.up = false;
	}
	if (e.code === gs.player1.keyCode.down){
		gs.player1.keyPressed.down = false;
	}
	// Player 2
	if (e.code === gs.player2.keyCode.up){
		gs.player2.keyPressed.up = false;
	}
	if (e.code === gs.player2.keyCode.down){
		gs.player2.keyPressed.down = false;
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
			if (gs.gameWinner){
				displayMainMessage(gs.gameWinner + " wins!");
			} else if (!gs.gameStarted){
				const style = {
					fillStyle: "#77a",
					font: "bold 36px Arial"
				}
				displayMainMessage("PONG", style);
			} else {
				displayMainMessage("Paused", {fillStyle: "#7a7"});
			}
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
	pauseGame();
	stopGame();
	resetBall();
	resetPaddles();
	resetScore();
	gs.menu.setItemVisibility("New Game", true);
	gs.menu.setItemVisibility("Continue", false);
	gs.menu.setItemVisibility("Reset", false);
}

function displayMainMessage(message, styles){
	ctx.fillStyle = styles?.fillStyle ?? "#aaa";
	ctx.textAlign = styles?.textAlign ?? "center";
	ctx.font = styles?.font ?? "24px Arial";
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
	checkPlayerVictory();
}

function checkPlayerVictory(){
	if (gs.player1.score >= gs.scoreToWin){
		gs.gameWinner = "Player 1";
		resetGame();
	} else if (gs.player2.score >= gs.scoreToWin){
		gs.gameWinner = "Player 2";
		resetGame();
	} else {
		gs.gameWinner = null;
	}
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