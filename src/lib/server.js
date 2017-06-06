/**
 * For actually controlling the different Minecraft servers
 */

const fs = require('fs-extra');
const path = require('path');
const ServerProperties = require('./server-properties');

const ScriptServer = require('scriptserver');
const scriptServerModules = [
	require('scriptserver-event'),
	require('scriptserver-command'),
	require('scriptserver-util'),
	require('scriptserver-json'),
	require('scriptserver-essentials'),
	require('scriptserver-update')
];

const jarsDir = path.join(__dirname, '..', '..', 'data', 'jars');
const serversDir = path.join(__dirname, '..', '..', 'data', 'servers');
const templateDir = path.join(__dirname, '..', '..', 'server-template');

module.exports = class Server {

	constructor(serverName, options = {}) {
		this.serverName = serverName;
		this.directory = path.join(serversDir, serverName);
		this.minGb = options.minGb || 2;
		this.maxGb = options.minGb || 4;
		this.running = false;

		// Set ScriptServer (wrapper for Minecraft server)
		this.scriptServer = new ScriptServer({
			serverprocess: {
				cwd: this.directory
			},
			jsonDir: path.join(this.directory, 'json'),
			command: {
				prefix: '!'
			}
		});

		for (const module of scriptServerModules) {
			this.scriptServer.use(module);
		}

		this.scriptServer.on('console', data => {
			console.log(`[EVENT "CONSOLE"]`, data);
		});

		this.scriptServer.on('chat', data => {
			console.log(`[EVENT "CHAT"]`, data);
		});

		this.scriptServer.on('login', data => {
			console.log(`[EVENT "LOGIN"]`, data);
		});

		this.scriptServer.on('logout', data => {
			console.log(`[EVENT "LOGOUT"]`, data);
		});

		this.scriptServer.on('achievement', data => {
			console.log(`[EVENT "ACHIEVEMENT"]`, data);
		});

		this.scriptServer.on('start', data => {
			console.log(`[EVENT "STOP"]`, data);
		});

		this.scriptServer.on('exit', data => {
			console.log(`[EVENT "EXIT"]`, data);
		});

		this.scriptServer.on('onstart', data => {
			console.log(`[EVENT "ONSTART"]`, data);
		});

		this.scriptServer.on('onstop', data => {
			console.log(`[EVENT "ONSTOP"]`, data);
		});
	}

	// Basically constructor, but asynchronous
	async setup() {
		this.properties = await ServerProperties.init(this);
	}

	start() {
		if (!this.running) {
			this.scriptServer.start(
				path.join(this.directory, 'server.jar'),
				[`-Xms${this.minGb}G`, `-Xmx${this.maxGb}G`]
			);
		}
		this.running = true;
	}

	stop() {
		if (this.running) {
			this.scriptServer.stop();
		}
		this.running = false;
	}

	restart() {
		this.stop();
		this.start();
	}

	static async init(serverName, options = {}) {
		const server = new Server(serverName, options);
		await server.setup();
		return server;
	}

	static create(name, jar, options = {}) {

		const jarPath = path.join(jarsDir, jar);
		const serverDir = path.join(serversDir, name);

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
			// Copy over boilerplate server
			.then(() => fs.copy(templateDir, serverDir))
			// Copy over jar
			.then(() => fs.copy(jarPath, path.join(serverDir, 'server.jar')))
			// Return server object
			.then(() => Server.init(name, options));
	}

}
