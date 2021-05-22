class EventHandler {
	constructor() {
		this.listeners = new Set;
	}

	listen(type, callback) {
		this.listeners.add({
			type,
			callback
		})
	}

	emit(type, ...args) {
		this.listeners.forEach(listener => {
			//Cycle through all listeners and pull out requested one if it exists
			if(listener.type === type) {
				//Agnostic callback function to emit passed arguments 
				listener.callback(...args)
			}
		})
	}
}