const Command = require('./Command');

const api = require('@sebo2205/gd-browser-api-module');

const RestrictedCommand = require('./RestrictedCommand');

const Discord = require('discord.js');

const {token, prefix} = require('../test-bot-config.json');
const SubcommandCommand = require('./SubcommandCommand');

const client = new Discord.Client();

// commands or something

client.commands = new Discord.Collection();

commands = {
    test: new Command('test', function(msg, args) {
        msg.channel.send(`${msg.author} ${args}`);
    }, "yes"),

    say: new Command('say', function(msg, args) {
    
        if (!args)
            throw "ree"
        
        const txt = args.join(" ");
    
        if (!txt)
            throw "***no***"
        
        msg.channel.send(txt);
        msg.delete();
    }, "totally not a clone of <@622122161523523624>'s say command"),

    help: new Command('help', function(msg, _args, cmd) {
        if (!cmd) {
            var cmdNames = [];
            client.commands.forEach(element => {
                cmdNames.push(`\`${element.name}\``);
            })
    
            const embed = {
                title: "list of commands",
                description: cmdNames.join(", "),
                footer: {
                    text: `use ${prefix}help <command name> for info about a specific command`
                }
            }
    
            msg.channel.send({embed: embed});
        } else {
            if (client.commands.has(cmd.toLowerCase())) {
    
                var _cmd = client.commands.get(cmd.toLowerCase());
                var embed = {
                    title: "command info",
                    fields: [
                        {
                            name: "name",
                            value: _cmd.name
                        },
                        {
                            name: "description",
                            value: _cmd.description || "NA"
                        }
                    ]
                }
                const restricted = _cmd.toRestrictedCommand();

                if (restricted) {
                    embed.fields.push({
                        name: "requires permissions",
                        value: restricted.requiredPermissions.join("\n")
                    });
                }
                msg.channel.send({embed: embed});
            } else {
                throw `the command \`${cmd}\` doesn't exist`;
            }
        }
    }, "shows a list of commands or info about a command"),

    "top-secret-command": new RestrictedCommand("top-secret-command", function(msg) {
        msg.channel.send("eggs");
    }, ["ADMINISTRATOR"], "lol"),

    permissions: new Command("permissions", function(msg) {
        
        msg.guild.members.fetch(msg.author.id).then(member => {
            const perms = member.permissions;
            msg.channel.send({
                embed: {
                    title: "permissions",
                    description: `${perms.toArray().join("\n")}`
                }
            })
            //console.log(perms.toArray());
        })


        

        //Discord.Permissions
        //Discord.GuildMember
        //Discord.Guild
    }, "shows all the permissions you have"),

    gd: new Command('gd', async function(msg, args) {
        var subCmd = args[0];

        if (subCmd == "search") {
            

            api.search(encodeURIComponent(args.slice(2).join(" ")), {page: args[1]}).then(results => {
                var levelNames = [];
                
                results.data.forEach(level => {
                    levelNames.push(`${level.name} (${level.id}) by ${level.author} (${level.authorID})`)
                })

                const embed = {
                    title : "search results",

                    description: levelNames.join("\n"),

                    footer: {
                        text: results.ping + "ms"
                    }
    
                }
                msg.channel.send({embed: embed}).catch(err => {error(err)});
            })


        } 
    }),

    test2: new SubcommandCommand("test2", [
        new Command("eggs", function(msg) {msg.channel.send("eggs")}),
        new Command("egg", function(msg) {msg.channel.send("egg")}),
        new Command("e", function(msg) {msg.channel.send("eeeeee")}),
        new Command("h", function(msg) {msg.channel.send("h")}),
    ])

    


}

var cmds = Object.entries(commands);

cmds.forEach(cmd => {
    client.commands.set(cmd[0], cmd[1]);
})

client.once('ready', () => {
    console.log('alive lol');
})

client.on('message', msg => {
    if (msg.author.bot)
        return;
    
    var user = msg.mentions.users.first();

    if (user) {
        if (user.id == client.user.id) {
            msg.channel.send(`${msg.author}, my prefix is \`${prefix}\` lol`);
        }

    }
    
    
    if (!msg.content.startsWith(prefix))
        return;

    const commandName = msg.content.slice(prefix.length).split(" ")[0];
    const args = msg.content.slice(prefix.length).split(" ").slice(1);
    const command = client.commands.get(commandName);
    
    try {
        if (command) {
            command.execute(msg, args)
        }
    } catch (err) {
        error(err, msg.channel);
        console.log(err);
    }
})



client.login(token);


function error (err, channel) {
    channel.send ({
        embed: {
            color: 0xff0000,
            title: "error",
            description: err.toString()
        }
    })
}
