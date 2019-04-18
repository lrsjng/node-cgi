const fs = require('fs');
const path = require('path');
const vm = require('vm');

const Resp = require('./resp');
const gen = require('./gen');

const DEFAULTS = {
    ext_types: {
        '.html.nd': 'html',
        '.pug.nd': 'pug',
        '.md.nd': 'md'
    }
};

const get_type = (name, types) => {
    let type;
    Object.keys(types).forEach(ext => {
        if (name.endsWith(ext)) {
            type = types[ext];
        }
    });
    return type;
};

module.exports = (env, options) => {
    env = Object.assign({}, env);
    const settings = Object.assign({}, DEFAULTS, options);

    const filename = env.PATH_TRANSLATED;
    const src = fs.readFileSync(filename, {encoding: 'utf-8'});

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
        write: arg => resp.write(arg),

        require: id => {
            if (id.includes('/')) {
                id = path.resolve(path.dirname(filename), id);
            }
            return require(id);
        }
    };

    const {code, glob} = gen(src);
    Object.assign(global, glob);

    vm.runInNewContext(code, global);

    // console.log(global);
    // console.log(src);
    // console.log(code);

    const type = get_type(filename, settings.ext_types);
    if (type === 'pug') {
        resp.proc(x => require('pug').render(x));
    } else if (type === 'md') {
        resp.proc(x => require('marked')(x));
    }

    return resp;
};
