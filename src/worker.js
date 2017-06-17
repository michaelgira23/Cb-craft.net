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

		/**
		 * Downloading jars
		 */

		socket.on('jars.search', ({ origin = 'vanilla', query = '' }, res) => {
			jars.queryJars(origin, query)
				.then(results => {
					res(null, results);
				})
				.catch(err => {
					res(err);
				});
		});

		socket.on('jars.download', ({ origin, id }, res) => {
			console.log('Download jar', origin, id);

			let responded = false;
			let version;

			jars.ensureJarDownloaded(origin, id, (downloadVersion, progress) => {
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
			})
				.then(download => {
					if (!responded) {
						responded = true;
						res(null);
					}

					scServer.exchange.publish('jars.status', {
						action: 'complete',
						data: { origin, id, version: download.version, progress: null }
					});
				})
				.catch(err => {
					console.log('Download jars error', err);
					res(err);
				});
		});

		/**
		 * Admin stuff
		 */

		socket.on('admin.canCreateAdmin', (data, res) => {
			auth.getUsers()
				.then(users => {
					res(null, users.length < 1);
				})
				.catch(err => {
					res(err);
				});
		});

		socket.on('admin.createUser', async (info, res) => {

			// Check if admin
			const scopes = info.scopes || [];
			if (!socket.authToken || !socket.authToken.scopes.includes('admin')) {
				let users;
				try {
					users = await auth.getUsers();
				} catch (err) {
					res(err);
					return;
				}

				// If no users, allow this user to be created and make this user admin
				if (users.length > 0) {
					res('You do not have sufficient permissions!');
					return;
				}

				// Make sure this user is admin
				if (!scopes.includes('admin')) {
					scopes.push('admin');
				}
			}

			auth.createUser(info.ign, info.name, info.password, scopes)
				.then(user => {
					res(null, user);
				})
				.catch(err => {
					res(err);
				});
		});

	});
};
