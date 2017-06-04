const auth = require('./lib/auth');

module.exports.run = worker => {
	console.log('>> Worker PID:', process.pid);
	var scServer = worker.scServer;

	/*
	 * In here we handle our incoming realtime connections and listen for events.
	 */

	scServer.on('connection', socket => {
		console.log('Socket connected! :D', socket.authToken);

		socket.on('login', (credentials, respond) => {
			console.log('login', credentials);
			auth.login(credentials.ign, credentials.password)
				.then(user => {
					console.log('Login successful', user);
					respond();
					// Generate JWT
					socket.setAuthToken({
						ign: user.ign,
						scopes: user.scopes
					});
				})
				.catch(err => {
					console.log('Login error', err);
					respond(err);
				});
		});

		socket.on('disconnect', () => {
			console.log('Socket disconnect! ;-;');
		});
	});
};
