const proc = require('./proc');

const cgi = () => {
    const env = process.env; // eslint-disable-line no-process-env
    process.stdout.write(proc(env).to_str());
};

module.exports = cgi;
