# better-sqlite3-multiple-ciphers

[![NPM version](https://img.shields.io/npm/v/better-sqlite3-multiple-ciphers?logo=npm&color=cc3838&style=for-the-badge)](https://www.npmjs.com/package/better-sqlite3-multiple-ciphers)
[![Downloads](https://img.shields.io/npm/dt/better-sqlite3-multiple-ciphers?logo=DocuSign&logoColor=FFF&color=2757c4&style=for-the-badge)](https://www.npmjs.com/package/better-sqlite3-multiple-ciphers)
[![Build status](https://img.shields.io/github/actions/workflow/status/m4heshd/better-sqlite3-multiple-ciphers/test.yml?branch=master&label=Build%2FTest&logo=github&style=for-the-badge)](https://github.com/m4heshd/better-sqlite3-multiple-ciphers/actions/workflows/test.yml)

The fastest and simplest library for SQLite in Node.js. This particular fork supports multiple-cipher encryption using [SQLite3MultipleCiphers](https://github.com/utelle/SQLite3MultipleCiphers). Check [usage](#usage) to learn more.

- Full transaction support
- High performance, efficiency, and safety
- Easy-to-use synchronous API *(better concurrency than an asynchronous API... yes, you read that correctly)*
- Support for user-defined functions, aggregates, virtual tables, and extensions
- 64-bit integers *(invisible until you need them)*
- Worker thread support *(for large/slow queries)*
- Encryption support using multiple algorithms

## Current versions

- ### Stable
  - **better-sqlite3-multiple-ciphers** - [`13.0.3`](https://github.com/m4heshd/better-sqlite3-multiple-ciphers/releases/tag/v13.0.3)
  - **better-sqlite3** - [`13.0.3`](https://github.com/JoshuaWise/better-sqlite3/releases/tag/v13.0.3)
  - **SQLite** - [`3.53.4`](https://www.sqlite.org/releaselog/3_53_4.html)
  - **SQLite3 Multiple Ciphers** - [`2.4.0`](https://github.com/utelle/SQLite3MultipleCiphers/releases/tag/v2.4.0)

- ### Beta
  - **better-sqlite3-multiple-ciphers** - [`13.0.0-beta.0`](https://github.com/m4heshd/better-sqlite3-multiple-ciphers/releases/tag/v13.0.0-beta.0)
  - **better-sqlite3** - [`13.0.3`](https://github.com/JoshuaWise/better-sqlite3/releases/tag/v13.0.3)
  - **SQLite** - [`3.53.4`](https://www.sqlite.org/releaselog/3_53_4.html)
  - **SQLite3 Multiple Ciphers** - [`2.4.0`](https://github.com/utelle/SQLite3MultipleCiphers/releases/tag/v2.4.0)

## Help this project stay strong! &#128170;

I'm the author of `better-sqlite3-multiple-ciphers` and also a team member and maintainer of `better-sqlite3`. `better-sqlite3-multiple-ciphers` is mostly used by commercial projects that require data security on the client's end. If your company uses `better-sqlite3-multiple-ciphers`, ask your manager to consider supporting the project. I put in a lot of hours to maintain both of these projects, and you can support me by buying me a few coffees. 😊

The best way for you to support me is via GitHub Sponsors, even for one-time donations, because they don't keep a share. Everything you donate goes to the developer.

[![Donate on GitHub](https://i.ibb.co/MD20Myt2/Donate-on-Git-Hub.png)](https://github.com/sponsors/m4heshd)

[![Donate to m4heshd on Wise](https://i.ibb.co/s9nT2hfp/donate-on-wise.png)](https://wise.variatix.net/)

Other donation methods:

**PayPal is not a preferred method of donation because they take a huge chunk (~22%) off of every donation _(ko-fi also uses PayPal)_.**

[![ko-fi](https://i.ibb.co/QmQknmc/ko-fi.png)](https://ko-fi.variatix.net/)

[![Donate to m4heshd](https://i.ibb.co/8PgVcwK/Paypal.png)](https://paypal.variatix.net/)

**Also make sure to support the upstream projects**

Head over to the [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) repo and give some support to the author and the team to keep this valuable package maintained.

Also, head over to the [SQLite3MultipleCiphers](https://github.com/utelle/SQLite3MultipleCiphers) repo and give some support to the developer to keep this very useful extension alive. This project is authored and maintained by a sole developer.

## How other libraries compare

|   |select 1 row &nbsp;`get()`&nbsp;|select 100 rows &nbsp;&nbsp;`all()`&nbsp;&nbsp;|select 100 rows `iterate()` 1-by-1|insert 1 row `run()`|insert 100 rows in a transaction|
|---|---|---|---|---|---|
|better-sqlite3|1x|1x|1x|1x|1x|
|[sqlite](https://www.npmjs.com/package/sqlite) and [sqlite3](https://www.npmjs.com/package/sqlite3)|11.7x slower|2.9x slower|24.4x slower|2.8x slower|15.6x slower|

> You can verify these results by [running the benchmark yourself](./docs/benchmark.md).

## Installation

### Stable

```bash
npm install better-sqlite3-multiple-ciphers
```

### Beta

```bash
npm install better-sqlite3-multiple-ciphers@beta
```

> Requires a [currently supported Node.js](https://nodejs.org/en/about/previous-releases) version. Prebuilt binaries are available for major platforms/architectures. If you have trouble installing, check the [troubleshooting guide](./docs/troubleshooting.md).

## Usage

```js
const db = require('better-sqlite3-multiple-ciphers')('foobar.db', options);

const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
console.log(row.firstName, row.lastName, row.email);
```

Though not required, [it is generally important to set the WAL pragma for performance reasons](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md).

```js
db.pragma('journal_mode = WAL');
```

##### In ES6 module notation:

```js
import Database from 'better-sqlite3-multiple-ciphers';
const db = new Database('foobar.db', options);
db.pragma('journal_mode = WAL');
```

### Encryption

A database can be encrypted and decrypted simply using `key` and `rekey` `PRAGMA` statements.

**Running this will encrypt the database using the default cipher (sqleet):**

```js
const db = require('better-sqlite3-multiple-ciphers')('foobar.db', options);

db.pragma(`rekey='secret-key'`);
db.close();
```

**To read an encrypted database (assuming default cipher):**

```js
const db = require('better-sqlite3-multiple-ciphers')('foobar.db', options);

db.pragma(`key='secret-key'`);
const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
console.log(row.firstName, row.lastName, row.email);
```

**To read an encrypted database _(legacy SQLCipher)_ created by tools like [DB Browser for SQLite](https://github.com/sqlitebrowser/sqlitebrowser):**

```js
const db = require('better-sqlite3-multiple-ciphers')('foobar.db', options);

db.pragma(`cipher='sqlcipher'`)
db.pragma(`legacy=4`)
db.pragma(`key='secret-key'`);
const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
console.log(row.firstName, row.lastName, row.email);
```
The same method should be used if you want to create a new encrypted database that can be opened using DB Browser for SQLite.

You can also use [`key()`](https://github.com/m4heshd/better-sqlite3-multiple-ciphers/blob/master/docs/api.md#keybuffer---number) and [`rekey()`](https://github.com/m4heshd/better-sqlite3-multiple-ciphers/blob/master/docs/api.md#rekeybuffer---number) functions for encryption and decryption tasks.

**GUI database editors:**

Even though `better-sqlite3-multiple-ciphers` supports opening databases created
using [DB Browser for SQLite](https://github.com/sqlitebrowser/sqlitebrowser), it only supports creating/editing legacy
SQLCipher databases which means, it's highly likely that you won't be able to open a database created
using `better-sqlite3-multiple-ciphers` in DB Browser for SQLite.

To visually edit databases created using `better-sqlite3-multiple-ciphers` regardless of the cipher configuration, it's
recommended to use a tool like [SQLiteStudio](https://github.com/pawelsalawa/sqlitestudio) because it also
uses [SQLite3MultipleCiphers](https://github.com/utelle/SQLite3MultipleCiphers) under the hood.

### Read more about encryption at [SQLite3MultipleCiphers documentation](https://utelle.github.io/SQLite3MultipleCiphers/).

## Why should I use this instead of [node-sqlite3](https://github.com/mapbox/node-sqlite3)?

- `node-sqlite3` uses asynchronous APIs for tasks that are either CPU-bound or serialized. That's not only bad design, but it wastes tons of resources. It also causes [mutex thrashing](https://en.wikipedia.org/wiki/Resource_contention) which has devastating effects on performance.
- `node-sqlite3` exposes low-level (C language) memory management functions. `better-sqlite3` does it the JavaScript way, allowing the garbage collector to worry about memory management.
- `better-sqlite3` is simpler to use, and it provides nice utilities for some operations that are very difficult or impossible in `node-sqlite3`.
- `better-sqlite3` is much faster than `node-sqlite3` in most cases, and just as fast in all other cases.

#### When is this library not appropriate?

In most cases, if you're attempting something that cannot be reasonably accomplished with `better-sqlite3`, it probably cannot be reasonably accomplished with SQLite in general. For example, if you're executing queries that take one second to complete, and you expect to have many concurrent users executing those queries, no amount of asynchronicity will save you from SQLite's serialized nature. Fortunately, SQLite is very *very* fast. With proper indexing, we've been able to achieve upward of 2000 queries per second with 5-way-joins in a 60 GB database, where each query was handling 5–50 kilobytes of real data.

If you have a performance problem, the most likely causes are inefficient queries, improper indexing, or a lack of [WAL mode](./docs/performance.md)—not `better-sqlite3` itself. However, there are some cases where `better-sqlite3` could be inappropriate:

- If you expect a high volume of concurrent reads each returning many megabytes of data (i.e., videos)
- If you expect a high volume of concurrent writes (i.e., a social media site)
- If your database's size is near the terabyte range

For these situations, you should probably use a full-fledged RDBMS such as [PostgreSQL](https://www.postgresql.org/).

## Upgrading

Upgrading your `better-sqlite3-multiple-ciphers` dependency can potentially introduce breaking changes, either in the `better-sqlite3-multiple-ciphers` API (if you upgrade to a new [major version](https://semver.org/)), or between your existing database(s) and the underlying version of SQLite. Before upgrading, review:

* [`better-sqlite3-multiple-ciphers` release notes](https://github.com/m4heshd/better-sqlite3-multiple-ciphers/releases)
* [SQLite release history](https://www.sqlite.org/changes.html)

# Documentation

- [API documentation](./docs/api.md)
- [Performance](./docs/performance.md) (also see [benchmark results](./docs/benchmark.md))
- [64-bit integer support](./docs/integer.md)
- [Worker thread support](./docs/threads.md)
- [Unsafe mode (advanced)](./docs/unsafe.md)
- [SQLite compilation (advanced)](./docs/compilation.md)

# License

[MIT](./LICENSE)
