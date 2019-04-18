const fs = require('fs');
const {test, assert} = require('scar');

const cgi = require('../lib/cgi');
const proc = require('../lib/proc');
const pp = require('../lib/pp');
const Resp = require('../lib/resp');

const read = path => fs.readFileSync(path, {encoding: 'utf-8'});
const readr = path => read(path)
    .replace(/\\r/g, '\r')
    .replace(/\\0[\s\S]*/g, '');

test('module resolves to cgi', () => {
    assert.equal(require('..'), cgi);
});

test('cgi', () => {
    assert.equal(typeof cgi, 'function');
});

test('proc', () => {
    assert.equal(typeof proc, 'function');
});

test('pp', () => {
    assert.equal(typeof pp, 'object');
    assert.deepEqual(Object.keys(pp).sort(), ['html', 'md', 'pug']);
    assert.equal(typeof pp.html, 'function');
    assert.equal(typeof pp.md, 'function');
    assert.equal(typeof pp.pug, 'function');
});

test('resp', () => {
    assert.equal(typeof Resp, 'function');
});

test('proc - no file', () => {
    const expected = readr('test/assets/none.txt');
    assert.equal(proc().to_str(), expected);
});

test('proc - file.html.nd', () => {
    const env = {
        PATH_TRANSLATED: 'test/assets/a.html.nd'
    };
    const expected = readr('test/assets/a.txt');
    assert.equal(proc(env).to_str(), expected);
});

test('proc - file.pug.nd', () => {
    const env = {
        PATH_TRANSLATED: 'test/assets/b.pug.nd'
    };
    const expected = readr('test/assets/b.txt');
    assert.equal(proc(env).to_str(), expected);
});

test('proc - file.md.nd', () => {
    const env = {
        PATH_TRANSLATED: 'test/assets/c.md.nd'
    };
    const expected = readr('test/assets/c.txt');
    assert.equal(proc(env).to_str(), expected);
});

test.cli();
