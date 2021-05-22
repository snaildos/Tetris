class Manager {
	constructor(document, isLocal = false) {
		this.isLocal = isLocal;
		this.document = document;
		this.template = this.document.querySelector('#player-template')
		// this.canvasContainer = document.getElementById('canvasContainer');
		this.localContainer = document.getElementById('localContainer');
		this.remoteContainer = document.getElementById('remoteContainer');

		this.instances = [];
	}

	createPropsBundle(element, index) {

		const TILESIZE = 20;
		const BOARD_WIDTH = 12;
		const BOARD_HEIGHT = 20;

		const COLOR_SCHEMES = [
			{
				pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
				outline: 'black',
			},
			{
				pieces: ['#A60037', '#F47992', '#FFE8B8', '#8BB195','#73725F', '#786171', '#00DDAA'],
				outline: 'black',
			},
			{
				pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
				outline: 'black',
			},
			{
				pieces: ['#A60037', '#F47992', '#FFE8B8', '#8BB195','#73725F', '#786171', '#00DDAA'],
				outline: 'black',
			},
		]

		const CANVAS_WIDTH = TILESIZE * (BOARD_WIDTH + 6);
		const CANVAS_HEIGHT = TILESIZE * BOARD_HEIGHT;

		//create a bundle 
		return {
			element: element,
			isLocal: this.isLocal,
			CANVAS_WIDTH,
			CANVAS_HEIGHT,
			TILESIZE,
			BOARD_HEIGHT,
			BOARD_WIDTH,
			colorScheme: COLOR_SCHEMES[index],
		}
		
	}

	createPlayer(local = false) {
		const element = document.importNode(this.template.content, true)
									 .children[0];
		const game = new Game(this.createPropsBundle(element, 0)); //need to dynamically change index later for color change

		//Add Game Instance to row based on whether or not is the local instance
		if (local) {
			this.localContainer.appendChild(game.element);	
		} else {
			this.remoteContainer.appendChild(game.element);
		}

		this.instances.push(game);

		return game;
	}

	removePlayer(game) {
		console.log('removing remote game')
		if (game.element.classList.contains('local')) {
			this.localContainer.removeChild(game.element);
		} else {
			this.remoteContainer.removeChild(game.element);
		}
	}

	// sortPlayers(players) {
	// 	players.forEach(player => {
	// 		this.canvasContainer.appendChild(player.element)
	// 	})
	// }
}
