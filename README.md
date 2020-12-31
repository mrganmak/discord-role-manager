# discord-role-manager
A simple discrod role manager, which will allow verified users to assign certain roles to other users.
This script will help you to manage role in text role play discrod server or othe servers, who need to have a role leader.

# FiveM-API
## Installation 
```
  npm i fivem-api.js --save
```

## Usage
```js
const Discord = require('discord.js');
const client = new Discord.Client();
const { RoleManger } = require('discord-role-manager') // get npm;

const roleManger = new RoleManger(client, {
	configPath: './roleConfig.json',
	localization: 'en' //Available localization is: ru; en. If you want to change localization or add your own language, go to the package dir and change localization.json
});

client.on('message', message => {
	if (message.content.startsWith('!addRole')) roleManger.addRole(message).catch(errorMessage => {
		errorMessage.delete({ timeout: 1000 });
	}); //Add new role to ./roleConfig.json and catch eroor message
	else if (message.content.startsWith('!giveRoleToUser')) roleManger.giveRoleToUser(message).catch(errorMessage => {
		errorMessage.delete({ timeout: 1000 });
	}); //Give role to user and catch eroor message
	else if (message.content.startsWith('!removeRoleFromUser')) roleManger.removeRoleFromUser(message).catch(errorMessage => {
		errorMessage.delete({ timeout: 1000 });
	}); //remove role from user and catch eroor message
	else if (message.content.startsWith('!removeRole')) roleManger.removeRole(message).catch(errorMessage => {
		errorMessage.delete({ timeout: 1000 });
	}); //Remove role from ./roleConfig.json and catch eroor message
	else if (message.content.startsWith('!changeRoleAdmitUsers')) roleManger.changeRoleAdmitUsers(message).catch(errorMessage => {
		errorMessage.delete({ timeout: 1000 });
	}); //Chnage same role admit users.
});

client.login('YOT_BOT_TOKEN_HERE');
```

## All Classes
  **index**
  - RoleManger - RoleManger class
  
 ## All functions
  **RoleManger**
  - addRole(message) - Add new role to ./roleConfig.json. return new Promise(resolve(string), reject(errorMessage))
  ```
    Discord message example:
    !addRole @role @user1 @user2 @user3....
    
    @user1 and others it's admit users (users, who can use removeRoleFromUser and giveRoleToUser for this current role)
  ```
  - removeRole(message) - Remove role from ./roleConfig.json. return new Promise(resolve(string), reject(errorMessage))
  ```
    Discord message example:
    !removeRole @role
  ```
  - changeRoleAdmitUsers(message) - Change existing role admit users. return new Promise(resolve(string), reject(errorMessage))
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
  - localization = string - localization language (en by default). Available localization is: ru; en. If you want to change localization or add your own language, go to the package dir and change localization.json
 
## Events
  - addedRoleToUser -  Emitted whenever user give role to other user return(userWhoRemoveRole, userWhoLooseRole, role)
  - removedRoleFromUser - Emitted whenever user remove role from other user return(userWhoRemoveRole, userWhoLooseRole, role)

## Recommendation
  - Make the verify to the addRole removeRole changeRoleAdmitUsers commands so that only administrators can use these commands