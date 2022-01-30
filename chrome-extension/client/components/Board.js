class Board {
	constructor(props) {
		//should start tracking x/y for multiple boards later
		this.width = props.BOARD_WIDTH;
		this.height = props.BOARD_HEIGHT;
		this.tileSize = props.TILESIZE;
		this.ctx = props.ctx;
		this.matrix = this.generateEmptyBoard();
		this.colorScheme = props.colorScheme;
	}

	generateEmptyBoard() {
		const matrix = [];
		for(let i = 0; i < this.height; i++){ 
			matrix.push(new Array(this.width).fill(0))
		};
		return matrix;
	}

	//Why is the matrix an empty aray returning undefined?
	mergePiece(piece) {
		for (let y = 0; y < piece.matrix.length; y++) {
			for (let x = 0; x < piece.matrix[y].length; x++) {
				if(piece.matrix[y][x] !== 0){	
					this.matrix[y + piece.pos.y][x + piece.pos.x] = piece.matrix[y][x];
				}
			}
		}
	}

	render() {
		drawMatrix(this.ctx, this.matrix, {x: 0, y: 0}, this.tileSize, this.colorScheme)
	}
}

