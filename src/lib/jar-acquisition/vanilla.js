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
					tags: [
						'vanilla',
						version.type
					]
				});
			}
			return versions;
		});
}

function getDownloadUrl(id) {
	return getVersionsManifest()
		.then(body => {
			for (const version of body.versions) {
				if (version.id === id) {
					return version.url;
				}
			}
			throw `Minecraft version ${id} not found!`;
		})
		.then(url => request(url))
		.then(JSON.parse)
		.then(body => body.downloads.server.url);
}

function getVersionsManifest() {
	return request(versionsEndpoint)
		.then(JSON.parse);
}

module.exports = {
	getVersions,
	getDownloadUrl
};
