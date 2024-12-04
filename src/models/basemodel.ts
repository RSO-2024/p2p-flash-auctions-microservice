import "reflect-metadata";

const QUERYABLE_METADATA_KEY = Symbol("queryable");

export function IsQueryable(): PropertyDecorator {
  return (target, propertyKey) => {
    // Store queryable metadata for the property
    Reflect.defineMetadata(QUERYABLE_METADATA_KEY, true, target, propertyKey);
  };
}

// Utility function to check if a property is queryable
export function isQueryable(target: Object, propertyKey: string): boolean {
  return Reflect.getMetadata(QUERYABLE_METADATA_KEY, target, propertyKey) === true;
}

const DATAFIELD_METADATA_KEY = Symbol("datafield");

export function IsDataField(): PropertyDecorator {
  return (target, propertyKey) => {
    // Store queryable metadata for the property
    Reflect.defineMetadata(DATAFIELD_METADATA_KEY, true, target, propertyKey);
  };
}

// Utility function to check if a property is queryable
export function isDataField(target: Object, propertyKey: string): boolean {
  return Reflect.getMetadata(DATAFIELD_METADATA_KEY, target, propertyKey) === true;
}

const NOT_UPDATABLE_METADATA_KEY = Symbol("not_updatable");

export function IsNotUpdatable(): PropertyDecorator {
  return (target, propertyKey) => {
    // Store queryable metadata for the property
    Reflect.defineMetadata(NOT_UPDATABLE_METADATA_KEY, true, target, propertyKey);
  };
}

// Utility function to check if a property is queryable
export function isNotUpdatable(target: Object, propertyKey: string): boolean {
  return Reflect.getMetadata(NOT_UPDATABLE_METADATA_KEY, target, propertyKey) === true;
}

export abstract class BaseModel {

  /**
   * Prepare data from client for PostgresSQL database
   */
  abstract prepareData() : void

  /**
   * Parse data from PostgresSQL to client for easier interpretation
   */
  abstract parseData() : void

  /**
   * Prepare query data conditions.
   */
  abstract prepareQueryData(query_data : any) : void

  /**
   * Generate SQL-safe string for values
   * */ 
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

  static getQueryableFields<T extends BaseModel>(instance: T): string[] {
    const keys = Object.keys(instance);
    return keys.filter((key) => isQueryable(instance, key));
  }

  static getDataFieldEntries<T extends BaseModel>(instance: T, updatable : boolean) {
    const keys = Object.entries(instance);
    return keys.filter(([key, value]) => {
      // Include the field if it's a valid data field (checked by isDataField)
      // If `updatable` is false, also ensure the field is updatable by checking `isNotUpdatable`
      if (isDataField(instance, key)) {
          if (updatable) {
              return !isNotUpdatable(instance, key) && value;
          }
          return value;
      }
      return false;
  });
  }

  static getQueryableEntries<T extends BaseModel>(instance: T) {
    const keys = Object.entries(instance);
    return keys.filter(([key, value]) => isQueryable(instance, key) && value);
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

  static toReadSQL<T extends BaseModel>(tableName: string, datamodel : T): string {

    const queryableFields = BaseModel.getQueryableEntries(datamodel);

    if (queryableFields.length == 0) throw Error("No suitable queries were provided.")

    const conditions = queryableFields.map(([_, value]) => value).join(" AND ");

    // TODO: Select fields

    return `SELECT * FROM ${tableName} WHERE ${conditions};`;
  }

  // Generate SQL for UPDATE operation
  static toUpdateSQL<T extends BaseModel>(
    tableName: string,
    dataModel : T
  ): string {

    const dataAssignments = BaseModel.getDataFieldEntries(dataModel, true)
      .map(([key, value]) => `${key} = ${typeof value === "string" ? `'${value}'` : value}`)
      .join(", ");

    if (dataAssignments.length == 0) throw Error("No suitable data fields were provided.")

    const queryableFields = BaseModel.getQueryableEntries(dataModel);

    if (queryableFields.length == 0) throw Error("No suitable conditions were provided.")

    const conditions = queryableFields.map(([_, value]) => value).join(" AND ");

    // TODO: This also sets the user_id and other fields which are in conditions, should probably be separate

    return `UPDATE ${tableName} SET ${dataAssignments} WHERE ${conditions} RETURNING *;`;
  }

   // Generate SQL for DELETE operation
   static toDeleteSQL<T extends BaseModel>(tableName: string, datamodel: T, includeOnlyFields: string[] = []): string {
    const queryableFields = BaseModel.getQueryableEntries(datamodel).filter(([key, value]) => {
      // Include only fields that are in the includeOnlyFields array (if provided)
      return (includeOnlyFields.length === 0 || includeOnlyFields.includes(key));
    });

    if (queryableFields.length == 0) throw Error("No suitable conditions were provided.")

    const conditions = queryableFields.map(([_, value]) => value).join(" AND ");

    return `DELETE FROM ${tableName} WHERE ${conditions} RETURNING *;`;
  }
}
