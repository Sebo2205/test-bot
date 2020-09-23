const Command = require('./Command');

module.exports = class RestrictedCommand extends Command {
    requiredPermissions;
    
    constructor (name, onExecute, requiredPermissions, description) {
        super(name, onExecute, description)
        this.requiredPermissions = requiredPermissions;
    }
    
    execute (msg, args) {
        const member = msg.guild.members.cache.get(msg.author.id);

        if (member.hasPermission(this.requiredPermissions)) {
            Command.prototype.execute.call(this, msg, args);
        } else {
            throw `missing permissions`;
        }
    }

    toRestrictedCommand() {
        return this;
        
    }
}