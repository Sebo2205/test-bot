const Discord = require('discord.js')

module.exports = class Command {
    /**
     * command name, required
     */
    name;
    
    /**
     * function defined on the command constructor that will be executed when someone uses the command
    */
    onExecute;

    /**
     * function that executes the `onExecute` function,
     * can be overrided to make it only execute the function if a condition is met
     * 
     * example:
     * 
     * ```js
     * execute (msg, args) {
     *     // 50% chance to execute the command   
     *     if (Math.random() < 0.5) 
     *          this.onExecute(msg, args, ...args)
     * }
     * ```
     * @param msg {Discord.Message} the message that triggered the command
     * @param args {String[]} the arguments passed to the command
     */
    
    execute (msg, args) {
        this.onExecute(msg, args, ...args)
    }

    description;
    
    constructor (name, onExecute, description) {
        this.name = name;
        this.onExecute = onExecute;
        this.description = description;
    }

    toString () {
        return name;
    }

    toRestrictedCommand() {
        return undefined;
    }

    toSubcommandCommand() {
        return undefined;
    }
}
