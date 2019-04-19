module.exports = class Resp {
    constructor() {
        this._headers = {};
        this._content = '';
        this._render = null;
        this.ct_html();
    }

    ct_plain() { return this.set_header('Content-Type', 'text/plain'); }
    ct_html() { return this.set_header('Content-Type', 'text/html'); }
    ct_json() { return this.set_header('Content-Type', 'application/json'); }

    set_header(key, value) {
        this._headers[key] = value;
        return this;
    }

    write(arg) {
        this._content += String(arg);
        return this;
    }

    set_render(fn) {
        this._render = fn;
        return this;
    }

    format() {
        let str = this._content;
        if (typeof this._render === 'function') {
            str = this._render(str);
        }

        const hdrs = {...this._headers, 'Content-Length': str.length};
        return Object.keys(hdrs)
            .map(key => `${key}: ${hdrs[key]}\r\n`)
            .join('') + '\r\n' + str;
    }
};
