const proc = require('./proc');

module.exports = () => {
    process.stdout.write(proc(process.env)); // eslint-disable-line no-process-env
};
