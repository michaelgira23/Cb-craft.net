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

		socket.on('jars.search', async ({ origin = 'vanilla', query = '' }, res) => {
			try {
				res(null, await jars.queryJars(origin, query));
			} catch (err) {
				console.log('Search error', err);
				res(err);
			}
		});

		socket.on('jars.download', async ({ origin, id }, res) => {
			console.log('Download jar', origin, id);
			try {
				let responded = false;
				let version;
				await jars.ensureJarDownloaded(origin, id, (downloadVersion, progress) => {
					version = downloadVersion;
					if (!responded) {
						responded = true;
						res(null);
					}
					console.log('Download progress', progress);
					scServer.exchange.publish('jars.status', {
						action: 'progress',
						data: { origin, id, version, progress }
					});
				});

				scServer.exchange.publish('jars.status', {
					action: 'complete',
					data: { origin, id, version, progress: null }
				});

				console.log('Download complete!');
			} catch (err) {
				console.log('Download jars error', err);
				res(err);
			}
		});

	});
};
