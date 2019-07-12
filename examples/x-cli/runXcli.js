const CommandParser = require('@nnnx/command-parser');
const colors = require('colors');
const readline = require('readline');
const parse = require('shell-quote').parse;
const commands = require('./commands');

async function askUserInput(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function make_red(txt) {
    // noinspection JSUnresolvedFunction
    return colors.red(txt); //display the help text in red on the console
}

module.exports.runXCli = async function () {

    let config = {
        version: '1.0.1',
        options: [
            {
                'name': 'logErrors',
                'description': 'Log any exceptions thrown during command execution',
                'short-flag': '-le',
                'long-flag': '--log-errors',
            }
        ],
        commands,
    };

    let commandParser = new CommandParser(config);

    while (true) {
        let input = await askUserInput('input: ');
        console.log('input was: ' + input);

        // noinspection JSIncompatibleTypesComparison
        if (input === 'exit') {
            break;
        }

        try {
            let result = commandParser.parseInput(parse(input));
            let {command, options} = result;
            let output = null;

            if (command) {
                if (command.hasInvalidArgs) {
                    output = make_red(command.invalidArgMessage);
                } else if (command.hasHelpArg) {
                    output = command.helpMessage;
                } else {

                    try {
                        output = await command.action(command.options);
                    } catch (e) {

                        if (options.logErrors === true) {
                            output = e.message;
                        }

                    }

                }
            } else {
                output = commandParser.helpMessage;
            }

            console.log(output);
        } catch (e) {
            console.log(e);
        }
    }
};
