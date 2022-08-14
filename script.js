function $(id)
{
	return document.getElementById(id)
}

var canvasWindow = $("gameWindow")
var ctx = canvasWindow.getContext("2d")

function ShowRules()
{
	if ($("rules").style.display == 'none')
	{
		$("rules").style.display = 'block'
	} else
	{
		$("rules").style.display = 'none'
	}
}

function playerChanging(source)
{
	if($("trophieCount").value > 24/source.currentTarget.value)
	{
		$("trophieCount").value = 24/source.currentTarget.value
	}
}

function trophieChanging(source)
{
	if (source.currentTarget.value > 24/$("playerCount").value)
	{
		source.currentTarget.value = 24/$("playerCount").value
	}
}

function startGame ()
{
	$("startGame").style.display = 'none'
	$("game").style.display = 'block'
	gameWindow()
}

function resetGame()
{/*
	cancelAnimationFrame(animate);
	$("startGame").style.display = 'block'
	$("game").style.display = 'none'
	Players = [];
	Table = [];
	Arrows = [];
	movingPhase = "room";
	//InsertedRoom = NaN;
	ctx.clearRect(0, 0, canvasWindow.width, canvasWindow.height);*/
	window.location.reload();
}






var roomTypes = [
	"corner",
	"straight",
	"straightWithCorner"
]

let playersColour = [
	"red",
	"green",
	"Cyan",
	"yellow"
]

function drawImg(img,x,y,size,rotation)
{
	ctx.save();
	ctx.translate(x+(size/2),y+(size/2))
	ctx.rotate(rotation*Math.PI/180)
	ctx.translate(-(x+(size/2)),-(y+(size/2)));
	ctx.drawImage(img,x,y,size,size);
	ctx.restore();
}

let Table = [];
let Arrows = [];
let Players = [];
let movingPhase = "room";
let InsertedRoom;

let RoomLimits = [
{current : 0, max : 13},
{current : 0, max : 15},
{current : 0, max : 6},
]

function checkAvailability(type)
{
	return RoomLimits[type].current < RoomLimits[type].max
}

function countTablePosition(pos)
{
	return Math.floor(pos/100)
}

class Trophie {
	constructor(owner)
	{
		this.owner = owner;
		this.color = playersColour[owner.id]
	}
}

class Player {
	constructor(x,y,id) {
		this.x = x;
		this.y = y;
		this.mx = 0;
		this.my = 0;
		this.id = id;
		this.startX = x;
		this.startY = y
		this.move = false;
		this.collectedTrophies = 0;
	}
	update()
	{
		if (this.mx != 0)
		{
			if (this.mx > 0)
			{
				this.x -= Math.ceil(this.mx/30)
				this.mx -= Math.ceil(this.mx/30)
			} else
			{
				this.x -= Math.floor(this.mx/30)
				this.mx -= Math.floor(this.mx/30)
			}
		}
		if (this.my != 0)
		{
			if (this.my > 0)
			{
				this.y -= Math.ceil(this.my/30)
				this.my -= Math.ceil(this.my/30)
			} else
			{
				this.y -= Math.floor(this.my/30)
				this.my -= Math.floor(this.my/30)
			}
		}
		if( this.x < 75)
		{
			this.x = 775
		} else if (this.x > 775)
		{
			this.x = 75
		} else if (this.y < 75)
		{
			this.y = 775
		}else if (this.y > 775)
		{
			this.y = 75
		}
	}
	moveBy(mx,my)
	{
		this.mx = mx;
		this.my = my;
	}
	draw() {
		ctx.fillStyle = playersColour[this.id];
		ctx.beginPath();
		ctx.arc(this.x,this.y,15,0,Math.PI*2);
		ctx.fill();
		ctx.closePath();
	}
	details() {
		let extra = 0;
		if ($("trophieCount").value > 6 && this.id != 0)
		{
			extra=25;
		}
		ctx.fillStyle = playersColour[this.id];
		ctx.beginPath();
		ctx.arc(900,95+(this.id*70)+extra,10,0,Math.PI*2);
		ctx.fill();
		ctx.closePath();
		ctx.font = "20px serif"
		if (this.move)
		{
			if (movingPhase == "room")
			{
				ctx.fillText('Játékos '+(this.id+1)+": Tolás", 925, 100+(this.id*70)+extra);
			}else
			{
				ctx.fillText('Játékos '+(this.id+1)+": Lépés", 925, 100+(this.id*70)+extra);
			}
		}
		else {
			ctx.fillText('Játékos '+(this.id+1)+":", 925, 100+(this.id*70)+extra);
		}

		for(let i = 0; i < $("trophieCount").value;i++)
		{
			if (i < this.collectedTrophies)
			{
				ctx.strokeStyle = playersColour[this.id];
			}
			else
			{
				ctx.strokeStyle = "grey";
			}
			ctx.lineWidth = "5";
			ctx.beginPath();
			if ($("trophieCount").value > 6)
			{
				if ( i < 6 )
				{
					ctx.arc(925+(28*i),130+(this.id*70)+extra,10,0,Math.PI*2);
				} else 
				{
					ctx.arc(925+(28*(i-6)),160+(this.id*70)+extra,10,0,Math.PI*2);
				}
			}else
			{
				ctx.arc(925+(28*i),130+(this.id*70),10,0,Math.PI*2);
			}
			ctx.stroke();
		}
	}
	isPlayerMoving()
	{
		if (this.mx != 0 || this.my != 0)
		{
			return true;
		} else
		{
			return false;
		}
	}
}

