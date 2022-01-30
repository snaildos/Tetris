class ConnectionManager {
	constructor(manager) {
		this.connection = null;
		this.peers = new Map;
		this.manager = manager;
		this.localInstance = this.manager.instances[0];

	}

	connect() {
		this.connection = io.connect()

		this.connection.on('connect', () => {
			console.log('Connected to server');

			this.initSession();
			this.initEventHandlers();
			this.localStateListeners();
			this.updateServer();

			//All server messages will be handled through here instead of separate emit/on handlers
			this.connection.on('message', (packet) => {
				this.receive(packet);
			});
		});
	}

	receive(packet) {
		const data = JSON.parse(packet);

		if (data.type === 'sessionCreated') {
			//This hash will act as the session/room id to sync players
			window.location.hash = data.id;
		}
		else if (data.type === 'sessionBroadcast') {
			//adding on new remote instances to track
			this.updateManager(data.peers);
		}
		else if (data.type === 'clientUpdate') {
			this.updatePeer(data)
		}
	}

	send(data) {
		const packet = JSON.stringify(data);
		this.connection.send(packet);
	}

	initSession() {
		const sessionId = window.location.hash.split('#')[1];
		const localState = this.localInstance.sendLocalState()
		if(sessionId) {
			console.log('Joining Session', sessionId)
			this.send({
				type: 'joinSession',
				id: sessionId,
				state: localState
			});
		} else {
			console.log('Creating session')
			this.send({
				type: 'createSession'
			})
		}
	}

	initEventHandlers() {
		//Have server broadcast state for new instances to overwrite defaults on initializing them
		const player = this.localInstance.player;

		player.eventHandler.emit('pauseStatus', this.localInstance.paused)
		player.eventHandler.emit('boardMatrix', player.board.matrix); 
		player.eventHandler.emit('activePieceMatrix', player.activePiece.matrix);	
		player.eventHandler.emit('nextPieceMatrix', player.nextPiece.matrix);
		player.eventHandler.emit('score', player.score);
		player.eventHandler.emit('linesCleared', player.linesCleared);
		player.eventHandler.emit('activePiecePos', player.activePiece.pos);				
	}


	//Listening to all important changes to local instance state to broadcast to server
	localStateListeners() {
		//This could be refactored to avoid duplication. But for now I like seeing it clearly delineated
		this.localInstance.player.eventHandler.listen('score', state => {
			this.send({
				type: 'clientUpdate',
				key: 'score',
				state,
			})			
		})

		this.localInstance.player.eventHandler.listen('linesCleared', state => {
			this.send({
				type: 'clientUpdate',
				key: 'linesCleared',
				state,
			})			
		})

		this.localInstance.player.eventHandler.listen('level', state => {
			this.send({
				type: 'clientUpdate',
				key: 'level',
				state,
			})			
		})

		this.localInstance.player.eventHandler.listen('activePiecePos', state => {
			this.send({
				type: 'clientUpdate',
				key: 'activePiecePos',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('activePieceMatrix', state => {
			this.send({
				type: 'clientUpdate',
				key: 'activePieceMatrix',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('nextPieceMatrix', state => {
			this.send({
				type: 'clientUpdate',
				key: 'nextPieceMatrix',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('boardMatrix', state => {
			this.send({
				type: 'clientUpdate',
				key: 'boardMatrix',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('pauseStatus', state => {
			this.send({
				type: 'clientUpdate',
				key: 'pauseStatus',
				state,
			})
		})		
	}

	updateServer() {
		//Compose packet with local game state to send to server to broadcast 
		const stateBundle = this.localInstance.sendLocalState();
		for(let key in stateBundle) {
			const packet = {
				type: 'clientUpdate',
				key,
				state: stateBundle[key]
			}
			this.send(packet);
		}
	}

	//Handle new remote clients joining session or leaving session
	updateManager(instances) {
		//Create a filtered list of remote peers
		const myId = instances.you;
		const remoteInstances = instances.clients.filter(client => client.id !== myId)

		//create local copies of remote instances and initialize their state
		remoteInstances.forEach(instance => {
			if(!this.peers.has(instance.id)) {
				//Create and initialize new local instance (needs to be given remote state or else random seed)
				const newInstance = this.manager.createPlayer();
				this.peers.set(instance.id, newInstance)
				newInstance.receiveRemoteState(instance.state); 
				newInstance.run();
			}
		})

        resizeCanvas(); //Immediately resize new copies of remote games to fit window

		//Create an array of the Map entries corresponding to each remote client
		const entries = [...this.peers.entries()];
		//Remove any client from the local DOM that have disconnected from the server
		entries.forEach(([id, game]) => {
            if (!remoteInstances.some(client => client.id === id)) {
                this.manager.removePlayer(game);
                this.peers.delete(id);
            }			
		})
		
		//TODO: Sort so local player is always in first position
        // const local = this.manager.instances[0];
        // const sorted = instances.clients.map(client => this.peers.get(client.id) || local);
        // this.manager.sortPlayers(sorted);	
	}	

	//Update local copies of remote instances with state changes.
	updatePeer(data) {
        if (!this.peers.has(data.clientId)) {
            throw new Error('Client does not exist', data.clientId);
        }

        const game = this.peers.get(data.clientId);
        const player = game.player;

        if (data.key === 'activePieceMatrix') {
        	player.activePiece.matrix = data.state;
        }
        else if (data.key === 'activePiecePos') {
        	player.activePiece.pos = data.state;
        }
        else if (data.key === 'nextPieceMatrix') {
        	player.nextPiece.matrix = data.state;
        }
        else if (data.key === 'boardMatrix') {
        	player.board.matrix = data.state;
        }
        else if (data.key === 'score') {
        	player.setScore(data.state);
        }
        else if (data.key === 'linesCleared') {
        	player.setLines(data.state);
        }
        else if (data.key === 'level') {
        	player.level = data.state;
        } 
        else if (data.key === 'pauseStatus') {
        	game.paused = data.state;
        }
	}
}