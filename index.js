const Command = require('./Command');
const { parse } = require('querystring')
const api = require('@sebo2205/gd-browser-api-module');

const RestrictedCommand = require('./RestrictedCommand');

const Discord = require('discord.js');
const fs = require('fs');

const {token, prefix} = require('../test-bot-config.json');
const SubcommandCommand = require('./SubcommandCommand');
const UserRestrictedCommand = require('./UserRestrictedCommand');
const readline = require('readline');

const client = new Discord.Client();

// commands or something

client.commands = new Discord.Collection();

const http = require('http');
const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 4269 });
 
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
 
  ws.send('eggs');
});



commands = {
    test: new Command('test', function(msg, args) {
        msg.channel.send(`${msg.author} ${args}`);
    }, "yes"),

    say: new UserRestrictedCommand('say', function(msg, args) {
    
        if (!args)
            throw "ree"
        
        const txt = args.join(" ");
    
        if (!txt)
            throw "***no***"
        
        msg.channel.send(txt);
        msg.delete();
    }, ["602651056320675840"], "totally not a clone of <@622122161523523624>'s say command"),

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
                const subCommand = _cmd.toSubcommandCommand();

                if (restricted) {
                    embed.fields.push({
                        name: "requires permissions",
                        value: restricted.requiredPermissions.join("\n")
                    });
                }

                if (subCommand) {
                    var subCmdNames = [];

                    subCommand.subcommands.forEach(s => {
                        subCmdNames.push(`**\`${s.name}\`**: ${s.description || "*nothing*"}`)
                    });

                    embed.fields.push({
                        name: "has subcommands",
                        value: `${subCmdNames.join("\n")}`
                    })
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

    gd: new SubcommandCommand('gd', [
        new Command('search', function(msg, args, page) {
            var pageNumber = parseInt(page);
            var query = args.slice(1).join(" ");

            if (isNaN(pageNumber)) {
                pageNumber = 1;
                query = args.join(" ");
            }
            
            api.search(query, {page: pageNumber}).then(results => {
                var levelNames = [];
                
                results.data.forEach(level => {
                    levelNames.push(`${level.name} (${level.id}) by ${level.author} (${level.authorID})`)
                })

                const embed = {
                    title : "search results",

                    description: levelNames.join("\n"),

                    footer: {
                        text: `${Math.abs(results.ping)}ms, page ${pageNumber}`
                    }
    
                }
                msg.channel.send({embed: embed}).catch(err => {error(err)});
            }).catch(err => {
                error(err, msg.channel)
            })
        }, "searches a level"),

        new Command('level', function(msg, _args, id) {
            api.level(id).then(level => {
                const embed = new Discord.MessageEmbed()
                .setTitle(level.data.name)
                .addFields([
                    {name: "author", value: `**${level.data.author}** (${level.data.authorID})`},
                    {name: "likes", value: level.data.likes + "", inline: true},
                    {name: "downloads", value: level.data.downloads + "", inline: true}
                ])
                .setFooter(level.ping + "ms")
                msg.channel.send(embed);
            })
        }, "shows info about a level"),

        new Command('user', async function(msg, _args, id) {
            api.profile(id).then(user => {
                const embed = new Discord.MessageEmbed()
                .setTitle(user.data.username)
                .addField("player id", user.data.playerID)
                .addField("account id", user.data.accountID)
                .addField("coins", user.data.coins)
                .addField("user coins", user.data.userCoins)
                .addField("stars", user.data.stars)
                .addField("demons", user.data.demons)
                .addField("diamonds", user.data.diamonds)
                .setFooter(user.ping + "ms")

                msg.channel.send(embed);
            })
        }, "shows info about a user's profile")
    ], "base command for gd browser api stuff"),

    test2: new SubcommandCommand("test2", [
        new Command("eggs", function(msg) {msg.channel.send("eggs")}, "eggs are gud"),
        new Command("egg", function(msg) {msg.channel.send("egg")}, "eggo veggy"),
        new Command("e", function(msg) {msg.channel.send("eeeeee")}, "e"),
        new Command("h", function(msg) {msg.channel.send("h")}, "hhhhh"),
    ]),


    


}

var cmds = Object.entries(commands);

cmds.forEach(cmd => {
    client.commands.set(cmd[0], cmd[1]);
})

const server = http.createServer(function(req, res) {
    
    if (req.method == "POST") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = parse(body);
            
            try {
                const channel = client.channels.cache.get(data.channel);
                channel.send(data.content)
            } catch(err) {
                res.writeHead(400);
                res.end(err.toString());
            }

            console.log(data);
            res.end();
        });
        
    } else {

        var path = req.url;
        console.log(`request: ${path}`);
        
        
        var commandNames = []
    
        client.commands.forEach(cmd => {
            commandNames.push(`<a href="/command/${cmd.name}" class="commandLink">${cmd.name}</a>`)
        })
        
        
        if (path == "/") {
            res.writeHead(200);
            
            fs.readFile("commands.html", function(err, data) {
                if (err) {
                    console.log(err);
                    res.writeHead(400)
                    res.end(err);
                    return;
                }
    
                res.end(data.toString().replace("{commands}", commandNames.join("<br>")));
            })
            
            
        } else {
            
            try {
                
                var idk = path.slice("/command/".length).toLowerCase().split("/");
                
                if (idk.length > 2) {
                    idk.shift();
                }
                
                var cmd = client.commands.get(idk[0]);
                console.log(idk);
                if (!cmd) {
                    
                    res.writeHead(400);
                    res.end('eggs');
                    return;
                }
                
                var subcmd = undefined;
                
                if (cmd.toSubcommandCommand()) {
                    subcmd = cmd.toSubcommandCommand().subcommands.get(idk[1]);
                } 

                

                if (subcmd) {
                    cmd = subcmd;
                }

                console.log(idk.length)

                


               
        

                
                if (cmd) {
        
                    
                    
                    fs.readFile("command.html", function(err, data) {
                        if (err) {
                            console.log(err);
                            res.writeHead(400)
                            res.end(err);
                            return;
                        }
                        res.writeHead(200);
                        
                        var d = data.toString().replace("{commandname}", cmd.name).replace("{commanddesc}", cmd.description).replace("{commandname}", cmd.name);
                        var scmd = cmd.toSubcommandCommand();
                        
                        if (cmd.toRestrictedCommand()) {
                            d = d.replace("{commandperms}", `        <div class="prop">
                            <h4 class="text propname">required permissions</h4>
                                <p class="commanddesc commandprop">${cmd.toRestrictedCommand().requiredPermissions.join(", ")}</p>
                            </div>`);
                        } else {
                            d = d.replace("{commandperms}", "");
                        }
    
                        
                        

                        if (scmd != undefined) {
                            
                            var scmdNames = [];
    
                            
                            scmd.subcommands.forEach(s => {
                                scmdNames.push(`<a href="/commands/${cmd.name}/${s.name}" class="cmdlink"></strong>${s.name}</strong></a>: ${s.description || "nothing"}`);
                            })
                            
                            d = d.replace("{subcmds}", `        <div class="prop">
                            <h4 class="text propname">subcommands</h4>
                                <p class="commanddesc commandprop">${scmdNames.join("<br>")}</p>
                            </div>`);
                        } else {
                            d = d.replace("{subcmds}", "")
                        }
    
                        res.end(d);
                    }) 
                    
        
        
                } else {
                    res.writeHead(404)
                    res.end("that command doesn't exist");
                }

            } catch (err) {
                res.writeHead(400);
                res.end(err.toString());
            }
            
    
        }
    }
        
    
});




server.listen(6969)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


client.once('ready', () => {
    console.log('alive lol');
})

client.on('message', msg => {

    console.log(`${msg.author.tag}: ${msg.content}`);
    
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