class Room {
	constructor(x,y,type,rotation,fixRoom) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.rotation = rotation;
		this.size = 100;
		this.mx = 0;
		this.my = 0;
		this.mr = 0;
		this.fix = fixRoom;
		this.trophie = false;
		
	}
	setPos(x,y)
	{
		this.x=x;
		this.y=y;
		this.mx=0;
		this.my=0;
	}
	update()
	{
		if (!this.fix) {return}
		if (this.mx != 0)
		{
			if (this.mx > 0)
			{
				this.x -= Math.ceil(this.mx/30)
				this.mx -= Math.ceil(this.mx/30)
			} else
			{
				this.x -= Math.floor(this.mx/30)
				this.mx -= Math.floor(this.mx/30)
			}
		}
		if (this.my != 0)
		{
			if (this.my > 0)
			{
				this.y -= Math.ceil(this.my/30)
				this.my -= Math.ceil(this.my/30)
			} else
			{
				this.y -= Math.floor(this.my/30)
				this.my -= Math.floor(this.my/30)
			}
		}
		if (this.mr != 0)
		{
			this.rotation -= 3
			this.mr -= 3
		}
	}
	moveBy(mx,my)
	{
		this.mx = mx;
		this.my = my;
	}
	draw(){
		let img = document.createElement('img');
		img.src = "images/"+this.type +".png";
		drawImg(img,this.x,this.y,this.size,this.rotation)
		if (this.trophie)
		{
			ctx.strokeStyle = this.trophie.color;
			ctx.lineWidth = "5";
			ctx.beginPath();
			ctx.arc(this.x+50,this.y+50,15,0,Math.PI*2);
			ctx.stroke();
		}
		
	}
	isRoomMoving()
	{
		{
			if (this.mx != 0 || this.my != 0)
			{
				return true;
			} else
			{
				return false;
			}
		}
	}
}

class Arrow {
	constructor(x,y,size,rot,dir,id)
	{
		this.x=x;
		this.y=y;
		this.size=size;
		this.rot = rot;
		this.dir = dir;
		this.id=id
	}
	draw()
	{
		let img = document.createElement('img');
		img.src = "images/arrow.png"
		drawImg(img,this.x,this.y,this.size,this.rot)
	}
}

function checkPlayerPos(x,y)
{
	for (player of Players)
	{
		if (x == player.x && y==player.y)
		{
			return false;
		}
	}
	return true;
}

function isAnyPlayerMoving()
{
	for (player of Players)
	{
		if (player.isPlayerMoving())
		{
			return true;
		}
	}
	return false;
}

function isAnyRoomMoving()
{
	for (row of Table)
	{
		for (room of row)
		{
			if (room.isRoomMoving())
			{
				return true;
			}
		}
	}
	return false;
}

function createRandomRoom(posX,posY)
{
	let rot = Math.floor(Math.random()*4)*90;
	let roomID;
	do
	{
		roomID = Math.floor(Math.random()*roomTypes.length);
	} while (!checkAvailability(roomID))
	RoomLimits[roomID].current++;
	var roomType = roomTypes[roomID];
	let room = new Room(posX,posY,roomType,rot,true);
	return room;
}

