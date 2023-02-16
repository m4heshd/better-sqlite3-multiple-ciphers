'use strict';
const Database = require('../.');

describe('Database#rekey()', function () {
	afterEach(function () {
		this.db.close();
	});

	it('should throw error if a Buffer is not provided', function () {
		this.db = new Database(util.next());
		expect(() => this.db.rekey(123)).to.throw(TypeError);
		expect(() => this.db.rekey(0)).to.throw(TypeError);
		expect(() => this.db.rekey(null)).to.throw(TypeError);
		expect(() => this.db.rekey()).to.throw(TypeError);
		expect(() => this.db.rekey(new String('cache_size'))).to.throw(TypeError);
	});
	it('should execute rekey() without errors', function () {
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		const status = this.db.rekey(Buffer.from('OkPassword'));
		this.db.exec('CREATE TABLE entries (a TEXT, b INTEGER)');
		expect(status).to.be.an('number');
		expect(status).to.equal(0);
	});
	it('should throw error if an encrypted database is not decrypted before rekey()', function () {
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		expect(() => this.db.rekey(Buffer.from('NewPassword'))).to.throw(Database.SqliteError).with.property('code', 'SQLITE_NOTADB');
	});
	it('should allow to rekey() if an already encrypted database is properly decrypted in advance', function () {
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		this.db.key(Buffer.from('OkPassword'));
		this.db.rekey(Buffer.from('NewPassword'));
		this.db.exec('select * from sqlite_schema');
		this.db.close();
		this.db = new Database(util.current());
		this.db.pragma(`cipher='aes256cbc'`);
		this.db.key(Buffer.from('NewPassword'));
		expect(() => this.db.exec('select * from sqlite_schema')).to.not.throw(Database.SqliteError);
	});
});
