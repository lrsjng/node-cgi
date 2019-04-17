const fs = require('fs');
const path = require('path');
const vm = require('vm');

const Resp = require('./resp');
const pp = require('./pp');
const pkg = require('../package.json');

const DEFAULTS = {
    default_type: 'js',
    ext_types: {
        '.pug.nd': 'pug',
        '.html.nd': 'html'
    }
};

const run_code = (code, sandbox) => {
    const stdout = process.stdout.write;
    const stderr = process.stderr.write;

    process.stdout.write = sandbox.write;
    process.stderr.write = sandbox.error;

    vm.runInNewContext(code, sandbox);

    process.stdout.write = stdout;
    process.stderr.write = stderr;
};

module.exports = (filename, options) => {
    const settings = Object.assign({}, DEFAULTS, options);
    const ctx = {
        source: '',
        code: '',
        global: {}
    };

    try {
        filename = path.resolve(filename);
        ctx.source = fs.readFileSync(filename, 'utf8');
    } catch (err) {
        return Resp.json({
            name: pkg.name,
            version: pkg.version,
            err: `can't read '${filename}'`
        });
    }

    let type = settings.default_type;
    Object.keys(settings.ext_types).forEach(ext => {
        if (filename.endsWith(ext)) {
            type = settings.ext_types[ext];
        }
    });
    if (typeof pp[type] !== 'function') {
        type = 'js';
    }

    pp[type](ctx);

    const resp = new Resp();
    const dirname = path.dirname(filename);

    Object.assign(ctx.global, {
        filename,
        dirname,

        header: (...args) => resp.header(...args),
        write: (...args) => resp.write(...args),
        error: (...args) => resp.error(...args),

        require: id => {
            if (id.startsWith('./') || id.startsWith('../')) {
                id = path.resolve(dirname, id);
            }
            return module.require(id);
        },
        env: process.env // eslint-disable-line no-process-env
    });

    run_code(ctx.code, ctx.global);
    return resp;
};
