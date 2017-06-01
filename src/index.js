// const Server = require('./lib/server');
//
// main();
// async function main() {
// 	let mc;
// 	try {
// 		mc = await Server.createServer('vanilla-server', 'vanilla/1.11.2.jar');
// 		console.log('Created server!', mc);
// 	} catch (err) {
// 		console.log('Create server error!', err);
// 		if (err !== 'Server name already exists!') {
// 			console.log('Create server error!', err);
// 			return;
// 		} else {
// 			console.log('Server already exists!');
// 		}
//
// 		mc = new Server('vanilla-server');
// 	}
//
// 	mc.start();
// }

// const vanilla = require('./lib/jar-acquisition/technic');

const downloadJar = require('./lib/download-jar');

// downloadJar.ensureJarDownloaded('vanilla', 'minecraft', 'latest')
downloadJar.ensureJarDownloaded('technic', 'attack-of-the-bteam', 'latest')
// downloadJar.ensureJarDownloaded('atlauncher', 'SkyFactory', 'latest')
	.then(data => {
		console.log('All done!', data);
	})
	.catch(err => {
		console.log('Download jar error!', err);
	});
