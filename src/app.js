var eris = require("eris");
var config = require("../config.js");

var metaBot = new eris.CommandClient(config.botToken, {}, {
    defaultCommandOptions: {
        deleteCommand: true,
        guildOnly: true,
        permissionMessage: ":rotating_light: You are not allowed to use this command!"
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

metaBot.isDeveloper = function(guildMember) {
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

metaBot.registerCommand("kick", (msg, args) => {
    if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this is just temp fix because eris has a small bug

    if (args.length === 0) { return; }

    var targetUserID    = args[0].replace(/<@!?|>/g, "");
    var targetUser      = msg.channel.guild.members.find((user) => user.id === targetUserID);
    var reason          = args.slice(1).join(" ").trim();
        reason          = reason < 2 ? "No reason given." : reason;

    if (targetUser) {
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
    if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this is just temp fix because eris has a small bug

    if (args.length === 0) { return; }

    var targetUserID    = args[0].replace(/<@!?|>/g, "");
    var targetUser      = metaBot.users.find((user) => user.id === targetUserID);
    var reason          = args.slice(1).join(" ").trim();
        reason          = reason < 2 ? "No reason given." : reason;
    
    metaBot.isBanned(msg.channel.guild, targetUserID).then((isBanned) => {
        if (isBanned === true) { msg.channel.createMessage(`:rotating_light:  <@${targetUserID}> is already banned.`); return; }

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
    if (metaBot.isDeveloper(msg.member) === false) { return ":rotating_light: You are not allowed to use this command!"; } // this is just temp fix because eris has a small bug

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

metaBot.connect();