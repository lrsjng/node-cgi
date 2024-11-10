const fs = require('fs');
const path = require('path');

const run = require('./run');

const DEFAULTS = {
    render: {
        '.pug.nd': x => require('pug').render(x),
        '.md.nd': x => require('marked').marked(x)
    }
};

const get_render_fn = (name, map) => {
    return map[Object.keys(map).filter(ext => name.endsWith(ext))[0]];
};

module.exports = (env, options) => {
    const settings = {...DEFAULTS, ...options};

    const filename = env.PATH_TRANSLATED;
    const src = fs.readFileSync(filename, 'utf-8');

    let content = '';
    const write = x => {content += String(x);};

    const hdrs = {};
    const header = (key, value) => {hdrs[key] = value;};
    header.plain = () => header('Content-Type', 'text/plain');
    header.html = () => header('Content-Type', 'text/html');
    header.json = () => header('Content-Type', 'application/json');
    header.html();

    const glob = {
        env,
        header,
        write,
        require: id => {
            if (id.includes('/')) {
                id = path.resolve(path.dirname(filename), id);
            }
            return require(id);
        }
    };
    glob.global = glob;

    run(src, glob);

    // console.log(resp.format());
    const fn = get_render_fn(filename, settings.render);
    if (typeof fn === 'function') {
        content = fn(content);
    }
    // console.log(resp.format());

    header('Content-Length', content.length);
    return Object.keys(hdrs)
        .map(key => `${key}: ${hdrs[key]}\r\n`)
        .join('') + '\r\n' + content;
};
