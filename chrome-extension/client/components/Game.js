class Game {

	constructor(props) {
		//create canvas
		this.element = props.element;
		this.canvas = this.element.querySelector('.gameCanvas');
		this.canvas.width = props.CANVAS_WIDTH;
		this.canvas.height = props.CANVAS_HEIGHT;
		
		//Add the canvas context into the existing props defining canvas structure
		this.ctx = this.canvas.getContext('2d');
		this.props = Object.assign({}, props, {ctx: this.ctx});

		this.player = new Player(this.props);
		
		this.paused = false;

		//Used to control drop timing
		this.DROP_INIT = 1000;
		this.initSpeed = .8;
		this.speedModifier = this.initSpeed;

		this.dropInterval = this.DROP_INIT * this.speedModifier; //in milliseconds
		this.dropCounter = 0;
		this.lastTime = 0;

		this.run = this.run.bind(this);

	}



	drawGameBG() {
		let ctx = this.props.ctx;
		//This is the Sidebar color
		ctx.fillStyle = 'rgba(175,150,200, .3)';
		ctx.fillRect(0,0, this.props.CANVAS_WIDTH, this.props.CANVAS_HEIGHT);	
		//Playing area black
		ctx.fillStyle = 'rgba(0,0,0, 1)';
		ctx.fillRect(0,0, this.props.BOARD_WIDTH * this.props.TILESIZE + 2, this.props.BOARD_HEIGHT * this.props.TILESIZE);	
		//Border of playing area
		ctx.strokeStyle = 'white';
		ctx.strokeRect(0,0, this.props.BOARD_WIDTH * this.props.TILESIZE + 2, this.props.BOARD_HEIGHT * this.props.TILESIZE);
		//Border and fill of preview area
		ctx.strokeRect(this.props.TILESIZE * this.props.BOARD_WIDTH + 10, 10, 100, 100);
		ctx.fillStyle = 'rgba(100,100,150, .5)';
		ctx.fillRect(this.props.TILESIZE * this.props.BOARD_WIDTH + 10, 10, 100, 100);	

		canvasText(this.ctx, 'SCORE', 'Audiowide', '25px', ((this.player.board.width * this.player.board.tileSize) + 60), 170, 80,'yellow', 'center')
		canvasText(this.ctx, this.player.score, 'Audiowide', '20px', ((this.player.board.width * this.player.board.tileSize) + 60), 210, 80,'white', 'center')
		canvasText(this.ctx, 'LINES', 'Audiowide', '25px', ((this.player.board.width * this.player.board.tileSize) + 60), 250, 80, 'yellow', 'center')
		canvasText(this.ctx, this.player.linesCleared, 'Audiowide', '25px', ((this.player.board.width * this.player.board.tileSize) + 60), 290, 80,'white', 'center')
		canvasText(this.ctx, 'LEVEL', 'Audiowide', '25px', ((this.player.board.width * this.player.board.tileSize) + 60), 330, 80,'yellow', 'center')
		canvasText(this.ctx, this.player.level + 1, 'Audiowide', '25px', ((this.player.board.width * this.player.board.tileSize) + 60), 370, 80,'white', 'center')

	}

	draw() {
		cls(this.props);
		this.drawGameBG();
		if(this.paused) {
			this.drawPaused();
		} else if (this.player.isDead){
			this.player.board.render();
			this.player.render();
			this.drawDead();
		} else {
			this.player.board.render();
			this.player.render();			
		}		
	}

	pause() {
		this.paused = !this.paused;
		this.player.eventHandler.emit('pauseStatus', this.paused)
	}

	drawPaused() {
		let ctx = this.props.ctx;
		ctx.fillStyle = 'rgba(100,100,150, .85)';
		ctx.fillRect(1 * this.props.TILESIZE, 8 * this.props.TILESIZE, 10 * this.props.TILESIZE, 4 * this.props.TILESIZE)
		ctx.strokeStyle = 'white';
		ctx.strokeRect(1 * this.props.TILESIZE, 8 * this.props.TILESIZE, 10 * this.props.TILESIZE, 4 * this.props.TILESIZE);
		canvasText(ctx, 'PAUSED', 'Audiowide', '25px', 6 * this.props.TILESIZE, 10.5 * this.props.TILESIZE, 80, 'white', 'center')		
	}

	drawDead() {
		let ctx = this.props.ctx;
		ctx.fillStyle = 'rgba(100,100,150, .85)';
		ctx.fillRect(1 * this.props.TILESIZE, 8 * this.props.TILESIZE, 10 * this.props.TILESIZE, 4 * this.props.TILESIZE)
		ctx.strokeStyle = 'white';
		ctx.strokeRect(1 * this.props.TILESIZE, 8 * this.props.TILESIZE, 10 * this.props.TILESIZE, 4 * this.props.TILESIZE);
		canvasText(ctx, 'GAME OVER', 'Audiowide', '60px', 6 * this.props.TILESIZE, 11 * this.props.TILESIZE, 180, 'white', 'center')			
	}

	//requestAnimationFrame returns callback with single argument of timestamp
	//On first run through needs to have a placeholder of 0
	run(time = 0) {

		//This is an attempt to stop the glitching where localInstances of copies are automatically drawing drops between
		//remote updates
		//Note: It's not working. Perhaps I'm broadcasting redundantly instead. But this may still cut down on a bit cycles on the
		//local client
		if(this.props.isLocal) {

			//Allow the game to speed up incrementally based on current level (Maxes at 10)
			this.dropInterval = this.DROP_INIT * this.speedModifier;
			
			const deltaTime = time - this.lastTime;
			this.lastTime = time;
			this.dropCounter += deltaTime;
			if(!this.paused) {
				if (this.dropCounter > this.dropInterval) {
					if(!this.player.isDead) {
						//This last IF is because the program was running initially without a board or piece to merge and throwing an error
						if(this.player.board.matrix.length && this.player.activePiece.matrix !== undefined) {

							this.player.dropPiece();
							this.dropCounter = 0;						
						}
					}
				}
			}
			requestAnimationFrame(this.run);					
		}
		this.updateDropInterval()
		this.draw();			
		
	}

	updateDropInterval() {
		// if (player.linesCleared) <- Could add handling only in this case for efficiency
		this.speedModifier = .8 - (this.player.level * 0.07);
	}

	sendLocalState() {
		//Send local state to server to broadcast to all other players
		return {
			board: this.player.board.matrix,
			activePieceMatrix: this.player.activePiece.matrix,
			activePiecePos: this.player.activePiece.pos,
			nextPieceMatrix: this.player.nextPiece.matrix,
			score: this.player.score,
			linesCleared: this.player.linesCleared,
			pauseStatus: this.paused,
			level: this.player.level,
		}
	}

	receiveRemoteState(state) {
		//Update local copies of remote instance's state

		this.player.board.matrix = Object.assign(state.boardMatrix);
		this.player.activePiece.matrix = Object.assign(state.activePieceMatrix);
		this.player.activePiece.pos = Object.assign(state.activePiecePos);
		this.player.nextPiece.matrix = Object.assign(state.nextPieceMatrix);
		this.player.score = state.score;
		this.player.linesCleared = state.linesCleared;
		this.player.level = state.level;
		this.paused = state.pauseStatus;
		this.draw();
	}

}
