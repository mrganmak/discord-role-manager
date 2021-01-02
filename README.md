# discord-role-manager
A simple discrod role manager, which will allow verified users to assign certain roles to other users.
This script will help you to manage role in text role play discrod server or other servers, who need to have a role leader.

## Installation 
```
  npm i discord-role-manager --save
```

## Usage
**standard usage**
```js
const Discord = require('discord.js');
const client = new Discord.Client();
const { RoleManger } = require('discord-role-manager') // get npm;

const roleManger = new RoleManger(client, {
  storagePath: './roleStorage.json',
  localization: 'en' //Available localization is: ru; en. If you want to change localization or add your own language, go to the package dir and change localization.json
});
client.roleManger = roleManger;

client.on('message', message => {
  if (message.content.startsWith('!addRole')) client.roleManger.addRole(message).catch(errorMessage => {
	errorMessage.delete({ timeout: 1000 });
  }); //Add new role to ./roleStorage.json and catch error message
  else if (message.content.startsWith('!giveRoleToUser')) client.roleManger.giveRoleToUser(message).catch(errorMessage => {
	errorMessage.delete({ timeout: 1000 });
  }); //Give role to user and catch error message
  else if (message.content.startsWith('!removeRoleFromUser')) client.roleManger.removeRoleFromUser(message).catch(errorMessage => {
	errorMessage.delete({ timeout: 1000 });
  }); //remove role from user and catch error message
  else if (message.content.startsWith('!removeRole')) client.roleManger.removeRole(message).catch(errorMessage => {
	errorMessage.delete({ timeout: 1000 });
  }); //Remove role from ./roleStorage.json and catch error message
  else if (message.content.startsWith('!changeRoleAdmitUsers')) client.roleManger.changeRoleAdmitUsers(message).catch(errorMessage => {
	errorMessage.delete({ timeout: 1000 });
  }); //Chnage same role admit users.
});

client.login('YOT_BOT_TOKEN_HERE');
```
**if you want to use third-party databases**
```js
const Discord = require('discord.js');
const client = new Discord.Client();
const { RoleManger } = require('discord-role-manager') // get npm;
const rolesData = {
	"598155112153743418": {
		"630725911930732546": {
			"admitUsers": [ "150656108455788544" ]
		}
	}
} //Here you need to get data from the database, this obj just example

const roleManger = new RoleManger(client, {
	rolesData: rolesData,
	localization: 'en' //Available localization is: ru; en. If you want to change localization or add your own language, go to the package dir and change localization.json
});
client.roleManger = roleManger;

client.on('message', message => {
	if (message.content.startsWith('!addRole')) client.roleManger.addRole(message)
		.then(data => {
			if (!rolesData[message.guild.id]) rolesData[message.guild.id] = { };

			rolesData[message.guild.id][data.roleId] = { admitUsers: data.admitUsers };
			//Here you need to save data to the database, this obj just example
		})
		.catch(errorMessage => {
			errorMessage.delete({ timeout: 1000 });
		});
});

client.login('YOT_BOT_TOKEN_HERE');
```

## Discord usage
```
Creat new role, and set admit user.
```
![](images/usage(2).png "Creat new role, and set admit user.")
```
Now this user can get this role to other users.
```
![](images/usage.png "Now this user can get this rol to other users.")
## All Classes
  **index**
  - RoleManger - RoleManger class
  
 ## All functions
  **RoleManger**
  - addRole(message) - Add new role to ./roleConfig.json. return new Promise(resolve(Object), reject(errorMessage))
  ```
	Discord message example:
	!addRole @role @user1 @user2 @user3....
	
	@user1 and others it's admit users (users, who can use removeRoleFromUser and giveRoleToUser for this current role)
  ```
  - removeRole(message) - Remove role from ./roleConfig.json. return new Promise(resolve(Object), reject(errorMessage))
  ```
	Discord message example:
	!removeRole @role
  ```
  - changeRoleAdmitUsers(message) - Change existing role admit users. return new Promise(resolve(Object), reject(errorMessage))
  ```
	Discord message example:
	!changeRoleAdmitUsers @role @user1 @user2 @user3....
	
	@user1 and others it's admit users (users, who can use removeRoleFromUser and giveRoleToUser for this current role)
  ```
  - giveRoleToUser - Give role to the user. return new Promise(resolve(string), reject(errorMessage))
  ```
	Discord message example:
	!giveRoleToUser @role @user
	
	available only for this role admit user
  ```
  - removeRoleFromUser - Remove role from user. return new Promise(resolve(string), reject(errorMessage))
  ```
	Discord message example:
	!removeRoleFromUser @role @user
	
	available only for this role admit user
  ```
  
## RoleManger opts
  - storagePath = string - path to your storage.json file.
  - rolesData = Object - this opts need you, if you use third-party databases. Warning storagePath replaces this parameter.
  - localization = string - localization language (en by default). Available localization is: ru; en. If you want to change localization or add your own language, go to the package dir and change localization.json
 
## Events
  - addedRoleToUser -  Emitted whenever user give role to other user return(userWhoRemoveRole, userWhoLooseRole, role)
  - removedRoleFromUser - Emitted whenever user remove role from other user return(userWhoRemoveRole, userWhoLooseRole, role)

## Recommendation
  - Make the verify to the addRole removeRole changeRoleAdmitUsers commands so that only administrators can use these commands