function gameWindow()
{
	for (var i = 0;i < 7;i++)
	{
		var row = []
		if (i % 2 == 1)
		{
			let Rarrow = new Arrow(25,(i+1)*100,50,0,"right",i)
			Arrows.push(Rarrow)
			let Larrow = new Arrow(775,(i+1)*100,50,180,"left",i)
			Arrows.push(Larrow)
			let Uarrow = new Arrow((i+1)*100,775,50,270,"up",i)
			Arrows.push(Uarrow)
			let Darrow = new Arrow((i+1)*100,25,50,90,"down",i)
			Arrows.push(Darrow)
			
		}
		for (var k = 0;k < 7;k++)
		{
			if (i % 2 == 1 || k % 2 == 1)
			{
				let room = createRandomRoom(75+(100*i),75+(100*k));
				row.push(room)
			}else
			{
				let room;
				if ( i == 0 && k == 0 )
				{
					room = new Room(75+(100*i),75+(100*k),"corner",270,false)
				} else if (i == 0 && k == 6)
				{
					room = new Room(75+(100*i),75+(100*k),"corner",180,false)
				} else if (i == 6 && k == 0)
				{
					room = new Room(75+(100*i),75+(100*k),"corner",0,false)
				} else if (i == 6 && k == 6)
				{
					room = new Room(75+(100*i),75+(100*k),"corner",90,false)
				} else if ( i == 0 || (i == 2 && k == 2))
				{
					room = new Room(75+(100*i),75+(100*k),"straightWithCorner",270,false)
				} else if (k == 0 || (i == 4 && k == 2))
				{
					room = new Room(75+(100*i),75+(100*k),"straightWithCorner",0,false)
				} else if ( i == 6  || (i == 4 && k == 4))
				{
					room = new Room(75+(100*i),75+(100*k),"straightWithCorner",90,false)
				} else if (k == 6 || (i == 2 && k == 4))
				{
					room = new Room(75+(100*i),75+(100*k),"straightWithCorner",180,false)
				}
				row.push(room)
			}
		}
		Table.push(row)
	}

	for(i = 0;i<$("playerCount").value;i++)
	{
		let x;
		let y;
		do
		{
			x = (125+Math.floor(Math.random()*2)*600)
			y = (125+Math.floor(Math.random()*2)*600)
		}
		while(!checkPlayerPos(x,y))
		let player = new Player(x,y,i)
		Players.push(player)
	}
	Players[0].move = true;
	for(k = 0; k <$("playerCount").value;k++)
	{
		for(i = 0; i < parseInt($("trophieCount").value);i++)
		{
			let tropX;
			let tropY;
			let room;
			do
			{
				tropX = Math.floor(Math.random()*7)
				tropY = Math.floor(Math.random()*7)
				room = getRoomAtPosition(tropX*100+75,tropY*100+75)
			} while (room.trophie != false || (tropX == 0 && tropY == 0) || (tropX == 0 && tropY == 6) || (tropX == 6 && tropY == 0) || (tropX == 6 && tropY == 6))
			room.trophie = new Trophie(Players[k]);
		}
	}
	InsertedRoom = createRandomRoom(1000,750)
	animate();
}

function getRoomAtPosition(x,y)
{
	for (row of Table)
	{
		for (elem of row)
		{
			if (elem.x <= x && elem.x+elem.size > x && elem.y <= y && elem.y+elem.size > y)
			{
				return elem;
			}
		}
	}
	return false;
}

function insertRoom(dir,id)
{
	
	if (dir == "up")
	{
		let newInsertedRoom = Table[id][0];
		for (i = 0;i<6;i++)
		{
			Table[id][i] = Table[id][i+1];
		}
		Table[id][6] = InsertedRoom;
		InsertedRoom=newInsertedRoom;
	} else if (dir == "down")
	{
		let newInsertedRoom = Table[id][6];
		for (i = 6;i>0;i--)
		{
			Table[id][i] = Table[id][i-1];
		}
		Table[id][0] = InsertedRoom;
		InsertedRoom=newInsertedRoom;
	}
	else if (dir == "right")
	{
		let newInsertedRoom = Table[6][id];
		for (i = 6;i>0;i--)
		{
			Table[i][id] = Table[i-1][id];
		}
		Table[0][id] = InsertedRoom;
		InsertedRoom=newInsertedRoom;
	}
	else if (dir == "left")
	{
		let newInsertedRoom = Table[0][id];
		for (i = 0;i<6;i++)
		{
			Table[i][id] = Table[i+1][id];
		}
		Table[6][id] = InsertedRoom;
		InsertedRoom=newInsertedRoom;
	}
}

