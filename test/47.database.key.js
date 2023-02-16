'use strict';
const Database = require('../.');

describe('Database#key()', function () {
	afterEach(function () {
		this.db.close();
	});

	it('should throw error if a Buffer is not provided', function () {
		this.db = new Database(util.next());
		expect(() => this.db.key(123)).to.throw(TypeError);
		expect(() => this.db.key(0)).to.throw(TypeError);
		expect(() => this.db.key(null)).to.throw(TypeError);
		expect(() => this.db.key()).to.throw(TypeError);
		expect(() => this.db.key(new String('cache_size'))).to.throw(TypeError);
	});
	it('should execute key() without errors', function () {
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		const status = this.db.key(Buffer.from('OkPassword'));
		this.db.exec('CREATE TABLE entries (a TEXT, b INTEGER)');
		expect(status).to.be.an('number');
		expect(status).to.equal(0);
	});
	it('should throw error when an incorrect key is provided', function () {
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		this.db.key(Buffer.from('WrongPassword'));
		expect(() => this.db.exec('select * from sqlite_schema')).to.throw(Database.SqliteError).with.property('code', 'SQLITE_NOTADB');
	});
	it('should not throw error when the correct key is provided', function () {
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		this.db.key(Buffer.from('OkPassword'));
		expect(() => this.db.exec('select * from sqlite_schema')).to.not.throw(Database.SqliteError);
	});
});
