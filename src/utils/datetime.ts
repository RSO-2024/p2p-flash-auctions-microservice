import moment from 'moment';

export const formatDateForPostgres = (inputDate: string | null | undefined): string | undefined => {

    if (!inputDate) return undefined;

    // Parse the input date using the specified format
    const parsedDate = moment(inputDate, 'DD/MM/YYYY', true);

    // Check if the date is valid
    if (!parsedDate.isValid()) {
        return undefined;
    }

    // Format the date as an ISO 8601 string suitable for PostgreSQL
    return parsedDate.toISOString();
}

export function validateDateRange(startDate: string, endDate: string): boolean {
    // Check if both dates are in the format DD/MM/YYYY
    const format = 'DD/MM/YYYY';
    
    // Parse the dates using moment and check if the format is correct
    const start = moment(startDate, format, true);
    const end = moment(endDate, format, true);
    
    // Validate if both dates are valid and the start date is before the end date
    if (!start.isValid() || !end.isValid()) {
      return false;
    }
    
    if (start.isAfter(end)) {
      return false;
    }

    return true;
}