function clickOnInsertedRoom(target)
{
	let tx = target.offsetX;
	let ty = target.offsetY;
	if ( InsertedRoom.x < tx && InsertedRoom.x+InsertedRoom.size > tx && InsertedRoom.y < ty && InsertedRoom.y+InsertedRoom.size > ty && movingPhase=="room")
	{
		InsertedRoom.mr+=90;
	}
}
canvasWindow.addEventListener("click",clickOnInsertedRoom,true)

function getPlayerInRoom(room)
{
	for(player of Players)
	{
		if (room.x <= player.x && room.x+room.size > player.x && room.y <= player.y && room.y+room.size > player.y)
		{
			return player
		}
	}
	return false;
}

function clickOnArrow(target)
{
	let tx = target.offsetX;
	let ty = target.offsetY;
	if (movingPhase != "room" || isAnyPlayerMoving() || isAnyRoomMoving()) {return}
	for (arrow of Arrows)
	{
		if ( arrow.x < tx && arrow.x+arrow.size > tx && arrow.y < ty && arrow.y+arrow.size > ty)
		{
			if (arrow.dir == "up")
			{
				for(i = 0;i<7;i++)
				{
					let elem = Table[arrow.id][i]
					elem.moveBy(0,elem.size)
					let player = getPlayerInRoom(elem)
					if (player)
					{
						player.moveBy(0,elem.size)
					}
				}
				InsertedRoom.setPos(75+InsertedRoom.size*arrow.id,775)
				InsertedRoom.moveBy(0,InsertedRoom.size)
				insertRoom(arrow.dir,arrow.id)

			} else if (arrow.dir == "down")
			{
				for(i = 0;i<7;i++)
				{
					let elem = Table[arrow.id][i]
					elem.moveBy(0,-elem.size)
					let player = getPlayerInRoom(elem)
					if (player)
					{
						player.moveBy(0,-elem.size)
					}
				}
				InsertedRoom.setPos(75+InsertedRoom.size*arrow.id,-25)
				InsertedRoom.moveBy(0,-InsertedRoom.size)
				insertRoom(arrow.dir,arrow.id)
			}else if (arrow.dir == "right")
			{
				for(i = 0;i<7;i++)
				{
					let elem = Table[i][arrow.id]
					elem.moveBy(-elem.size,0)
					let player = getPlayerInRoom(elem)
					if (player)
					{
						player.moveBy(-elem.size,0)
					}
				}
				InsertedRoom.setPos(-25,75+InsertedRoom.size*arrow.id)
				InsertedRoom.moveBy(-InsertedRoom.size,0)
				insertRoom(arrow.dir,arrow.id)
			}else if (arrow.dir == "left")
			{
				for(i = 0;i<7;i++)
				{
					let elem = Table[i][arrow.id]
					elem.moveBy(elem.size,0)
					let player = getPlayerInRoom(elem)
					if (player)
					{
						player.moveBy(elem.size,0)
					}
				}
				InsertedRoom.setPos(775,75+InsertedRoom.size*arrow.id)
				InsertedRoom.moveBy(InsertedRoom.size,0)
				insertRoom(arrow.dir,arrow.id)
			}
			movingPhase="player";
			
		}
	}
}
canvasWindow.addEventListener("click",clickOnArrow,true)

function getMovingPlayer()
{
	for (player of Players)
	{
		if (player.move)
		{
			return player
		}
	}
}

function opposittionRooms(dir)
{
	if (dir == "up")
	{
		return "down";
	} else if (dir == "down")
	{
		return "up";
	} else if (dir == "right")
	{
		return "left";
	} else if (dir == "left")
	{
		return "right";
	}
}

function getNextRoom(room,dir)
{
	if (dir == "up")
	{
		return getRoomAtPosition(room.x,room.y-100)
	} else if (dir == "down")
	{
		return getRoomAtPosition(room.x,room.y+100)
	} else if (dir == "left")
	{
		return getRoomAtPosition(room.x-100,room.y)
	} else if (dir == "right")
	{
		return getRoomAtPosition(room.x+100,room.y)
	}
}

function getRoomAvebilities(room)
{
	
	let access = [];
	let rotations = []
	if (room.type == "corner")
	{
		rotations = [270+room.rotation,180+room.rotation]
	} else if (room.type == "straight") {
		rotations = [90+room.rotation,270+room.rotation]
	} else if (room.type == "straightWithCorner") {
		rotations = [90+room.rotation,180+room.rotation,270+room.rotation]
	}
	for (i = 0;i<rotations.length;i++)
	{
		rotations[i] = (rotations[i]%360)
		if (rotations[i] == 0)
		{
			access.push("up")
		} else if (rotations[i] == 90)
		{
			access.push("right")
		} else if (rotations[i] == 180)
		{
			access.push("down")
		} else if (rotations[i] == 270)
		{
			access.push("left")
		}
	}
	return access
}

