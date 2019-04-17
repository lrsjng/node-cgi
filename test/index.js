const {test, assert} = require('scar');

const proc = require('../lib/proc');
const pp = require('../lib/pp');
const Resp = require('../lib/resp');

const pkg = require('../package.json');

test('proc', () => {
    assert.equal(typeof proc, 'function');
});

test('pp', () => {
    assert.equal(typeof pp, 'object');
    assert.deepEqual(Object.keys(pp).sort(), ['html', 'js', 'pug']);
    assert.equal(typeof pp.html, 'function');
    assert.equal(typeof pp.js, 'function');
    assert.equal(typeof pp.pug, 'function');
});

test('resp', () => {
    assert.equal(typeof Resp, 'function');
});

test('proc no-file', () => {
    const expected = `Content-Type: application/json\r
Content-Length: 68\r
\r
{"name":"${pkg.name}","version":"${pkg.version}","err":"can't read 'undefined'"}`;

    assert.equal(proc().to_str(), expected);
});

test('proc a.html.nd', () => {
    const filename = 'test/assets/a.html.nd';
    const expected = `Content-Type: text/html\r
Content-Length: 18\r
\r
aaa
111
3
222
bbb
`;

    assert.equal(proc(filename).to_str(), expected);
});

test('proc b.pug.nd', () => {
    const filename = 'test/assets/b.pug.nd';
    const expected = `Content-Type: text/html\r
Content-Length: 102\r
\r
<!DOCTYPE html><html><head><title>Pug-Test</title></head><body><p>Hello</p><span></span></body></html>`;

    assert.equal(proc(filename).to_str(), expected);
});

test.cli();
