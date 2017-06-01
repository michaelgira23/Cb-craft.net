/**
 * For downloading server jars
 */

const fs = require('fs-extra');
const path = require('path');
const requestRegular = require('request');
const request = require('request-promise-native');

const vanilla = require('./jar-acquisition/vanilla');
const technic = require('./jar-acquisition/technic');
const atlauncher = require('./jar-acquisition/atlauncher');

const jarsDir = path.join(__dirname, '..', '..', 'jars');

async function ensureJarDownloaded(type, id, version) {

	let jarDownload;
	let jarDownloadDir;
	let jarDownloadPath;

	if (type === 'vanilla') {
		jarDownload = await vanilla.getDownloadUrl(version);
		jarDownloadDir = path.join(jarsDir, 'vanilla');
		jarDownloadPath = path.join(jarDownloadDir, `${jarDownload.version}.jar`);
	} else if (type === 'technic') {
		jarDownload = await technic.getDownloadUrl(id);
		jarDownloadDir = path.join(jarsDir, 'technic', id);
		jarDownloadPath = path.join(jarDownloadDir, `${jarDownload.version}.jar`);
	} else if (type === 'atlauncher') {
		jarDownload = await atlauncher.getDownloadUrl(id, version);
		jarDownloadDir = path.join(jarsDir, 'atlauncher', id);
		jarDownloadPath = path.join(jarDownloadDir, `${jarDownload.version}.jar`);
	} else {
		return Promise.reject(`Invalid type "${type}"!`);
	}

	// Check if server jar is already cached
	if (await fs.pathExists(jarDownloadPath)) {
		return Promise.resolve(jarDownloadPath);
	}

	// Ensure directory is there
	await fs.ensureDir(jarDownloadDir);

	return new Promise((resolve, reject) => {
		// Download jar
		try {
			const downloadStream = requestRegular(jarDownload.url);

			downloadStream.pipe(fs.createWriteStream(jarDownloadPath))
				// @TODO Print percentage of download
				// .on('data', data => {
				// 	console.log(data);
				// })
				.on('error', err => {
					downloadStream.abort();
					throw err;
				})
				.on('finish', () => {
					resolve(jarDownloadPath);
				});
		} catch (err) {
			reject(`There was a problem downloading the server jar! (${err})`);
		}
	});
}

module.exports = {
	ensureJarDownloaded
};
