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

