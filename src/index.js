const Server = require('./lib/server');

main();
async function main() {
	let mc;
	try {
		mc = await Server.createServer('vanilla-server', 'vanilla/1.11.2.jar');
		console.log('Created server!', mc);
	} catch (err) {
		console.log('Create server error!', err);
		if (err !== 'Server name already exists!') {
			console.log('Create server error!', err);
			return;
		} else {
			console.log('Server already exists!');
		}

		mc = new Server('vanilla-server');
	}

	mc.start();
}
