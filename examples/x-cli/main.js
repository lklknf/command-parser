const {runXCli} = require('./runXcli');
try {
    runXCli().then();
} catch (e) {
    console.log(e.message);
}
