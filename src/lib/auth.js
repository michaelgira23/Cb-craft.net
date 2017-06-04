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

	const hashedPassword = await hashPassword(password);

	return database.pushToArray('users', { ign, name, password: hashedPassword })
		.then(() => {
			// Return normal password, not hashed
			return { ign, name, password };
		});
}

function login(ign, password) {
	return getUser(ign)
		.then(async user => {
			if (user && await bcrypt.compare(password, user.password)) {
				return true;
			} else {
				throw 'Invalid username/password!';
			}
		});
}

function changePassword(ign, newPassword) {
	return getUser(ign)
		.then(async user => {
			if (!user) {
				throw 'User doesn\'t exist!';
			}
			const newHashedPassword = await hashPassword(newPassword);
			return updateUser(ign, { password: newHashedPassword });
		})
}

function getUser(ign) {
	return database.getDb()
		.then(db => {
			let user = null;
			for (const dbUser of db.users) {
				if (dbUser.ign === ign) {
					user = dbUser;
					break;
				}
			}
			return user;
		});
}

function updateUser(ign, newProperties) {
	return database.getDb()
		.then(db => {
			for (let user of db.users) {
				if (user.ign === ign) {
					for (const updateProp of Object.keys(newProperties)) {
						const updateValue = newProperties[updateProp];
						user[updateProp] = updateValue;
					}
				}
			}
			return database.writeToDb(db);
		})
}

function hashPassword(password) {
	return bcrypt.hash(password, 10);
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
	login,
	changePassword
};
