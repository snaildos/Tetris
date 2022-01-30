class Piece {
	constructor(board, type = this.newRandomType()) {
		this.ctx = board.ctx;
		this.tileSize = board.tileSize;
		this.type = type;
		this.matrix = this.createPiece(this.type);
		this.colorScheme = board.colorScheme;
		this.initX = Math.floor(board.width /2) - 2;
		this.initY = 0;
		this.pos = {
			x: this.initX,
			y: this.initY	
		}
	}

	newRandomType() {
		return 'TLJSZOI'[Math.random() * 7 | 0] //hardcoded variable quantity
	}

	createPiece(type) {
		switch (type) {
			case 'T':
				return ([
							[0,1,0],
							[1,1,1],
							[0,0,0],
						])
			case 'L':
				return ([
							[0,0,2],
							[2,2,2],
							[0,0,0],
						])
			case 'O':
				return ([
							[3,3],
							[3,3],
						])
			case 'J':
				return ([
							[4,0,0],
							[4,4,4],
							[0,0,0],
						])
			case 'I':
				return ([
							[0,5,0,0],
							[0,5,0,0],
							[0,5,0,0],
							[0,5,0,0],
						])
			case 'S':
				return ([
							[0,6,6],
							[6,6,0],
							[0,0,0],
						])
			case 'Z':
				return ([
							[7,7,0],
							[0,7,7],
							[0,0,0],
						])
		}
	}

	rotate(direction) {
		let swapped = JSON.parse(JSON.stringify(this.matrix));
		for(let y = 0; y < swapped.length; y++) {
			for (let x = y; x < swapped[y].length; x++) {
				[swapped[y][x], swapped[x][y]] = [swapped[x][y], swapped[y][x]]
			}
		}
		if(direction === 1) {
			for(let i = 0; i < swapped.length; i++) {
				swapped[i].reverse();
			}
		} else if (direction === -1){
			swapped.reverse();
		}
		this.matrix = swapped;
	}

	render() {
		drawMatrix(this.ctx, this.matrix, this.pos, this.tileSize, this.colorScheme);
	}
}

