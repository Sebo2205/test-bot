const Command = require('./Command');
const Discord = require('discord.js');

/**
 * a special type of command, it may not be able to be executed directly, 
 * but it's subcommands can be executed at any time
 * 
 * commandception example:
 * ```js
 * new SubcommandCommand("example", [
 *      new SubcommandCommand("eggs", [
 *           new Command("yes", function(msg) {
 *                  msg.channel.send("yes");
 *              })
 *           new Command("no", function(msg) {
 *                  msg.channel.send("no");
 *              })
 *          ])
 *      new SubcommandCommand("h", [
 *           new Command("egg", function(msg) {
 *                  msg.channel.send("eggs");
 *              })
 *           new Command("e", function(msg) {
 *                  msg.channel.send("eeee");
 *              })
 *          ])
 * ])
 * ```
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
            Command.prototype.execute(msg, args);
            return;
        }
        
        

        if (this.subcommands.has(sub.toLowerCase())) {
            this.subcommands.get(sub.toLowerCase()).onExecute(msg, args.slice(1), ...args.slice(1))
        } else {
            throw "unknown subcommand";
        }
    }

    toSubcommandCommand() {
        return this;
    }
}