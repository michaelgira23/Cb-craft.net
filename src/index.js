const Server = require('./lib/server');

main();
async function main() {
	try {
		const mc = await Server.createServer('vanilla-server', 'vanilla/1.11.2.jar');
		console.log('Created server!', mc);
	} catch (err) {
		console.log('Create server error!', err);
	}
}
