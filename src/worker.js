const auth = require('./lib/auth');
const jars = require('./lib/jars');

module.exports.run = worker => {
	console.log('>> Worker PID:', process.pid);
	var scServer = worker.scServer;

	/*
	 * In here we handle our incoming realtime connections and listen for events.
	 */

	scServer.on('connection', socket => {
		console.log('Socket connected! :D', socket.authToken);

		socket.on('login', (credentials, res) => {
			auth.login(credentials.ign, credentials.password)
				.then(user => {
					res(null);
					// Generate JWT
					socket.setAuthToken({
						ign: user.ign,
						scopes: user.scopes
					});
				})
				.catch(err => {
					console.log('Login error', err);
					res(err);
				});
		});

		socket.on('disconnect', () => {
			console.log('Socket disconnect! ;-;');
		});

		socket.on('search', async ({ origin = 'vanilla', query = '' }, res) => {
			try {
				res(null, await jars.queryJars(origin, query));
			} catch (err) {
				console.log('Search error', err);
				res(err);
			}
		});
	});
};
