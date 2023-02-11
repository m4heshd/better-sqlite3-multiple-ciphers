'use strict';
const Database = require('../.');

describe('Database#rekey()', function () {
	beforeEach(function () {
		this.db = new Database(util.next());
	});
	afterEach(function () {
		this.db.close();
	});

	it('should throw an exception if a Buffer is not provided', function () {
		expect(() => this.db.rekey(123)).to.throw(TypeError);
		expect(() => this.db.rekey(0)).to.throw(TypeError);
		expect(() => this.db.rekey(null)).to.throw(TypeError);
		expect(() => this.db.rekey()).to.throw(TypeError);
		expect(() => this.db.rekey(new String('cache_size'))).to.throw(TypeError);
	});
	it('should execute the rekey, and not throwing an exception', function () {
		const status = this.db.rekey(Buffer.from('aPassword'));
		expect(status).to.be.an('number');
		expect(status).to.equal(0);
	});
	it('should throw error when key was not first provided', function () {
		const dbName = util.next();
		let testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OkPassword'));
		testdb.exec('CREATE TABLE entries (a TEXT, b INTEGER)');
		testdb.close();
		testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		expect(() => testdb.rekey(Buffer.from('NewPassword'))).to.throw(Database.SqliteError).with.property('code', 'SQLITE_NOTADB');
		testdb.close();
	});
	it('should not throw error when right key is provided after rekey', function () {
		const dbName = util.next();
		let testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OkPassword'));
		testdb.exec('CREATE TABLE entries (a TEXT, b INTEGER)');
		testdb.close();
		testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OkPassword'));
		testdb.rekey(Buffer.from('OtherOkPassword'));
		testdb.exec('select * from sqlite_schema');
		testdb.close();
		testdb = new Database(dbName);
		testdb.pragma(`cipher='aes256cbc'`);
		testdb.key(Buffer.from('OtherOkPassword'));
		expect(() => testdb.exec('select * from sqlite_schema')).to.not.throw(Database.SqliteError);
		testdb.close();
	});
});
