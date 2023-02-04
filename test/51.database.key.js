'use strict';
const Database = require('../.');

describe('Database#key()', function () {
	beforeEach(function () {
		this.db = new Database(util.next());
	});
	afterEach(function () {
		this.db.close();
	});

	it('should throw an exception if a Buffer is not provided', function () {
		expect(() => this.db.key(123)).to.throw(TypeError);
		expect(() => this.db.key(0)).to.throw(TypeError);
		expect(() => this.db.key(null)).to.throw(TypeError);
		expect(() => this.db.key()).to.throw(TypeError);
		expect(() => this.db.key(new String('cache_size'))).to.throw(TypeError);
	});
	it('should execute the key, and not throwing an exception', function () {
		const status = this.db.key(Buffer.from('aPassword'));
		expect(status).to.be.an('number');
		expect(status).to.equal(0);
	});
	it('should throw error when wrong key is provided', function () {
		const dbName = util.next();
		let testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OkPassword'));
		testdb.exec('CREATE TABLE entries (a TEXT, b INTEGER)');
		testdb.close();
		testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('WrongPassword'));
		expect(() => testdb.exec('select * from sqlite_schema')).to.throw(Database.SqliteError).with.property('code', 'SQLITE_NOTADB');
		testdb.close();
	});
	it('should not throw error when right key is provided', function () {
		const dbName = util.next();
		let testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OkPassword'));
		testdb.exec('CREATE TABLE entries (a TEXT, b INTEGER)');
		testdb.close();
		testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OkPassword'));
		expect(() => testdb.exec('select * from sqlite_schema')).to.not.throw(Database.SqliteError);
		testdb.close();
	});
});
