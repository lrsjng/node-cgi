const {inspect} = require('util');

const Resp = module.exports = function Resp() {
    this._headers = {};
    this._content = '';
    this._proc = null;
    this.ct_html();
};

Resp.json = (x, indent = 2) => new Resp().ct_json().write(JSON.stringify(x, null, indent));

Object.assign(Resp.prototype, {
    ct_plain() { return this.header('Content-Type', 'text/plain'); },
    ct_html() { return this.header('Content-Type', 'text/html'); },
    ct_json() { return this.header('Content-Type', 'application/json'); },

    header(key, value) {
        if (value === undefined) {
            return this._headers[key];
        }
        this._headers[key] = value;
        return this;
    },

    write(arg) {
        this._content += typeof arg === 'string' ? arg : inspect(arg);
        return this;
    },

    proc(fn) {
        this._proc = fn;
    },

    to_str() {
        if (typeof this._proc === 'function') {
            this._content = this._proc(this._content);
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
});
