const fs = require('fs');
const path = require('path');
const vm = require('vm');

const Resp = require('./resp');
const pp = require('./pp');

const DEFAULTS = {
    ext_types: {
        '.html.nd': 'html',
        '.pug.nd': 'pug',
        '.md.nd': 'md'
    }
};

module.exports = (env, options) => {
    env = Object.assign({}, env);
    const settings = Object.assign({}, DEFAULTS, options);

    const filename = env.PATH_TRANSLATED;
    let src = '';

    try {
        src = fs.readFileSync(filename, {encoding: 'utf-8'});
    } catch (err) {
        return Resp.json({err: `can't read '${filename}'`});
    }

    // console.log(src);
    let pp_fn;
    Object.keys(settings.ext_types).forEach(ext => {
        if (filename.endsWith(ext)) {
            pp_fn = pp[settings.ext_types[ext]];
        }
    });
    if (typeof pp_fn === 'function') {
        src = pp_fn(src);
    }
    // console.log(src);

    const resp = new Resp();
    const req = {
        filename,
        method: env.REQUEST_METHOD,
        scheme: env.REQUEST_SCHEME,
        host: env.SERVER_NAME,
        port: env.SERVER_PORT,
        path: env.PATH_INFO,
        query: env.QUERY_STRING
    };

    const global = {
        env,
        req,
        resp,
        write: (...args) => resp.write(...args),

        require: id => {
            if (id.startsWith('./') || id.startsWith('../')) {
                id = path.resolve(path.dirname(filename), id);
            }
            return require(id);
        }
    };

    vm.runInNewContext(src, global);
    return resp;
};
