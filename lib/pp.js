const html = src => {
    const START_MARK = '<?';
    const END_MARK = '?>';
    const TYPE_RE = /^(\S*)\s/;

    let pos = 0;
    const parts = [];

    for (;;) {
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
            parts.push({
                type: type_match[1] || 'js',
                content: content.slice(type_match[0].length)
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

    return parts.map(part => {
        if (part.type === 'js') {
            return `;${part.content.trim()};\n`;
        }
        if (part.type === '=') {
            return `;write(${part.content.trim()});\n`;
        }
        return `;write(\`${part.content}\`);\n`;
    }).join('');
};

module.exports = {
    html,
    pug: src => html(require('pug').render(src)),
    md: src => html(require('marked')(src))
};
