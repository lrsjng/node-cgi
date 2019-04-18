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
        if (value === undefined) {
            return this._headers[key];
        }
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

    to_str() {
        if (typeof this._render === 'function') {
            this._content = this._render(this._content);
        }

        let str = '';

        this._headers['Content-Length'] = this._content.length;
        Object.keys(this._headers).forEach(key => {
            str += `${key}: ${this._headers[key]}\r\n`;
        });
        str += '\r\n';

        str += this._content;

        return str;
    }
};
