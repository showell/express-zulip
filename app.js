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

function buttons(bot, message) {
    // You can present a Zulip user with
    // a list of choices that get turned into
    // buttons.
    //
    // This requires you to have Zulip version
    // 1.9 or higher (or grab the latest master
    // if you're reading this before 1.9 was
    // released.)

    const widget_content = JSON.stringify({
        widget_type: 'zform',
        extra_data: {
            type: 'choices',
            heading: 'Pick a fruit:',
            choices: [
                {
                    type: 'multiple_choice',
                    short_name: 'A',
                    long_name: 'Apple',
                    reply: 'order apple',
                },
                {
                    type: 'multiple_choice',
                    short_name: 'B',
                    long_name: 'Banana',
                    reply: 'order banana',
                },
            ],
        },
    });

    response = {
        content: "Your app does not support buttons, sorry!",
        widget_content: widget_content,
    };

    bot.reply(message, response);
}

function order(bot, message) {
    const parts = message.text.split(' ');
    const item = parts[1];

    if (item) {
        const content = "Thank you for ordering the " + item;
        const response = {
            content: content,
        };

        bot.reply(message, response);
    }
}

function snooze(bot, message) {
    function reply() {
        const content = "5 seconds have passed!";
        const response = {
            content: content,
        };
        bot.reply(message, response);
    }

    setTimeout(reply, 5000);
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
controller.hears('buttons', '', buttons);
controller.hears('order', '', order);
controller.hears('snooze', '', snooze);
controller.hears('', 'direct_message', fallthru);

controller.run();

