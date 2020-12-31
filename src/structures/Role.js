module.exports = class Role {
	constructor(roleId, values) {
		this.roleId = roleId;
		this._admitUsers = values.admitUsers;
	}

	checkUser(userId) {
		return this._admitUsers.indexOf(userId) !== -1;
	}

	changeRole(point, arg) {
		if (this[point]) this[point] = arg;
	}
}