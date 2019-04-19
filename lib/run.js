const vm = require('vm');

module.exports = (src, glob) => {
    const START_MARK = '<?';
    const END_MARK = '?>';
    const TYPE_RE = /^(\S*)\s/;
    const TXTS_ID = '__TXTS__';

    let code = '';
    const txts = [];
    const app_code = x => {code += `${x.trim()};\n`;};
    const app_eval = x => {app_code(`write(${x})`);};
    const app_text = x => {app_eval(`${TXTS_ID}[${txts.length}]`); txts.push(x);};

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

        const match = inner.match(TYPE_RE);
        const type = match && match[1];
        if (type === 'js' || type === '') {
            app_code(inner.slice(match[0].length));
        } else if (type === '=') {
            app_eval(inner.slice(match[0].length));
        } else {
            app_text(src.slice(start_idx, end_idx));
        }
    }

    app_text(src.slice(end_idx));

    vm.runInNewContext(code, {...glob, [TXTS_ID]: txts});

    // console.log(src);
    // console.log(glob);
    // console.log(code);
    // console.log(txts);
};
