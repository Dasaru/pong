
let gs = {
	
	gameStarted: false,
	gamePaused: true,
	gameWinner: null,
	scoreToWin: 3,
	startDelay: 3,
	gameSpeed: "normal",
	lastTickTime: null,
	countdownTimestamp: Date.now(),

	screen: {
		padding: 30,
		width: 500,
		height: 400
	},

	menu: {
		itemSelectedIndex: 0,
		subMenuText: "",
		items: [
			{
				name: "New Game",
				visible: true,
				select: function(){
					startGame();
					unpauseGame();
					resetBall();
					gs.gameWinner = null;
					gs.menu.setVisibleItems(["Continue", "Reset"]);
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
					gs.menu.itemSelectedIndex = 0;
					gs.menu.setVisibleItems(["Back", "Points to Win", "Start Delay", "Game Speed"]);
				}
			},
			{
				name: "Reset",
				visible: false,
				select: function(){
					resetGame();
				}
			},
			{
				name: "Back",
				visible: false,
				select: function(){
					gs.menu.itemSelectedIndex = 0;
					if (gs.gameStarted){
						gs.menu.setVisibleItems(["Continue", "Reset"]);
					} else {
						gs.menu.setVisibleItems(["New Game", "Options"]);
					}
				}
			},
			{
				name: "Points to Win",
				visible: false,
				text: "(3) 5  7 ",
				select: function(){
					const visibleItems = gs.menu.getVisibleItems();
					if (gs.scoreToWin === 3){
						gs.scoreToWin = 5;
						visibleItems[gs.menu.itemSelectedIndex].text = " 3 (5) 7 ";
					} else if (gs.scoreToWin === 5) {
						gs.scoreToWin = 7;
						visibleItems[gs.menu.itemSelectedIndex].text = " 3  5 (7)";
					} else {
						gs.scoreToWin = 3;
						visibleItems[gs.menu.itemSelectedIndex].text = "(3) 5  7 ";
					}
				}
			},
			{
				name: "Game Speed",
				visible: false,
				text: "(Normal) Fast ",
				select: function(){
					const visibleItems = gs.menu.getVisibleItems();
					if (gs.gameSpeed === "normal"){
						gs.gameSpeed = "fast";
						resetBallSpeed();
						visibleItems[gs.menu.itemSelectedIndex].text = " Normal (Fast)";
					} else if (gs.gameSpeed === "fast") {
						gs.gameSpeed = "normal";
						resetBallSpeed();
						visibleItems[gs.menu.itemSelectedIndex].text = "(Normal) Fast ";
					}
				}
			},
			{
				name: "Start Delay",
				visible: false,
				text: " 1  2 (3) sec",
				select: function(){
					const visibleItems = gs.menu.getVisibleItems();
					if (gs.startDelay === 1){
						gs.startDelay = 2;
						visibleItems[gs.menu.itemSelectedIndex].text = " 1 (2) 3  sec";
					} else if (gs.startDelay === 2) {
						gs.startDelay = 3;
						visibleItems[gs.menu.itemSelectedIndex].text = " 1  2 (3) sec";
					} else {
						gs.startDelay = 1;
						visibleItems[gs.menu.itemSelectedIndex].text = "(1) 2  3  sec";
					}
				}
			}
		],
		setVisibleItems: function(itemList){
			gs.menu.items.forEach(menuItem => {
				menuItem.visible = itemList.includes(menuItem.name);
			});
		},
		getVisibleItems: function() {
			return gs.menu.items.filter(item => {
				return item.visible;
			});
		},
		showMenu: function(){
			const items = gs.menu.getVisibleItems();
			for (let i=0; i < items.length; i++){
				ctx.fillStyle = items[i]?.style?.fillStyle ?? "#aaa";
				ctx.font = items[i]?.style?.font ?? "24px Arial";
				ctx.textAlign = items[i]?.style?.textAlign ?? "left";
				ctx.fillText(items[i].name, gs.screen.width/2-50, gs.screen.height*0.6+i*26);
			}
			ctx.fillText(">", gs.screen.width/2-70, gs.screen.height*0.6 + gs.menu.itemSelectedIndex*26);
		},
		updateSubMenuText: function(){
			const visibleItems = gs.menu.getVisibleItems();
			gs.menu.subMenuText = visibleItems[gs.menu.itemSelectedIndex].text ?? "";
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
		accelX: 0.4,
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

	gameSpeedSettings: {
		normal: {
			ball: {
				accelX: 0.4,
				minXSpeed: 1.2,
				maxXSpeed: 5,
				minYSpeed: 0.6,
				maxYSpeed: 5
			},
			paddle: {
				speed: 8
			}
		},
		fast: {
			ball: {
				accelX: 0.8,
				minXSpeed: 3.6,
				maxXSpeed: 10,
				minYSpeed: 1.2,
				maxYSpeed: 10
			},
			paddle: {
				speed: 4
			}
		}
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
		gs.menu.updateSubMenuText();
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

		clearScreen();

		if (!gs.gamePaused){
			const timeLeft = remainingCountdown();
			if (timeLeft > 0) {
				displayMainMessage(Math.ceil(timeLeft/1000));
			} else {
				movePaddle(gs.player1, delta);
				movePaddle(gs.player2, delta);
				moveBall(delta);
			}
		}

		drawPaddles();
		drawBorders();
		displayTopLeftMessage("To Win: " + gs.scoreToWin);

		if (gs.gameStarted){
			drawBall();
			drawScoreboard();
		}

		if (gs.gamePaused){
			if (gs.gameWinner){
				displayMainMessage(gs.gameWinner + " wins!", {fillStyle: "#a77"});
			} else if (!gs.gameStarted){
				const style = {
					fillStyle: "#77a",
					font: "bold 36px Arial"
				}
				displayMainMessage("PONG", style);
				displaySubMessage(gs.menu.subMenuText);
			} else {
				displayMainMessage("Paused", {fillStyle: "#7a7"});
			}
			displayMainMenu();
		}
	}
	gs.lastTickTime = time;
	window.requestAnimationFrame(playAnimation);
}

function setCountdown(seconds) {
	gs.countdownTimestamp = Date.now() + (seconds*1000);
}

function remainingCountdown(){
	return gs.countdownTimestamp - Date.now();
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
	Object.assign(gs.ball, gs.gameSpeedSettings[gs.gameSpeed].ball);
	Object.assign(gs.paddle, gs.gameSpeedSettings[gs.gameSpeed].paddle);
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
	if (absX === gs.ball.maxXSpeed) {
		gs.ball.velX = signX * (absX + gs.ball.accelX + 1.8); // Initial boost
	} else if (absX < gs.ball.maxXSpeed){
		gs.ball.velX = signX * (absX + gs.ball.accelX);
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
	setCountdown(gs.startDelay);
}

function resetGame(){
	pauseGame();
	stopGame();
	resetBall();
	resetPaddles();
	resetScore();
	gs.menu.setVisibleItems(["New Game", "Options"]);
}

function displayMainMessage(message, styles){
	ctx.fillStyle = styles?.fillStyle ?? "#aaa";
	ctx.textAlign = styles?.textAlign ?? "center";
	ctx.font = styles?.font ?? "24px Arial";
	ctx.fillText(message, gs.screen.width/2, gs.screen.height*0.4);
}

function displaySubMessage(message, styles){
	if (!message) return;
	ctx.fillStyle = styles?.fillStyle ?? "#FFE800";
	ctx.textAlign = styles?.textAlign ?? "center";
	ctx.font = styles?.font ?? "18px Arial";
	ctx.fillText(message, gs.screen.width/2, gs.screen.height*0.5);
}

function displayMainMenu(){
	gs.menu.showMenu();
	displayBottomGutterMessage("menu select: ↑, ↓, [Enter]");
}

function displayTopLeftMessage(message, styles){
	ctx.fillStyle = styles?.fillStyle ?? "#777";
	ctx.textAlign = styles?.textAlign ?? "left";
	ctx.font = styles?.font ?? "18px Arial";
	ctx.fillText(message, 8, 20);
}

function displayBottomGutterMessage(message, styles){
	ctx.fillStyle = styles?.fillStyle ?? "#777";
	ctx.textAlign = styles?.textAlign ?? "center";
	ctx.font = styles?.font ?? "18px Arial";
	ctx.fillText(message, gs.screen.width/2, gs.screen.height-8);
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
	setCountdown(gs.startDelay);
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