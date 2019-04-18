const fs = require('fs');
const path = require('path');

const Resp = require('./resp');
const run = require('./run');

const DEFAULTS = {
    render: {
        '.pug.nd': x => require('pug').render(x),
        '.md.nd': x => require('marked')(x)
    }
};

const get_render_fn = (name, map) => {
    return map[Object.keys(map).filter(ext => name.endsWith(ext))[0]];
};

module.exports = (env, options) => {
    const settings = {...DEFAULTS, ...options};

    const filename = env.PATH_TRANSLATED;
    const src = fs.readFileSync(filename, 'utf-8');

    const resp = new Resp();

    const globals = {
        env,
        resp,
        write: arg => resp.write(arg),

        require: id => {
            if (id.includes('/')) {
                id = path.resolve(path.dirname(filename), id);
            }
            return require(id);
        }
    };

    run(src, globals);

    resp.set_render(get_render_fn(filename, settings.render));

    // console.log(resp.to_str());
    return resp;
};
