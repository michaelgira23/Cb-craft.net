const request = require('request-promise-native');

const baseUrl = 'https://api.atlauncher.com/v1';

function getVersions() {
	return request(`${baseUrl}/packs/simple`)
		.then(JSON.parse)
		.then(body => {
			const packs = [];
			for (const pack of body.data) {
				packs.push({
					id: pack.safeName,
					name: pack.name,
					tags: [
						'modpack',
						'atlauncher'
					]
				});
			}
			return packs;
		});
}

function getDownloadUrl(id) {
	return request(`${baseUrl}/pack/${id}/latest`)
		.then(JSON.parse)
		.then(body => {
			if (!body.data.serverZipURL) {
				throw `No server download found for modpack ${id}!`;
			}
			return body.data.serverZipURL;
		});
}

module.exports = {
	getVersions,
	getDownloadUrl
};
