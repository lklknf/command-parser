function getServerMessageCountOn(textOnly) {
    if(textOnly){
        return 244;
    }
    return 999;
}

function getServerMessageCount(textOnly) {
    if(textOnly){
        return 244;
    }
    return 999;
}


function isDate(date)  {
    return Date.parse(date);
}

const command = {
    'name': 'stats',
    options: [
        {
            name: 'on',
            description: 'The date for which you want to retrieve a message count.',
            shortFlag: '-o',
            longFlag: '--on',
            withFlagArguments: true,
            validationMessage: "is not a validate date",
            validator: isDate
        },
        {
            name: 'textOnly',
            description: 'Only messages with that include textual content.',
            shortFlag: '-t',
            longFlag: '--text-only',
        },
    ],
    action: async (options) => {
        if (options.on) {
            return await getServerMessageCountOn(options.on, options.textOnly)
        } else {
            return await getServerMessageCount(options.textOnly)
        }
    }
};

module.exports = command;
