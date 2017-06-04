/**
 * We could use a database, but I'm working offline and also I'm too lazy so a JSON file will work
 */

const fs = require('fs-extra');
const path = require('path');

const dbDir = path.join(__dirname, '..', '..', '"database".json');

function isUnique(property, values) {
	return getDb()
		.then(json => {
			// Go through entries in database
			const data = json[property];
			for (const datum of data) {
				// Go through all of the properties in the `values` parameter and see if they're all equal
				let matches = true;
				for (const checkProp of Object.keys(values)) {
					if (datum[checkProp] !== values[checkProp]) {
						matches = false;
						break;
					}
				}
				if (matches) {
					return false;
				}
			}
			return true;
		});
}

function pushToArray(property, value) {
	return getDb()
		.then(json => {
			json[property].push(value);
			return writeToDb(json);
		});
}

function getDb() {
	let existingJSON = {
		users: []
	};

	return fs.pathExists(dbDir)
		.then(async exists => {
			if (exists) {
				existingJSON = await fs.readJson(dbDir);
			}
		})
		.then(() => writeToDb(existingJSON));
}

function writeToDb(json) {
	return fs.outputJson(dbDir, json, { spaces: '\t' })
		.then(() => json);
}

module.exports = {
	isUnique,
	pushToArray,
	getDb,
	writeToDb
};
