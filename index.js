const utils = require('@nnnx/utils');
const {hasLongFlag} = require('./command');
const {hasShortFlag} = require('./command');

class CommandParser {
    constructor(config) {
        let {version, options, commands} = config;
        this.version = version;
        this.options = options;
        this.commandConfigs = this.initCommandConfigs(commands);
        this.commandConfigsMap = utils.normalize(this.commandConfigs, 'name');
        this.helpMessage = this.createHelpMessage(config);
    }

    parseInput(args) {
        let commandConfig = this.commandConfigsMap[args[0]];
        return {
            options: {
                logErrors: true
            },
            command: commandConfig ? this.parseCommandInput(commandConfig, args) : null,
        }
    }

    parseCommandInput(config, args) {

        if (!config) {
            return null;
        }
        let {
            hasMissingArgs,
            missingArgs,
            hasInvalidArgs,
            hasHelpArg,
            invalidArgs,
            options
        } = this.extractCommandOptions(config.options, args.slice(1));
        let invalidArgMessage = config.invalidArgMessage || '';

        if (hasInvalidArgs) {
            invalidArgMessage += '\n' + this.createInvalidArgMessage(invalidArgs);
        }
        return {
            hasMissingArgs,
            missingArgs,
            hasInvalidArgs,
            hasHelpArg,
            invalidArgMessage,
            helpMessage: config.helpMessage,
            action: config.action,
            options,
        }
    }

    extractCommandOptions(optionConfigs = [], args) {
        let remainingArgs = args;
        let optionConfigsByShortFlag = utils.normalize(optionConfigs.filter(hasShortFlag), 'shortFlag');
        let optionConfigsByLongFlag = utils.normalize(optionConfigs.filter(hasLongFlag), 'longFlag');
        let [flaglessOptionConfig] = optionConfigs.filter(optionConfig => optionConfig.flagless === true);
        let hasHelpArg = false;
        let hasInvalidArgs = false;
        let invalidArgs = [];
        let options = {};
        while (remainingArgs.length > 0) {
            let isLastOption = remainingArgs.length === 1;
            let arg = remainingArgs.shift();

            if (arg === '--help') {
                hasHelpArg = true;
                continue;
            }

            let optionConfig = optionConfigsByShortFlag[arg] || optionConfigsByLongFlag[arg];

            if (!optionConfig && !flaglessOptionConfig) {
                hasInvalidArgs = true;
                invalidArgs.push(
                    {arg, reason: 'no such option specified'}
                );
                continue;
            } else if (!optionConfig && flaglessOptionConfig) {
                arg = [arg, ...remainingArgs].join(' ');
                remainingArgs = [];
                options[flaglessOptionConfig.name] = arg;

                if (flaglessOptionConfig.validator && !flaglessOptionConfig.validator(arg)) {
                    hasInvalidArgs = true;
                    invalidArgs.push(
                        {arg, reason: 'Validation failed: ' + arg + ' ' + flaglessOptionConfig.validationMessage}
                    );
                }
                break;
            }


            if (optionConfig.withFlagArguments) {
                let flagArgument = remainingArgs.shift();
                options[optionConfig.name] = flagArgument;

                if (optionConfig.validator && !optionConfig.validator(flagArgument)) {
                    hasInvalidArgs = true;
                    invalidArgs.push(
                        {arg, reason: 'Validation failed: ' + flagArgument + ' ' + optionConfig.validationMessage}
                    );
                }

            } else {
                options[optionConfig.name] = true;
            }

        }
        let optionNames = Object.keys(options);
        let missingArgs = optionConfigs.filter(config => !(config.optional || optionNames.includes(config.name)));
        return {
            hasMissingArgs: missingArgs.length > 0,
            missingArgs,
            options,
            hasInvalidArgs,
            invalidArgs,
            hasHelpArg,
        }
    }

    initCommandConfigs(commandConfigs = []) {
        if (!Array.isArray(commandConfigs)) {
            throw Error('Config error: commands have to be an array');
        }

        return commandConfigs.map(commandConfig => this.initCommandConfig(commandConfig));
    }

    initCommandConfig(commandConfig) {
        if (typeof commandConfig !== 'object') {
            throw Error('Config error: a command has to be an object');
        }

        let {options} = commandConfig;

        if (!Array.isArray(options)) {
            throw Error('Config error: command options have to be an array');
        }

        return {
            ...commandConfig,
            helpMessage: this.createHelpMessageFromOptions(options),
        };
    }

    createHelpMessage(config = {}) {
        let helpString = 'Help:\n';
        if (Array.isArray(config.commands)) {
            helpString += config.commands.map(command => command.name).join('\n');
        }
        return helpString;
    }

    createHelpMessageFromOptions(options) {
        return 'Command options: ' + options.map(option => option.shortFlag + ' <' + option.name + '>').join(' ');
    }

    createInvalidArgMessage(invalidArgs) {
        return invalidArgs.map(obj => 'Invalid Arg. Arg: ' + obj.arg + '  Reason: ' + obj.reason).join('\n');
    }
}

module.exports = CommandParser;

