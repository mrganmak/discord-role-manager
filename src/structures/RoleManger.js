const localization = require('../localization.json');
const { EventEmitter } = require('events');
const Role = require('./Role.js');
const fs = require('fs');

module.exports = class RoleManger extends EventEmitter {
	constructor(client, opts = { }) {
		if (!client) throw new SyntaxError('Invalid discord client!');
		if (!opts.storagePath && !opts.rolesData) throw new SyntaxError('Invalid storage!');
		if (!opts.localization) opts.localization =  'en'

		opts.localization = localization[opts.localization];

		if (!opts.localization) throw new SyntaxError('Invalid localization name!');

		super();

		this._roles = { };
		this._opts = opts;

		if (opts.storagePath) this._opts.saveData = true;

		this._config = opts.storagePath ? JSON.parse(fs.readFileSync(this._opts.storagePath)) : opts.rolesData;
		this.client = client;

		for (const [guildId, data] of Object.entries(this._config)) {
			for (const [roleId, values] of Object.entries(data)) {
				if (!this._roles[guildId]) this._roles[guildId] = { };

				this._roles[guildId][roleId] = new Role(roleId, values);
			}
		}
	}

	addRole(message) {
		return new Promise(async (resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildId = message.guild.id;
			let errorMessage = undefined;
	
			if (messageContent.length < 2) {
				errorMessage = await message.reply(this._opts.localization.argumentCountError);

				return reject(errorMessage);
			};
	
			const roleId = this._getRoleId(messageContent[0]);

			if (!this._config[guildId]) this._config[guildId] = { };
			if (!roleId || !guildRoles.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.invalidRoleId);

				return reject(errorMessage);
			} else if (this._config[guildId][roleId]) {
				errorMessage = await message.reply(this._opts.localization.roleAlreadyExist);

				return reject(errorMessage);
			};
	
			messageContent = messageContent.slice(1);
			const usersList = [];
	
			for (const currentUserId of messageContent) {
				const fixedId = this._getUserId(currentUserId);
	
				if (!fixedId) continue;
	
				usersList.push(fixedId); 
			}
	
			if (!this._roles[guildId]) this._roles[guildId] = { };

			this._config[guildId][roleId] = { admitUsers: usersList };
			this._roles[guildId][roleId] = new Role(roleId, { admitUsers: usersList });
	
			this._saveData();
			resolve({ roleId: roleId, admitUsers: usersList });
		});
	}

	removeRole(message) {
		return new Promise(async (resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildId = message.guild.id;
			let errorMessage = undefined;

			if (messageContent.length < 1) {
				errorMessage = await message.reply(this._opts.localization.argumentCountError);

				return reject(errorMessage);
			}
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.invalidRoleId);

				return reject(errorMessage);
			} else if (!this._config[guildId]) {
				errorMessage = await message.reply(this._opts.localization.guildDontHaveRoles);

				return reject(errorMessage);
			} else if (!this._config[guildId][roleId]) {
				errorMessage = await message.reply(this._opts.localization.roleDoesntExist);

				return reject(errorMessage)
			}
	
			delete this._config[guildId][roleId];
			delete this._roles[guildId][roleId];
	
			this._saveData();
			resolve(roleId);
		});
	}

	changeRoleAdmitUsers(message) {
		return new Promise(async (resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildId = message.guild.id;
			let errorMessage = undefined;

			if (messageContent.length < 2) {
				errorMessage = await message.reply(this._opts.localization.argumentCountError);

				return reject(errorMessage);
			}
			
			const roleId = this._getRoleId(messageContent[0]);
			messageContent = messageContent.slice(1);

			if (!roleId || !guildRoles.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.invalidRoleId);

				return reject(errorMessage);
			} else if (!this._config[guildId]) {
				errorMessage = await message.reply(this._opts.localization.guildDontHaveRoles);

				return reject(errorMessage);
			} else if (!this._config[guildId][roleId]) {
				errorMessage = await message.reply(this._opts.localization.roleDoesntExist);

				return reject(errorMessage)
			}
	
			const usersList = [];
	
			for (const currentUserId of messageContent) {
				const fixedId = this._getUserId(currentUserId);
	
				if (!fixedId) continue;
	
				usersList.push(fixedId); 
			}

			this._config[guildId][roleId].admitUsers = usersList;
			this._roles[guildId][roleId].changeRole('_admitUsers', usersList);
	
			this._saveData();
			resolve({ roleId: roleId, admitUsers: usersList });
		});
	}

	removeRoleFromUser(message) {
		return new Promise(async (resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildMembers = message.guild.members;
			const guildId = message.guild.id;
			let errorMessage = undefined;

			if (messageContent.length < 2) {
				errorMessage = await message.reply(this._opts.localization.argumentCountError);

				return reject(errorMessage);
			}
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.invalidRoleId);

				return reject(errorMessage);
			} else if (!this._roles[guildId][roleId]) {
				errorMessage = await message.reply(this._opts.localization.roleDoesntExist);

				return reject(errorMessage);
			} else if (!this._roles[guildId][roleId].checkUser(message.author.id)) {
				errorMessage = await message.reply(this._opts.localization.userDoesntHavePermission);

				return reject(errorMessage);
			}

			messageContent = messageContent.slice(1);
			const userId = this._getUserId(messageContent[0]);

			if (!userId) {
				errorMessage = await message.reply(this._opts.localization.invalidUserId);

				return reject(errorMessage);
			}

			const member = await guildMembers.fetch(userId);
			const role = guildRoles.get(roleId);

			if (!member) {
				errorMessage = await message.reply(this._opts.localization.invalidUserId);

				return reject(errorMessage);
			} else if (!member.roles.cache.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.userDoesntHaveRole);

				return reject(errorMessage);
			}

			member.roles.remove(role);
			this.emit('removedRoleFromUser', message.member, member, role);
			resolve('all done');
		});
	}

	giveRoleToUser(message) {
		return new Promise(async (resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildMembers = message.guild.members;
			const guildId = message.guild.id;
			let errorMessage = undefined;

			if (messageContent.length < 2) {
				errorMessage = await message.reply(this._opts.localization.argumentCountError);

				return reject(errorMessage);
			}
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.invalidRoleId);

				return reject(errorMessage);
			} else if (!this._roles[guildId][roleId]) {
				errorMessage = await message.reply(this._opts.localization.roleDoesntExist);

				return reject(errorMessage);
			} else if (!this._roles[guildId][roleId].checkUser(message.author.id)) {
				errorMessage = await message.reply(this._opts.localization.userDoesntHavePermission);

				return reject(errorMessage);
			}

			messageContent = messageContent.slice(1);
			const userId = this._getUserId(messageContent[0]);

			if (!userId) {
				errorMessage = await message.reply(this._opts.localization.invalidUserId);

				return reject(errorMessage);
			}

			const member = await guildMembers.fetch(userId);
			const role = guildRoles.get(roleId);

			if (!member) {
				errorMessage = await message.reply(this._opts.localization.invalidUserId);

				return reject(errorMessage);
			} else if (member.roles.cache.has(roleId)) {
				errorMessage = await message.reply(this._opts.localization.userAlreadyHaveRole);

				return reject(errorMessage);
			}

			member.roles.add(role);
			this.emit('addedRoleToUser', message.member, member, role);
			resolve('all done');
		});
	}

	_getRoleId(id) {
		return (!(id && (id.startsWith('<') && id.endsWith('>')))) ? undefined : (id.search('&') != -1) ? id.slice(3, -1) : id.slice(2, -1);
	}

	_getUserId(id) {
		return (!(id && (id.startsWith('<') && id.endsWith('>')))) ? undefined : (id.search('!') != -1) ? id.slice(3, -1) : id.slice(2, -1);
	}

	_saveData() {
		if (this._opts.saveData) fs.writeFileSync(this._opts.storagePath, JSON.stringify(this._config, null, 4));
	}
}