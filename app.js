const bot_server = require('./bot_server');

function hello(bot, message) {
    const content = 'hello ' + message.sender_full_name;

    const response = {
        content: content,
    };

    bot.reply(message, response);
}

function echo(bot, message) {
    const content = 'ECHO: ' + message.text.substring(5);

    const response = {
        content: content,
    };

    bot.reply(message, response);
}

function fallthru(bot, message) {
    const content = 'I do not recognize this command!';

    const response = {
        content: content,
    };

    bot.reply(message, response);
}

const controller = bot_server.make_controller();

controller.hears('hello', 'direct_mention', hello);
controller.hears('echo', '', echo);
controller.hears('', 'direct_message', fallthru);

controller.run();

