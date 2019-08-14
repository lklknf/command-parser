const normalizedPath = require('path').join(__dirname, 'commands');

let commands = [];

require('fs').readdirSync(normalizedPath,{withFileTypes: true}).forEach(function (file) {
    if(file.isFile()){
        commands.push(require('./commands/' + file.name));
    }

});

module.exports = commands;
