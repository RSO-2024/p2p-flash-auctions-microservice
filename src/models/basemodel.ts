export class BaseModel {

  // Generate SQL-safe string for values
  private toSQLValues(): string[] {
    return Object.values(this).map((value) => {
      if (value === undefined || value === null) {
        return 'NULL';
      } else if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
      } else if (value instanceof Date) {
        return `'${value.toISOString()}'`;
      } else {
        return value.toString();
      }
    });
  }

  // Generate SQL-safe string for column keys
  private toSQLKeys(): string[] {
    return Object.keys(this).map((key) => `${key}`);
  }

  // Generate SQL INSERT statement
  toCreateSQL(tableName: string): string {
    const columns = this.toSQLKeys().join(', ');
    const values = this.toSQLValues().join(', ');

    return `INSERT INTO ${tableName} (${columns}) VALUES (${values}) RETURNING *;`;
  }

  toReadSQL(tableName: string, datamodel : any): string {

    const keys = Object.keys(datamodel);
    const values = Object.values(datamodel);

    // TODO: Remove user id from this

    const conditions = Object.entries(datamodel)
    .map(([key, value]) => `${key} = ${typeof value === "string" ? `'${value}'` : value}`)
    .join(" AND ");

    return `SELECT * FROM ${tableName} WHERE ${conditions};`;
  }

  // Generate SQL for UPDATE operation
  toUpdateSQL(
    tableName: string,
    dataModel : any,
    filterModel : any
  ): string {
    const dataKeys = Object.keys(dataModel);
    const dataValues = Object.values(dataModel);
    const filterKeys = Object.keys(filterModel);
    const filterValues = Object.values(filterModel);

    const dataAssignments = dataKeys
      .map((key, index) => `${key} = ${typeof dataValues[index] === "string" ? `'${dataValues[index]}'` : dataValues[index]}`)
      .join(", ");

    const filterConditions = filterKeys
      .map((key, index) => `${key} = ${typeof filterValues[index] === "string" ? `'${filterValues[index]}'` : filterValues[index]}`)
      .join(" AND ");

    return `UPDATE ${tableName} SET ${dataAssignments} WHERE ${filterConditions} RETURNING *;`;
  }

   // Generate SQL for DELETE operation
   toDeleteSQL(tableName: string, filters: any): string {
    const conditions = Object.entries(filters)
      .map(([key, value]) => `${key} = ${typeof value === "string" ? `'${value}'` : value}`)
      .join(" AND ");

    return `DELETE FROM ${tableName} WHERE ${conditions} RETURNING *;`;
  }
}
