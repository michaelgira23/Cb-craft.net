/**
 * For downloading server jars
 */

const fs = require('fs-extra');
const path = require('path');
const progress = require('request-progress');
const requestRegular = require('request');
const request = require('request-promise-native');

const vanilla = require('./jar-acquisition/vanilla');
const technic = require('./jar-acquisition/technic');
const atlauncher = require('./jar-acquisition/atlauncher');

const jarsDir = path.join(__dirname, '..', '..', 'data', 'jars');

async function ensureJarDownloaded(origin, id, onProgressChange = () => {}) {

	let jarDownload;
	let jarDownloadDir;
	let jarDownloadPath;

	switch (origin) {
		case 'vanilla':
			jarDownload = await vanilla.getDownloadUrl(id);
			jarDownloadDir = path.join(jarsDir, 'vanilla');
			jarDownloadPath = path.join(jarDownloadDir, `${jarDownload.version}.jar`);
			break;
		case 'technic':
			jarDownload = await technic.getDownloadUrl(id);
			jarDownloadDir = path.join(jarsDir, 'technic', id);
			jarDownloadPath = path.join(jarDownloadDir, `${jarDownload.version}.jar`);
			break;
		case 'atlauncher':
			jarDownload = await atlauncher.getDownloadUrl(id);
			jarDownloadDir = path.join(jarsDir, 'atlauncher', id);
			jarDownloadPath = path.join(jarDownloadDir, `${jarDownload.version}.jar`);
			break;
		default:
			return Promise.reject(`Invalid type "${type}"!`);
	}

	// Check if server jar is already cached
	if (await fs.pathExists(jarDownloadPath)) {
		return Promise.resolve({ version: jarDownload.version, path: jarDownloadPath });
	}

	// Ensure directory is there
	await fs.ensureDir(jarDownloadDir);

	return new Promise((resolve, reject) => {
		try {

			// Download jar
			progress(requestRegular(jarDownload.url))
				.on('progress', state => {
					onProgressChange(jarDownload.version, state);
				})
				.on('error', err => {
					throw err;
				})
				.on('end', () => {
					resolve({ version: jarDownload.version, path: jarDownloadPath });
				})
				.pipe(fs.createWriteStream(jarDownloadPath));

		} catch (err) {
			reject(`There was a problem downloading the server jar! (${err})`);
		}
	});
}

async function queryJars(origin, query) {
	switch (origin) {
		case 'vanilla':
			return await vanilla.getVersions();
		case 'technic':
			if (query === '') {
				return await technic.popularModpacks();
			} else {
				return await technic.searchModpacks(query);
			}
		case 'atlauncher':
			return await atlauncher.getVersions();
		default:
			return [];
	}
}

module.exports = {
	ensureJarDownloaded,
	queryJars
};
