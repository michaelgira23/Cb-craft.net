/*
const port = 1555;

let config;
try {
	config = require('./config');
} catch (err) {
	if (err.message === 'Cannot find module \'./config\'') {
		throw new Error('***Please create a config.js on your local system! Refer to /src/lib/congif.example.js!***');
	} else {
		throw err;
	}
}

const path = require('path');
const { SocketCluster } = require('socketcluster');
const scHotReboot = require('sc-hot-reboot');

const socketCluster = new SocketCluster({
	workers: 1,
	port,
	appName: 'cbcraft',
	wsEngine: 'uws',
	workerController: path.join(__dirname, 'worker.js'),
	// Whether or not to reboot the worker in case it crashes (defaults to true)
	rebootWorkerOnCrash: true
});

if (!config.production) {
	// If dev environment, add hot reboot
	console.log(`Watching for code changes in directory: ${__dirname}`);
	scHotReboot.attach(socketCluster, {
		cwd: __dirname
	});
}
*/

const auth = require('./lib/auth');
auth.createUser('Ccoolboy', 'Michael')
	.then(data => {
		console.log(data);
	})
	.catch(err => {
		console.log('Problem with creating user!', err);
	});
// auth.login('michael', 'fds')
// 	.then(data => {
// 		console.log('Login', data);
// 	})
// 	.catch(err => {
// 		console.log('Get credentials error');
// 	});
