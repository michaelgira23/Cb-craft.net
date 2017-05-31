const fs = require('fs-extra');
const path = require('path');

const jarsDir = path.join(__dirname, '..', '..', 'jars');
const serversDir = path.join(__dirname, '..', '..', 'servers');

module.exports = class Server {

	constructor(serverName) {
		this.serverName = serverName;
		this.directory = path.join(serversDir, serverName);
	}

	static async createServer(name, jar, options = {}) {

		const jarPath = path.join(jarsDir, jar);
		const serverDir = path.join(serversDir, name);

		console.log('Create server', jarPath, serverDir);

		// Check if server already exists
		return fs.pathExists(serverDir)
			.then(exists => {
				if (exists) {
					throw 'Server name already exists!';
				}
			})
			// Check if jar exists
			.then(() => fs.pathExists(jarPath))
			.then(exists => {
				if (!exists) {
					throw 'Server jar does not exist!';
				}
			})
			// Create server folder
			.then(() => fs.ensureDir(serverDir))
			// Copy over jar
			.then(() => fs.copy(jarPath, path.join(serverDir, 'server.jar')))
			// Return server object
			.then(() => new Server(name));
	}

}
