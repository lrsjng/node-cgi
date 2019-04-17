const Resp = module.exports = function Resp() {
    this._headers = {'Content-Type': 'text/html'};
    this._content = '';
    this._errors = [];
};

Resp.plain = str => new Resp()
    .header('Content-Type', 'text/plain')
    .write(str);

Resp.json = arg => new Resp()
    .header('Content-Type', 'application/json')
    .write(JSON.stringify(arg));

Object.assign(Resp.prototype, {
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

    error(arg) {
        this._errors.push(arg);
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
