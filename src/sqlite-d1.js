function plain(row) {
  return row ? { ...row } : null;
}

class D1Statement {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...params) {
    return new D1Statement(this.db, this.sql, params);
  }

  async first() {
    return plain(this.db.prepare(this.sql).get(...this.params));
  }

  async all() {
    const rows = this.db.prepare(this.sql).all(...this.params) || [];
    return { results: rows.map((row) => ({ ...row })) };
  }

  async run() {
    const info = this.db.prepare(this.sql).run(...this.params);
    return {
      success: true,
      meta: {
        changes: info?.changes ?? 0,
        last_row_id: info?.lastInsertRowid ?? 0,
      },
    };
  }
}

export function createD1(db) {
  return {
    prepare(sql) {
      return new D1Statement(db, sql);
    },
    async exec(sql) {
      db.exec(sql);
      return { count: 1 };
    },
    async batch(statements) {
      const results = [];
      db.exec("BEGIN");
      try {
        for (const statement of statements) {
          results.push(await statement.run());
        }
        db.exec("COMMIT");
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
      return results;
    },
  };
}
