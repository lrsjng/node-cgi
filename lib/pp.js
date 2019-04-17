const WRITE_FN_NAME = 'write';
const BLOCKS_ID = '__blocks';

const pp_html = ctx => {
    const DEFAULT_TYPE = 'js';
    const TYPE_RE = /^(\S*)\s/;
    const START_MARK = '<?';
    const END_MARK = '?>';

    let pos = 0;
    const parts = [];
    const src = ctx.source;

    while (true) { // eslint-disable-line no-constant-condition
        const start_idx = src.indexOf(START_MARK, pos);

        if (start_idx < 0) {
            break;
        }

        parts.push({
            content: src.slice(pos, start_idx)
        });

        pos = src.indexOf(END_MARK, start_idx);
        if (pos < 0) {
            pos = src.length;
        }

        const content = src.slice(start_idx + START_MARK.length, pos);
        pos += END_MARK.length;
        const type_match = content.match(TYPE_RE);
        if (type_match) {
            const type = type_match[1] || '';

            parts.push({
                type: type || DEFAULT_TYPE,
                content: content.slice(type.length)
            });
        } else {
            parts.push({
                content: START_MARK + content + END_MARK
            });
        }
    }

    parts.push({
        content: src.slice(pos)
    });

    const blks = [];

    ctx.code = parts.map(part => {
        if (part.type === 'js') {
            return `${part.content.trim()};`;
        }
        if (part.type === '=') {
            return `${WRITE_FN_NAME}(${part.content.trim()});`;
        }
        blks.push(part.content);
        return `;${WRITE_FN_NAME}(${BLOCKS_ID}[${blks.length - 1}]);`;
    }).join('');
    ctx.global[BLOCKS_ID] = blks;
};

const pp_js = ctx => {
    const blks = [];

    ctx.code = ctx.source.replace(/\/\*=([\s\S]*?)\*\//g, (match, content) => {
        blks.push(content);
        return `;${WRITE_FN_NAME}(${BLOCKS_ID}[${blks.length - 1}]);`;
    });
    ctx.global[BLOCKS_ID] = blks;
};

const pp_pug = ctx => {
    const settings = {};
    const locals = {};
    const render = require('pug').compile(ctx.source, settings);
    ctx.source = render(locals);
    pp_html(ctx);
};

module.exports = {
    html: pp_html,
    js: pp_js,
    pug: pp_pug
};
