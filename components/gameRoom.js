function gameRoom (io, socket) {

	const client = createClient(socket);

	socket.on('message', (packet) => {
		const data = JSON.parse(packet);

		if(data.type === 'createSession'){

			console.log('Creating Session')

			const session = createSession(generateRandomId());
			session.join(client);

			client.send({
				type: 'sessionCreated', 
				id: session.id,
			});
		} 

		else if (data.type === 'joinSession') {

			console.log('Client joined session')

			const session = sessionsMap.get(data.id) || createSession(data.id);
			session.join(client);

			//Update clients with new player joined to session
			broadcastSession(session);
		}

		else if (data.type === 'clientUpdate') {
			//Receive state updates from clients
			client.state[data.key] = data.state;
			client.broadcast(data)
		}
	});

	socket.on('disconnect', () => {

		console.log('Client disconnected from session');

		const session = client.session;
		if(session) {
			session.leave(client);
			if(session.clients.size === 0) {
				sessionsMap.delete(session.id)
			}
		}

		//update clients when a player disconnects
		broadcastSession(session);
	})

}

module.exports = gameRoom;