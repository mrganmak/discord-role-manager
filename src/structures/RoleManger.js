const { EventEmitter } = require('events');
const Role = require('./Role.js');
const fs = require('fs');

module.exports = class RoleManger extends EventEmitter {
	constructor(client, opts = { }) {
		if (!client) throw new SyntaxError('Invalid discord client!');
		if (!opts.configPath) throw new SyntaxError('Invalid config path!');

		super();

		this._roles = { };
		this.opts = opts;
		this.client = client;
		this._config = JSON.parse(fs.readFileSync(this.opts.configPath));

		for (const [guildId, data] of Object.entries(this._config)) {
			for (const [roleId, values] of Object.entries(data)) {
				if (!this._roles[guildId]) this._roles[guildId] = { };

				this._roles[guildId][roleId] = new Role(roleId, values);
			}
		}
	}

	addRole(message) {
		return new Promise((resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildId = message.guild.id;
	
			if (messageContent.length < 2) reject(new Error('Invalid argument count!'));
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) reject(new Error('Invalid role id!'));
			if (this._config[roleId]) reject(new Error('This role has already exist!'));
	
			messageContent = messageContent.slice(1);
			const usersList = [];
	
			for (const currentUserId of messageContent) {
				const fixedId = this._getUserId(currentUserId);
	
				if (!fixedId) continue;
	
				usersList.push(fixedId); 
			}
	
			if (!this._config[guildId]) this._config[guildId] = { };
			if (!this._roles[guildId]) this._roles[guildId] = { };

			this._config[guildId][roleId] = { admitUsers: usersList };
			this._roles[guildId][roleId] = new Role(roleId, { admitUsers: usersList });
	
			this._saveData();
			resolve('all done');
		});
	}

	removeRole(message) {
		return new Promise((resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildId = message.guild.id;

			if (messageContent.length < 1) reject(new Error('Invalid argument count!'));
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) reject(new Error('Invalid role id!'));
			if (!this._config[guildId]) reject(new Error('There are no roles in this guild!'));
			if (!this._config[guildId][roleId]) reject(new Error('This role doesn\'t exist yet!'));
	
			delete this._config[guildId][roleId];
			delete this._roles[guildId][roleId];
	
			this._saveData();
			resolve('all done');
		});
	}

	changeRoleAdmitUsers(message) {
		return new Promise((resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildId = message.guild.id;

			if (messageContent.length < 2) reject(new Error('Invalid argument count!'));
			
			const roleId = this._getRoleId(messageContent[0]);
			messageContent = messageContent.slice(1);

			if (!roleId || !guildRoles.has(roleId)) reject(new Error('Invalid role id!'));
			if (!this._config[guildId]) reject(new Error('There are no roles in this guild!'));
			if (!this._config[guildId][roleId]) reject(new Error('This role doesn\'t exist yet!'));
	
			const usersList = [];
	
			for (const currentUserId of messageContent) {
				const fixedId = this._getUserId(currentUserId);
	
				if (!fixedId) continue;
	
				usersList.push(fixedId); 
			}

			this._config[guildId][roleId].admitUsers = usersList;
			this._roles[guildId][roleId].changeRole('_admitUsers', usersList);
	
			this._saveData();
			resolve('all done');
		});
	}

	removeRoleFromUser(message) {
		return new Promise((resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildMembers = message.guild.members.cache;
			const guildId = message.guild.id;

			if (messageContent.length < 2) reject(new Error('Invalid argument count!'));
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) reject(new Error('Invalid role id!'));
			if (!this._roles[guildId][roleId]) reject(new Error('This role doesn\'t exist yet!'));
			if (!this._roles[guildId][roleId].checkUser(message.author.id)) reject(new Error('This user doesn\'t have permissions'));

			messageContent = messageContent.slice(1);
			const userId = this._getUserId(messageContent[0]);
			const member = guildMembers.get(userId);
			const role = guildRoles.get(roleId);

			if (!member) reject(new Error('Invalid user id!'));
			if (!member.roles.cache.has(roleId)) reject(new Error('This user doesn\'t have this role'));

			member.roles.remove(role);
			this.emit('removedRoleFromUser', message.member, member, role);
			resolve('all done');
		});
	}

	giveRoleToUser(message) {
		return new Promise((resolve, reject) => {
			let messageContent = message.content.split(' ').slice(1);
			const guildRoles = message.guild.roles.cache;
			const guildMembers = message.guild.members.cache;
			const guildId = message.guild.id;

			if (messageContent.length < 2) reject(new Error('Invalid argument count!'));
	
			const roleId = this._getRoleId(messageContent[0]);
	
			if (!roleId || !guildRoles.has(roleId)) reject(new Error('Invalid role id!'));
			if (!this._roles[guildId][roleId]) reject(new Error('This role doesn\'t exist yet!'));
			if (!this._roles[guildId][roleId].checkUser(message.author.id)) reject(new Error('This user doesn\'t have permissions'));

			messageContent = messageContent.slice(1);
			const userId = this._getUserId(messageContent[0]);
			const member = guildMembers.get(userId);
			const role = guildRoles.get(roleId);

			if (!member) reject(new Error('Invalid user id!'));
			if (member.roles.cache.has(roleId)) reject(new Error('This user already have this role'));

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
		fs.writeFileSync(this.opts.configPath, JSON.stringify(this._config, null, 4));
	}
}