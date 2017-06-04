/**
 * Authentication
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const database = require('./database');

async function createUser(ign, name, password = null) {
	if (typeof ign !== 'string') {
		return Promise.reject('Invalid IGN!');
	}

	if (typeof name !== 'string') {
		return Promise.reject('Invalid name!');
	}

	// If no password, default to a random 5-digit hex code
	if (typeof password !== 'string') {
		password = await generateRandomHex(5);
	}

	if (!await database.isUnique('users', { ign, name })) {
		return Promise.reject(`User ${ign} already exists in database!`);
	}

	return database.pushToArray('users', {
		ign,
		name,
		password
	});
}

function generateRandomHex(length) {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(Math.ceil(length / 2), (err, buffer) => {
			if (err) throw err;
			resolve(buffer.toString('hex').substr(0, length));
		});
	});
}

module.exports = {
	createUser,
	generateRandomHex
};
