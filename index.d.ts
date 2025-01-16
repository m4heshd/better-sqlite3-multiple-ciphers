// Type definitions for better-sqlite3-multiple-ciphers 11.8.0
// Project: https://github.com/m4heshd/better-sqlite3-multiple-ciphers
// Definitions by: Ben Davies <https://github.com/Morfent>
//                 Mathew Rumsey <https://github.com/matrumz>
//                 Santiago Aguilar <https://github.com/sant123>
//                 Alessandro Vergani <https://github.com/loghorn>
//                 Andrew Kaiser <https://github.com/andykais>
//                 Mark Stewart <https://github.com/mrkstwrt>
//                 Florian Stamer <https://github.com/stamerf>
//                 Mahesh Bandara Wijerathna <https://github.com/m4heshd>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.8

/// <reference types="node" />

// FIXME: Is this `any` really necessary?
type VariableArgFunction = (...params: any[]) => unknown;
type ArgumentTypes<F extends VariableArgFunction> = F extends (...args: infer A) => unknown ? A : never;
type ElementOf<T> = T extends Array<infer E> ? E : T;

declare namespace BetterSqlite3MultipleCiphers {
    interface Statement<BindParameters extends unknown[], Result = unknown> {
        database: Database;
        source: string;
        reader: boolean;
        readonly: boolean;
        busy: boolean;

        run(...params: BindParameters): Database.RunResult;
        get(...params: BindParameters): Result | undefined;
        all(...params: BindParameters): Result[];
        iterate(...params: BindParameters): IterableIterator<Result>;
        pluck(toggleState?: boolean): this;
        expand(toggleState?: boolean): this;
        raw(toggleState?: boolean): this;
        bind(...params: BindParameters): this;
        columns(): ColumnDefinition[];
        safeIntegers(toggleState?: boolean): this;
    }

    interface ColumnDefinition {
        name: string;
        column: string | null;
        table: string | null;
        database: string | null;
        type: string | null;
    }

    interface Transaction<F extends VariableArgFunction> {
        (...params: ArgumentTypes<F>): ReturnType<F>;
        default(...params: ArgumentTypes<F>): ReturnType<F>;
        deferred(...params: ArgumentTypes<F>): ReturnType<F>;
        immediate(...params: ArgumentTypes<F>): ReturnType<F>;
        exclusive(...params: ArgumentTypes<F>): ReturnType<F>;
    }

    interface VirtualTableOptions {
        rows: (...params: unknown[]) => Generator;
        columns: string[];
        parameters?: string[] | undefined;
        safeIntegers?: boolean | undefined;
        directOnly?: boolean | undefined;
    }

    interface Database {
        memory: boolean;
        readonly: boolean;
        name: string;
        open: boolean;
        inTransaction: boolean;

        prepare<BindParameters extends unknown[] | {} = unknown[], Result = unknown>(
            source: string,
        ): BindParameters extends unknown[] ? Statement<BindParameters, Result> : Statement<[BindParameters], Result>;
        transaction<F extends VariableArgFunction>(fn: F): Transaction<F>;
        exec(source: string): this;
        key(key: Buffer): number;
        rekey(key: Buffer): number;
        pragma(source: string, options?: Database.PragmaOptions): unknown;
        function(name: string, cb: (...params: unknown[]) => unknown): this;
        function(name: string, options: Database.RegistrationOptions, cb: (...params: unknown[]) => unknown): this;
        aggregate<T>(
            name: string,
            options: Database.RegistrationOptions & {
                start?: T | (() => T);
                // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
                step: (total: T, next: ElementOf<T>) => T | void;
                inverse?: ((total: T, dropped: T) => T) | undefined;
                result?: ((total: T) => unknown) | undefined;
            },
        ): this;
        loadExtension(path: string): this;
        close(): this;
        defaultSafeIntegers(toggleState?: boolean): this;
        backup(destinationFile: string, options?: Database.BackupOptions): Promise<Database.BackupMetadata>;
        table(name: string, options: VirtualTableOptions): this;
        unsafeMode(unsafe?: boolean): this;
        serialize(options?: Database.SerializeOptions): Buffer;
    }

    interface DatabaseConstructor {
        new(filename?: string | Buffer, options?: Database.Options): Database;
        (filename?: string, options?: Database.Options): Database;
        prototype: Database;
        SqliteError: SqliteErrorType;
    }
}

declare class SqliteErrorClass extends Error {
    name: string;
    message: string;
    code: string;
    constructor(message: string, code: string);
}

type SqliteErrorType = typeof SqliteErrorClass;

declare namespace Database {
    interface RunResult {
        changes: number;
        lastInsertRowid: number | bigint;
    }

    interface Options {
        readonly?: boolean | undefined;
        fileMustExist?: boolean | undefined;
        timeout?: number | undefined;
        verbose?: ((message?: unknown, ...additionalArgs: unknown[]) => void) | undefined;
        nativeBinding?: string | undefined;
    }

    interface SerializeOptions {
        attached?: string;
    }

    interface PragmaOptions {
        simple?: boolean | undefined;
    }

    interface RegistrationOptions {
        varargs?: boolean | undefined;
        deterministic?: boolean | undefined;
        safeIntegers?: boolean | undefined;
        directOnly?: boolean | undefined;
    }

    type AggregateOptions = Parameters<BetterSqlite3MultipleCiphers.Database["aggregate"]>[1];

    interface BackupMetadata {
        totalPages: number;
        remainingPages: number;
    }
    interface BackupOptions {
        progress: (info: BackupMetadata) => number;
    }

    type SqliteError = SqliteErrorType;
    type Statement<BindParameters extends unknown[] | {} = unknown[], Result = unknown> = BindParameters extends unknown[] ?
        BetterSqlite3MultipleCiphers.Statement<BindParameters, Result> :
        BetterSqlite3MultipleCiphers.Statement<[BindParameters], Result>;
    type Transaction<T extends VariableArgFunction = VariableArgFunction> = BetterSqlite3MultipleCiphers.Transaction<T>;
    type Database = BetterSqlite3MultipleCiphers.Database;
}

declare const Database: BetterSqlite3MultipleCiphers.DatabaseConstructor;
export = Database;
