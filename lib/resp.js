const Resp = module.exports = function Resp() {
    this._headers = {};
    this._content = '';
    this._errors = [];
    this.ct_html();
};

Resp.plain = str => new Resp().ct_plain().write(str);
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

    write(str) {
        this._content += String(str);
        return this;
    },

    error(x) {
        this._errors.push(x);
        return this;
    },

    to_str(options) {
        const settings = Object.assign({
            headers: true,
            content: true,
            errors: true
        }, options);
        let str = '';

        if (settings.errors && this._errors.length) {
            this._content += `\n<!-- errors: ${JSON.stringify(this._errors)}-->`;
        }

        if (settings.headers) {
            this._headers['Content-Length'] = this._content.length;
            Object.keys(this._headers).forEach(key => {
                str += `${key}: ${this._headers[key]}\r\n`;
            });
            str += '\r\n';
        }

        if (settings.content) {
            str += this._content;
        }

        return str;
    }
});
