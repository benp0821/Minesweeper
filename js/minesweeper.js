//TODO 
//restart button

var tileArray = [];
var mineArray = [];
var tileSize = 30;
var boardSize = 20;
var numMines = 60;
var timeOfGameStart;
var menuBarSize = 30;
var gameOver = false;
var timer;
var disableClick = false;
var initialClick = true;
var touchStartTime = 0;
var touchStartPos = {x:0, y:0};


function getTileAtLoc(x, y){
	for (var i = 0; i < tileArray.length; i++){
		if (tileArray[i].x == x && tileArray[i].y == y){
			return tileArray[i];
		}
	}
	return undefined;
}

function getNumOfNeighborMines(x, y){
	var tile = getTileAtLoc(x, y);
	if (tile != undefined && tile.hasMine){
		return 0;
	}
	
	var num = 0;
	var xOff = -1;
	var yOff = -1;
	while (xOff < 2){
		var tileAtOffset = getTileAtLoc(x + xOff, y + yOff);
		if (tileAtOffset != undefined && tileAtOffset.hasMine){
			num++;
		}
		yOff++;
		if (yOff > 1){
			yOff = -1;
			xOff++;
		}
	}
	return num;
}

function clearMines(){
	for (var i = 0; i < tileArray.length; i++){
		tileArray[i].hasMine = false;
	}
}

function randomizeMines(){
	var minesNotPlaced = 0;
	for (var i = 0; i < numMines; i++){
		var randLoc = {x:random(boardSize), y:random(boardSize)};
		var randTile = getTileAtLoc(floor(randLoc.x), floor(randLoc.y));
		if (randTile.hasMine){
			minesNotPlaced++;
		}else{
			randTile.hasMine = true;
			mineArray.push(randTile);
		}
		
	}
	numMines -= minesNotPlaced;
	
	for (var i = 0; i < tileArray.length; i++){
		tileArray[i].number = getNumOfNeighborMines(tileArray[i].x, tileArray[i].y);
	}
	createCanvas(tileSize*boardSize + 1, tileSize*boardSize + 1 + menuBarSize);
}

function setup(){
	timeOfGameStart = millis();
	
	for (var i = 0; i < boardSize; i++){
		for (var j = 0; j < boardSize; j++){
			var tile = {x:i, y:j, number:0, hasMine:false, revealed:false, flagged:false}
			tileArray.push(tile);
		}
	}
	
	randomizeMines();
}

function draw(){
	background(500);
	var numRevealed = 0;
	for (var i = 0; i < tileArray.length; i++){
		var rectLoc = {x:tileArray[i].x * tileSize,y:tileArray[i].y * tileSize + menuBarSize};
		if (!tileArray[i].revealed){
			stroke(200, 200, 200)
			if (tileArray[i].flagged){
				fill(150, 150, 150);
			}else{
				fill(100, 100, 100);
			}
			rect(rectLoc.x, rectLoc.y, tileSize, tileSize);
			
			//FOR DEBUGGING
			/*if (tileArray[i].hasMine){
				stroke(200, 200, 200);
				fill(30, 30, 30);
				rect(rectLoc.x, rectLoc.y, tileSize, tileSize);
			}*/
			
		}else{
			if (!tileArray[i].hasMine){
				textSize(24);
				stroke(200, 200, 200)
				fill(255, 255, 255);
				rect(rectLoc.x, rectLoc.y, tileSize, tileSize);
				if (tileArray[i].number != 0){
					fill(0,0,0);
					text(tileArray[i].number, rectLoc.x + (tileSize/4), rectLoc.y, tileSize, tileSize);
				}
			}else{
				stroke(200, 200, 200)
				fill(255, 0, 0);
				rect(rectLoc.x, rectLoc.y, tileSize, tileSize);
			}
		}
		
		if (tileArray[i].revealed){
			numRevealed++;
		}
	}
	
	if (tileArray.length - numRevealed == numMines){
		for (var i = 0; i < mineArray.length; i++){
			var rectLoc = {x:mineArray[i].x * tileSize,y:mineArray[i].y * tileSize + menuBarSize};
			fill(0, 128, 0);
			rect(rectLoc.x, rectLoc.y, tileSize, tileSize);
			gameOver = true;
		}
	}
	
	drawTimer();
}

function drawTimer(){
	textSize(30);
	fill(0,0,0);
	var currentTimeInSec = int((millis() - timeOfGameStart) / 1000);
	if (!gameOver){
		timer = nf(floor(currentTimeInSec / 60 / 60), 2, 0) + ":" + nf(floor(currentTimeInSec / 60 % 60), 2, 0) + ":" + nf(currentTimeInSec % 60, 2, 0);
	}
	text(timer, tileSize*boardSize - textWidth(timer), 0, 100, 100);
}

function revealEmptyNeighbors(tile, dir){
	if (tile != undefined){
		if (tile.number == 0 && !tile.revealed){
			tile.revealed = true;
			revealEmptyNeighbors(getTileAtLoc(tile.x - 1, tile.y));
			revealEmptyNeighbors(getTileAtLoc(tile.x + 1, tile.y));
			revealEmptyNeighbors(getTileAtLoc(tile.x, tile.y - 1));
			revealEmptyNeighbors(getTileAtLoc(tile.x, tile.y + 1));
		}else{
			tile.revealed = true;
		}
	}
}

function touchStarted(){
	touchStartPos.x = mouseX;
	touchStartPos.y = mouseY;
	touchStartTime = millis();
	if (touches.length > 1){
		disableClick = true;
	}else{
		disableClick = false;
	}
}

function touchMoved(){
	if (abs(touchStartPos.y - mouseY) > 8 || abs(touchStartPos.x - mouseX) > 8){
		disableClick = true;
	}
}

function mouseReleased(){
	var touchTime = millis() - touchStartTime;
	touchStartTime = 0;
	
	if (gameOver || disableClick){return;}
	
	var loc = {x:floor(mouseX/tileSize),y:floor(mouseY/tileSize)-(menuBarSize/tileSize)};
	var clickedTile = getTileAtLoc(loc.x, loc.y);
	if (clickedTile != undefined){
		if ((touchTime >= 500 || mouseButton == RIGHT) && !clickedTile.revealed){
			clickedTile.flagged = !clickedTile.flagged;
		}else if (mouseButton == LEFT && !clickedTile.flagged){
			if (initialClick){
				initialClick = false;
				while (clickedTile.hasMine){
					clearMines();
					randomizeMines();
				}
			}
			if (clickedTile.number == 0 && !clickedTile.hasMine){
				revealEmptyNeighbors(clickedTile);
			}else if (clickedTile.hasMine){
				for (var i = 0; i < tileArray.length; i++){
					tileArray[i].revealed = true;
					gameOver = true;
				}
			}else{
				clickedTile.revealed = true;
			}
		}
	}
}