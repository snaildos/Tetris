const manager = new Manager(document, true);
const playerLocal = manager.createPlayer(true);
playerLocal.element.classList.add('local');
playerLocal.run();

const connectionManager = new ConnectionManager(manager);

connectionManager.connect()

resizeCanvas(); //Immediately scales local player's canvas to fit

const playerKeys = [
	{
		left: 65,
		right: 68,
		down: 83,
		drop: 32,
		rotateClock: 69,
		rotateCount: 81,
		pause: 80,
		w: 87,
	}
]

window.addEventListener("resize", resizeCanvas, false);
document.addEventListener('keydown', handleKeydown);

function handleKeydown(event) {
	playerKeys.forEach( (key, index) => {
		const player = playerLocal.player;
		if(!player.isDead){
			if(event.keyCode === key.left) {
				//'a'
				player.movePiece(-1)
			} else if (event.keyCode === key.right) {
				//'d'
				player.movePiece(1)
			} else if (event.keyCode === key.down) {
				//'s' accelerate drop
				player.dropPiece()
			} else if (event.keyCode === key.rotateClock) {
				//'e' for rotate clockwise
				player.rotatePiece(1);
			} else if (event.keyCode === key.rotateCount) {
				//'q' for rotate counter-clockwise
				player.rotatePiece(-1)
			} else if (event.keyCode === key.drop) {
				//'Spacebar' for quick drop
				player.instantDrop();
			} else if (event.keyCode === key.pause) {
				//'p' for pause
				playerLocal.pause();
			} else if (event.keyCode === key.w) {
				//'w' for rotate counter-clockwise
				player.rotatePiece(1)
			}
		}
	})
}

//TODO: improve wall kick handling (sometimes it kicks the piece two squares over without even rotating)

//Is there a way to prerender canvases to return snapshots of the other players score?
//That would be way easier than rendering two more canvases concurrently

//TODO: Add Menu Screen (Homepage)
//		-Users can see open rooms
//		-can join a room or create a new one
//		-when they join/create, they are prompted to enter a username
//TODO: Add in User name display in game screen
//TODO: Build chat box