/**
 * For downloading modpack servers from the Technic Launcher
 */

const cheerio = require('cheerio');
const request = require('request-promise-native');

const baseUrl = '';
// From what I can tell, this is arbitrary and can be anything.
// It just has to be within a certain range, otherwise request is denied.
const buildNumber = '349';

function searchModpacks(queryString) {
	return request(`https://api.technicpack.net/search`, {
		qs: {
			build: buildNumber,
			q: queryString
		}
	})
		.then(JSON.parse)
		.then(body => {
			const packs = [];

			if (body.error) {
				throw body.error;
			}

			for (const pack of body.modpacks) {
				packs.push({
					id: pack.slug,
					name: pack.name,
					origin: 'technic',
					tags: [
						'modpack',
						'technic'
					]
				});
			}
			return packs;
		});
}

function getDownloadUrl(id) {
	return request(`https://technicpack.net/modpack/${id}`)
		.then(cheerio.load)
		.then($ => {

			const version = $('.modpack-title h1 small').text().replace('Version', '').trim();

			let downloadUrl = null;
			$('.sidebar-controls a').each((index, elem) => {
				const button = $(elem);
				if (button.text().includes('Server Download')) {
					downloadUrl = button.attr('href');
					return false;
				}
			});

			if (!downloadUrl) {
				throw `There is no download button for modpack "${id}"!`;
			}

			return {
				version,
				url: downloadUrl
			};
		});
}

module.exports = {
	searchModpacks,
	getDownloadUrl
};