function switchToNextPlayer()
{
	let currentPlayer = getMovingPlayer()
	for (i = 0 ; i <Players.length;i++)
	{
		if (Players[i] == currentPlayer && i != Players.length-1)
		{
			Players[i].move = false;
			Players[i+1].move = true;
		} else if (Players[i] == currentPlayer && i == Players.length-1)
		{
			Players[i].move = false;
			Players[0].move = true;
		}
	}
}

function collectTrophie()
{
	for (player of Players)
	{
		let room = getRoomAtPosition(player.x,player.y)
		if (player.mx == 0 && player.my == 0)
		{
			if (room.trophie.owner == player)
			{
				room.trophie = false;
				player.collectedTrophies++;
			}
		}
	}
}

function playerMoving(target)
{
	let tx = target.offsetX;
	let ty = target.offsetY;
	let targetRoom = getRoomAtPosition(tx,ty);
	let player = getMovingPlayer();
	let playerRoom = getRoomAtPosition(player.x,player.y);
	let directions = getRoomAvebilities(playerRoom)
	if (targetRoom && movingPhase=="player" && !isAnyRoomMoving())
	{
		for (dir of directions)
		{
			if (getNextRoom(playerRoom,dir) == targetRoom && getRoomAvebilities(targetRoom).includes(opposittionRooms(dir)))
			{
				player.moveBy(playerRoom.x-targetRoom.x,playerRoom.y-targetRoom.y);
				switchToNextPlayer();
				movingPhase = "room";
			}
		}
	}
}
canvasWindow.addEventListener("click",playerMoving,true)

function drawAvelibleRooms()
{
	if (movingPhase=="player" && !isAnyRoomMoving())
	{
		let avelible = false;
		let player = getMovingPlayer();
		let room = getRoomAtPosition(player.x,player.y);
		let pos = getRoomAvebilities(room)
		for (dir of pos)
		{
			let targetRoom = getNextRoom(room,dir)
			if( getRoomAvebilities(targetRoom).includes(opposittionRooms(dir)))
			{
				avelible = true;
				ctx.lineWidth = "5";
				ctx.strokeStyle = "green";
				ctx.beginPath();
				ctx.rect(targetRoom.x, targetRoom.y, targetRoom.size, targetRoom.size);
				ctx.stroke();
			}
		}
		if (avelible == false)
		{
			switchToNextPlayer();
			movingPhase = "room";
		}
	}
}


function theEnd()
{
	for ( player of Players)
	{
		let playerRoom = getRoomAtPosition(player.x,player.y)
		let startRoom = getRoomAtPosition(player.startX,player.startY)
		if (player.collectedTrophies == $("trophieCount").value && playerRoom == startRoom)
		{
			movingPhase = "end";
		}
	}
}

function animate()
{
	ctx.clearRect(0,0,canvasWindow.width,canvasWindow.height)
	ctx.fillStyle = "#00008B";
	ctx.fillRect(0, 0, canvasWindow.width, canvasWindow.height);
	for (arrow of Arrows)
	{
		arrow.draw();
	}
	for ( row of Table)
	{
		for (cell of row)
		{
			cell.update();
			cell.draw();
		}
	}
	ctx.font = "40px serif"
	ctx.fillText('Játékosok: ', 900, 75);
	for(player of Players)
	{
		player.draw();
		player.update();
		player.details();
		
	}
	ctx.lineWidth = "5";
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.rect(990, 740, 120, 120);
	ctx.stroke();
	InsertedRoom.update();
	InsertedRoom.draw();
	if (InsertedRoom.mx == 0 && InsertedRoom.my == 0)
	{
		InsertedRoom.setPos(1000,750);
	}
	theEnd()
	if (movingPhase == "end")
	{
		ctx.font = "60px serif"
		ctx.fillText('Vége!!! Győztes: Játékos '+(player.id+1), 400, 300);
	}
	collectTrophie();
	drawAvelibleRooms();
	requestAnimationFrame(animate);
}

function load ()
{
	$("rulesButton").addEventListener("click",ShowRules,true)
	$("playerCount").addEventListener("change",playerChanging,true)
	$("trophieCount").addEventListener("change",trophieChanging,true)
	$("startButton").addEventListener("click",startGame,true)
	$("resetButton").addEventListener("click",resetGame,true)
}
document.addEventListener("load",load,true)