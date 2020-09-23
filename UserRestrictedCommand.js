const Command = require("./Command");

module.exports = class UserRestrictedCommand extends Command {
    users = [];

    constructor(name, onExecute, users, description) {
        super(name, onExecute, description);
        this.users = users;
    }

    execute(msg, args) {
        if (this.users.includes(msg.author.id)) {
            Command.prototype.execute.call(this, msg, args);
        } else {
            throw "you can't execute this command";
        }
    }
}