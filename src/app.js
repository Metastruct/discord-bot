var eris = require("eris");
var config = require("../config.js");
// const util = require("util"); // used for util.inspect in print calls

var metaBot = new eris.CommandClient(config.botToken, {}, {
	defaultCommandOptions: {
		deleteCommand: true,
		guildOnly: true,
		permissionMessage: ":rotating_light: You are not allowed to use this command!",
		requirements: {
			roleIDs: [ config.developerRole ]
		}
	},
	defaultHelpCommand: false,
	ignoreBots: true,
	ignoreSelf: true,
	prefix: "@mention "
});

metaBot.activityLog = function(emote, title, logData) {
	var activityMessage = `:${emote}: **${title}**\n\`\`\`xl`;

	for (var key in logData) {
		activityMessage += `\n${key}: ${logData[key]}`;
	}

	activityMessage += `\n\`\`\``;
	metaBot.createMessage(config.activityChannel, activityMessage);
};

metaBot.isDeveloper = function(guildMember) { // was for temp fix, keeping around 'cause why not
	if (guildMember.roles.indexOf(config.developerRole) !== -1) { return true; }
	return false;
};

metaBot.isBanned = function(guild, userID) {
	var isBanned = false;
	return guild.getBans().then((userArray) => {
		userArray.forEach((user) => { if (user.id === userID) { isBanned = true; } });
		return isBanned;
	}).catch(() => false);
};

metaBot.on("ready", () => {
	// print debug stuff..?
});

// commands

metaBot.registerCommand("kick", (msg, args) => {
	// if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this was just temp fix because eris had a small bug

	if (args.length === 0) { return; }

	var targetUserID    = args[0].replace(/<@!?|>/g, "");
	var targetUser      = msg.channel.guild.members.find((user) => user.id === targetUserID);
	var reason          = args.slice(1).join(" ").trim();
		reason          = reason < 2 ? "No reason given." : reason;

	if (targetUser) {
		targetUser.getDMChannel().then((channel) => {
			channel.createMessage(":boot: You have been kicked from " + msg.channel.guild.name + " by " + msg.member.username + " for the following reason:\n\n`" + reason + "`");
		}).catch(() => {
			console.log("User " + targetUser.username + "(" + targetUserID + ") could not be messaged. (Blocked the bot or allows DMs for friends only)");
		});

		msg.channel.guild.kickMember(targetUserID, 0).then(() => {
			metaBot.activityLog("mans_shoe", "User – Kick", {
				"User": `${targetUser ? targetUser.username : "Unknown User" } <${targetUserID}>`,
				"Developer": `${msg.author.username} <${msg.author.id}>`,
				"Reason": `${reason}`
			});

			msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> has been kicked. (Reason: ${reason})`);
		}).catch(() => {
			msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> could not be kicked.`);
		});
	} else {
		msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> could not be found on this server.`);
	}
});

metaBot.registerCommand("ban", (msg, args) => {
	// if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this was just temp fix because eris had a small bug

	if (args.length === 0) { return; }

	var targetUserID    = args[0].replace(/<@!?|>/g, "");
	var targetUser      = metaBot.users.find((user) => user.id === targetUserID);
	var reason          = args.slice(1).join(" ").trim();
		reason          = reason < 2 ? "No reason given." : reason;

	metaBot.isBanned(msg.channel.guild, targetUserID).then((isBanned) => {
		if (isBanned === true) { msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> is already banned.`); return; }

		targetUser.getDMChannel().then((channel) => {
			channel.createMessage(":hammer: You have been banned from " + msg.channel.guild.name + " by " + msg.member.username + " for the following reason:\n\n`" + reason + "`");
		}).catch(() => {
			console.log("User " + targetUser.username + "(" + targetUserID + ") could not be messaged. (Blocked the bot or allows DMs for friends only)");
		});

		msg.channel.guild.banMember(targetUserID, 0).then(() => {
			metaBot.activityLog("lock", "User – Ban", {
				"User": `${targetUser ? targetUser.username : "Unknown User" } <${targetUserID}>`,
				"Developer": `${msg.author.username} <${msg.author.id}>`,
				"Reason": `${reason}`
			});

			msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> has been banned. (Reason: ${reason})`);
		}).catch(() => {
			msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> could not be banned.`);
		});
	});
});

metaBot.registerCommand("unban", (msg, args) => {
	// if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this was just temp fix because eris had a small bug

	if (args.length === 0) { return; }

	var targetUserID    = args[0].replace(/<@!?|>/g, "");
	var targetUser      = metaBot.users.find((user) => user.id === targetUserID);
	var reason          = args.slice(1).join(" ").trim();
		reason          = reason < 2 ? "No reason given." : reason;

	metaBot.isBanned(msg.channel.guild, targetUserID).then((isBanned) => {
		if (isBanned !== true) { msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> is not banned.`); return; }

		msg.channel.guild.unbanMember(targetUserID).then(() => {
			metaBot.activityLog("unlock", "User – Unban", {
				"User": `${targetUser ? targetUser.username : "Unknown User" } <${targetUserID}>`,
				"Developer": `${msg.author.username} <${msg.author.id}>`,
				"Reason": `${reason}`
			});

			msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> has been unbanned. (Reason: ${reason})`);
		}).catch(() => {
			msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> could not be unbanned.`);
		});
	});
});

metaBot.registerCommand("banlist", (msg, args) => {
	// if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this was just temp fix because eris had a small bug

	msg.channel.guild.getBans().then((userArray) => {
		var listMessage = `:notepad_spiral:  **Bans (${userArray.length})**\n\`\`\`xl`;

		var longestName = 0;
		userArray.forEach((user) => {
			var nameLength = user.username.length;
			if (nameLength > longestName) { longestName = nameLength; }
		});

		longestName += 2;
		userArray.forEach((user) => {
			var fillSpaces = longestName - user.username.length;
			listMessage += `\n${user.username}${" ".repeat(fillSpaces)}<${user.id}>`;
		});

		listMessage += `\n\`\`\``;
		msg.channel.createMessage(listMessage);
	}).catch(() => {
		msg.channel.createMessage(`:rotating_light:  Error retrieving banlist.`);
	});
}, { aliases: [ "bans" ] });

metaBot.connect();