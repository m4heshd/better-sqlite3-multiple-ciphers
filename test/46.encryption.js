'use strict';
const Database = require('../.');

describe('Encryption using default method (Sqleet)', () => {
    afterEach(() => {
        this.db.close();
    });

    it('should create an encrypted database', () => {
        this.db = new Database(util.next());
        this.db.pragma(`rekey='passphrase'`);
        this.db.prepare('CREATE TABLE user ("name" TEXT)').run();
        this.db.prepare("INSERT INTO user (name) VALUES ('octocat')").run();
        this.db.prepare('VACUUM').run();
    });
    it('should not allow access without decryption', () => {
        this.db = new Database(util.current());
        expect(() => this.db.prepare('SELECT * FROM user')).to.throw(Database.SqliteError);
    });
    it('should not allow access with an incorrect passphrase', () => {
        this.db = new Database(util.current());
        this.db.pragma(`key='false_passphrase'`);
        expect(() => this.db.prepare('SELECT * FROM user')).to.throw(Database.SqliteError);
    });
    it('should allow access with the correct passphrase', () => {
        this.db = new Database(util.current());
        this.db.pragma(`key='passphrase'`);
        const stmt = this.db.prepare('SELECT * FROM user');
        expect(stmt.get()).to.deep.equal({name: 'octocat'});
    });
});
