/**
 * For downloading servers for Vanilla Minecraft
 */

const request = require('request-promise-native');

const versionsEndpoint = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

function getVersions() {
	return getVersionsManifest()
		.then(async body => {
			const versions = [];
			for (const version of body.versions) {
				versions.push({
					id: version.id,
					name: `Vanilla Minecraft ${version.id}`,
					origin: 'vanilla',
					tags: [
						'vanilla',
						version.type
					]
				});
			}
			return versions;
		});
}

function getDownloadUrl(version = 'latest') {
	return getVersionsManifest()
		.then(body => {

			// If version equals 'latest,' get most recent release version
			if (version === 'latest') {
				version = body.latest.release;
			}

			for (const mcVersion of body.versions) {
				if (mcVersion.id === version) {
					return mcVersion.url;
				}
			}
			throw `Minecraft version "${version}" not found!`;
		})
		.then(url => request(url))
		.then(JSON.parse)
		.then(body => {
			return {
				version: body.id,
				url: body.downloads.server.url
			};
		});
}

function getVersionsManifest() {
	return request(versionsEndpoint)
		.then(JSON.parse);
}

module.exports = {
	getVersions,
	getDownloadUrl
};
