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