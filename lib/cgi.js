const proc = require('./proc');

module.exports = () => {
    const env = {...process.env}; // eslint-disable-line no-process-env
    process.stdout.write(proc(env).format());
};
