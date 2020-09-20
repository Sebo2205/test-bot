const Command = require('./Command');
const Discord = require('discord.js');

/**
 * a special type of command, it may not be able to be executed directly, 
 * but it's subcommands can be executed at any time
 */

module.exports = class SubcommandCommand extends Command {
    subcommands = new Discord.Collection();
    canBeExecutedDirectly = false;


    constructor(name, subcommands, description, canBeExecutedDirectly = false, onExecute = function(){} ) {
        super(name, onExecute, description)
        subcommands.forEach(cmd => {
            this.subcommands.set(cmd.name, cmd)
        })
        this.canBeExecutedDirectly = canBeExecutedDirectly;
    }

    execute (msg, args) {
        var sub = args[0];
        
        if (!sub && this.canBeExecutedDirectly) {
            this.onExecute(msg, args, ...args)
            return;
        }
        
        args.shift();

        if (this.subcommands.has(sub.toLowerCase())) {
            this.subcommands.get(sub.toLowerCase()).onExecute(msg, args, ...args)
        } else {
            throw "unknown subcommand";
        }
    }
}