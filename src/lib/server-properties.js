const path = require('path');
const prop = require('properties-parser');

module.exports = class ServerProperties {

	constructor(server) {
		this.server = server;
		this.propertiesPath = path.join(server.directory, 'server.properties');
		this.values = {};
		console.log('values', this.values);
	}

	async setup() {
		this.editor = await ServerProperties.createEditor(this.propertiesPath);
	}

	get(key) {
		if (typeof key !== 'string') {
			// Return all of the properties
			return prop.parse(this.editor.toString());
		} else {
			// Return only one key-value pair
			return this.editor.get(key);
		}
	}

	async set(key, value) {
		return new Promise((resolve, reject) => {
			this.editor.set(key, String(value));
			this.editor.save(err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	static async init(server) {
		const properties = new ServerProperties(server);
		await properties.setup();
		return properties;
	}

	static createEditor(path) {
		return new Promise((resolve, reject) => {
			prop.createEditor(path, (err, editor) => {
				if (err) {
					reject(err);
				} else {
					resolve(editor);
				}
			});
		});
	}

	static parse(path) {
		return new Promise((resolve, reject) => {
			prop.read(path, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

}
