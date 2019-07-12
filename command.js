exports.hasShortFlag = command => {
    return typeof command["shortFlag"] === 'string' && command["shortFlag"].length > 0;
};

exports.hasLongFlag = command => {
    return typeof command["longFlag"] === 'string' && command["longFlag"].length > 0;
};
