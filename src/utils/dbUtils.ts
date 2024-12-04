import { formatDateForPostgres, validateDateRange } from "./datetime";

// Helper function to map key-value pairs and cast values to the appropriate SQL format.
export function mapKeyToSQL(key: string, value: any): string {
    // Handle different data types based on the key and value
    switch (typeof value) {
        case 'number':
        if (Number.isInteger(value)) {
            return `${key}::integer AS ${key}`; // Cast to integer
        } else {
            return `${key}::float AS ${key}`; // Cast to float (for decimals)
        }
    
        //case 'string':
        //return `${key}::text AS ${key}`; // Cast to text for strings
    
        // case 'boolean':
        // return `${key}::boolean AS ${key}`; // Cast to boolean
    
        // case 'object':
        // if (value instanceof Date) {
        //     return `${key}::timestamp AS ${key}`; // Cast to timestamp for Date
        // }
        // return `${key} AS ${key}`; // Default for any other object type
    
        default:
        return `${key}`; // Default case, fallback for any unknown type
    }
}

// Function to parse string to the appropriate numeric type
export function parseNumericValues(value: any, type: 'int' | 'float'): any {
    if (typeof value === 'string') {
      const parsedValue = type === 'int' ? parseInt(value, 10) : parseFloat(value);
      return isNaN(parsedValue) ? null : parsedValue;
    }
    return value;
}

export function dateRangeCondition(
    startDate: string | undefined,
    endDate: string | undefined,
    columnName: string
  ): string | undefined {

    if (!startDate || !endDate) return undefined;

    // Ensure that startDate and endDate are valid Date objects or strings
    if (!startDate) {
      throw new Error('Invalid start date');
    }
    if (!endDate) {
      throw new Error('Invalid end date');
    }
  
    // Validate the date range
    if (!validateDateRange(startDate, endDate)) {
      throw new Error('Start date and end date are incorrect.');
    }

    // Convert string dates to Date objects if they are passed as strings
    const startStr = formatDateForPostgres(startDate);
    const endStr = formatDateForPostgres(endDate);
  
    // Return the WHERE condition part of SQL query
    return `${columnName} BETWEEN '${startStr}' AND '${endStr}'`;
}

export function simpleCondition(condition : any, columnName: string) : string | undefined {
    if (condition == undefined) return undefined;

    return `${columnName} = ${typeof condition === "string" ? `'${condition}'` : condition}`
}

export function likeCondition(condition: string | undefined, columnName: string): string | undefined {
  if (condition === undefined) return undefined;

  // Escape single quotes in the condition to avoid SQL injection
  const sanitizedCondition = condition.replace(/'/g, "''");

  return `${columnName} LIKE '%${sanitizedCondition}%'`;
}