module.exports = src => {
    const START_MARK = '<?';
    const END_MARK = '?>';
    const TYPE_RE = /^(\S*)\s/;
    const GLB = '__STRS';

    let code = '';
    const glbs = [];
    const app_text = x => {code += `;write(${GLB}[${glbs.length}]);\n`; glbs.push(x);};
    const app_code = x => {code += `;${x.trim()};\n`;};
    const app_eval = x => {code += `;write(${x.trim()});\n`;};

    let end_idx = 0;
    for (;;) {
        const start_idx = src.indexOf(START_MARK, end_idx);
        if (start_idx < 0) {
            break;
        }

        app_text(src.slice(end_idx, start_idx));

        end_idx = src.indexOf(END_MARK, start_idx);
        if (end_idx < 0) {
            end_idx = src.length;
        }

        const inner = src.slice(start_idx + START_MARK.length, end_idx);
        end_idx += END_MARK.length;
        const type_match = inner.match(TYPE_RE);
        const type = type_match && type_match[1] || '';

        if (type === 'js' || type === '') {
            app_code(inner.slice(type_match[0].length));
        } else if (type === '=') {
            app_eval(inner.slice(type_match[0].length));
        } else {
            app_text(src.slice(start_idx, end_idx));
        }
    }

    app_text(src.slice(end_idx));

    return {
        code,
        glob: {
            [GLB]: glbs
        }
    };
};
