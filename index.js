class Command {
    /**
     * command name, required
     */
    name;
    
    /**
     * function that will be executed when the command is used
    */
    onExecute;
    
    constructor (name, onExecute) {
        this.name = name;
        this.onExecute = onExecute;
    }

    toString () {
        return name;
    }
}

const Discord = require('discord.js');

const {token, prefix} = require('../test-bot-config.json');

const client = new Discord.Client();

// commands or something

client.commands = new Discord.Collection();

client.commands.set('test', new Command('test', function(msg, args) {
    msg.channel.send(`${msg.author} ${args}`);
}));

client.commands.set('say', new Command('say', function(msg, args) {
    
    if (!args)
        throw "ree"
    
    const txt = args.join(" ");

    if (!txt)
        throw "***no***"
    
    msg.channel.send(txt);
    msg.delete();
}));




client.once('ready', () => {
    console.log('alive lol');
})

client.on('message', msg => {
    if (msg.author.bot)
        return;
    if (!msg.content.startsWith(prefix))
        return;

    const commandName = msg.content.slice(prefix.length).split(" ")[0];
    const args = msg.content.slice(prefix.length).split(" ").slice(1);
    const command = client.commands.get(commandName);
    
    try {
        if (command) {
            command.onExecute(msg, args)
        }
    } catch (err) {
        error(err, msg.channel);
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
