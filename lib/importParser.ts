import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedTrip {
  trip_id: string;
  client_name: string;
  travel_agency?: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;
  destination_country: string;
  destination_city?: string;
  adults: number;
  children: number;
  total_travelers: number;
  flight_cost: number; // in cents
  hotel_cost: number; // in cents
  ground_transport: number; // in cents
  activities_tours: number; // in cents
  meals_cost: number; // in cents
  insurance_cost: number; // in cents
  other_costs: number; // in cents
  currency?: string;
  commission_rate?: number;
  commission_amount?: number; // in cents
  client_id?: string;
  client_type?: 'individual' | 'corporate' | 'group';
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ParseResult {
  success: boolean;
  trips: ParsedTrip[];
  errors: ParseError[];
  totalRows: number;
  validRows: number;
}

// Convert dollar amount to cents (integer)
function dollarsToCents(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : Number(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

// Parse date string to YYYY-MM-DD format
function parseDate(dateStr: any): string | null {
  if (!dateStr) return null;

  const str = String(dateStr).trim();

  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Try MM/DD/YYYY format
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // Try parsing as Date object (Excel serial dates)
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

// Validate a single trip row
function validateTrip(row: any, rowIndex: number): { trip: ParsedTrip | null; errors: ParseError[] } {
  const errors: ParseError[] = [];

  // Required fields
  if (!row.Trip_ID || String(row.Trip_ID).trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'Trip_ID',
      message: 'Trip_ID is required',
      value: row.Trip_ID
    });
  }

  if (!row.Client_Name || String(row.Client_Name).trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'Client_Name',
      message: 'Client_Name is required',
      value: row.Client_Name
    });
  }

  if (!row.Destination_Country || String(row.Destination_Country).trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'Destination_Country',
      message: 'Destination_Country is required',
      value: row.Destination_Country
    });
  }

  // Parse dates
  const startDate = parseDate(row.Start_Date);
  if (!startDate) {
    errors.push({
      row: rowIndex,
      field: 'Start_Date',
      message: 'Invalid or missing Start_Date (use YYYY-MM-DD or MM/DD/YYYY)',
      value: row.Start_Date
    });
  }

  const endDate = parseDate(row.End_Date);
  if (!endDate) {
    errors.push({
      row: rowIndex,
      field: 'End_Date',
      message: 'Invalid or missing End_Date (use YYYY-MM-DD or MM/DD/YYYY)',
      value: row.End_Date
    });
  }

  // Validate date order
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push({
      row: rowIndex,
      field: 'End_Date',
      message: 'End_Date must be after Start_Date',
      value: `${startDate} -> ${endDate}`
    });
  }

  // Parse traveler counts
  const adults = parseInt(String(row.Adults || '0'));
  const children = parseInt(String(row.Children || '0'));
  const totalTravelers = parseInt(String(row.Total_Travelers || '0'));

  if (isNaN(adults) || adults < 0) {
    errors.push({
      row: rowIndex,
      field: 'Adults',
      message: 'Adults must be a valid non-negative number',
      value: row.Adults
    });
  }

  if (isNaN(children) || children < 0) {
    errors.push({
      row: rowIndex,
      field: 'Children',
      message: 'Children must be a valid non-negative number',
      value: row.Children
    });
  }

  if (isNaN(totalTravelers) || totalTravelers < 1) {
    errors.push({
      row: rowIndex,
      field: 'Total_Travelers',
      message: 'Total_Travelers must be at least 1',
      value: row.Total_Travelers
    });
  }

  // Validate client_type if provided
  if (row.Client_Type && !['individual', 'corporate', 'group'].includes(String(row.Client_Type).toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'Client_Type',
      message: 'Client_Type must be one of: individual, corporate, group',
      value: row.Client_Type
    });
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return { trip: null, errors };
  }

  // Build the parsed trip object
  const trip: ParsedTrip = {
    trip_id: String(row.Trip_ID).trim(),
    client_name: String(row.Client_Name).trim(),
    travel_agency: row.Travel_Agency ? String(row.Travel_Agency).trim() : undefined,
    start_date: startDate!,
    end_date: endDate!,
    destination_country: String(row.Destination_Country).trim(),
    destination_city: row.Destination_City ? String(row.Destination_City).trim() : undefined,
    adults,
    children,
    total_travelers: totalTravelers,
    flight_cost: dollarsToCents(row.Flight_Cost),
    hotel_cost: dollarsToCents(row.Hotel_Cost),
    ground_transport: dollarsToCents(row.Ground_Transport),
    activities_tours: dollarsToCents(row.Activities_Tours),
    meals_cost: dollarsToCents(row.Meals_Cost),
    insurance_cost: dollarsToCents(row.Insurance_Cost),
    other_costs: dollarsToCents(row.Other_Costs),
    currency: row.Currency ? String(row.Currency).trim() : 'USD',
    commission_rate: row.Commission_Rate ? parseFloat(String(row.Commission_Rate)) : undefined,
    commission_amount: row.Commission_Amount ? dollarsToCents(row.Commission_Amount) : undefined,
    client_id: row.Client_ID ? String(row.Client_ID).trim() : undefined,
    client_type: row.Client_Type ? String(row.Client_Type).toLowerCase() as any : undefined,
  };

  return { trip, errors: [] };
}

// Parse CSV file
export async function parseCSV(fileContent: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize headers to match our field names
        return header.trim().replace(/\s+/g, '_');
      },
      complete: (results) => {
        const trips: ParsedTrip[] = [];
        const errors: ParseError[] = [];
        const seenTripIds = new Set<string>();

        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because: +1 for 1-based indexing, +1 for header row

          const { trip, errors: rowErrors } = validateTrip(row, rowNumber);

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          } else if (trip) {
            // Check for duplicate Trip_ID within the file
            if (seenTripIds.has(trip.trip_id)) {
              errors.push({
                row: rowNumber,
                field: 'Trip_ID',
                message: `Duplicate Trip_ID "${trip.trip_id}" found in file`,
                value: trip.trip_id
              });
            } else {
              seenTripIds.add(trip.trip_id);
              trips.push(trip);
            }
          }
        });

        resolve({
          success: errors.length === 0,
          trips,
          errors,
          totalRows: results.data.length,
          validRows: trips.length
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          trips: [],
          errors: [{
            row: 0,
            field: 'file',
            message: `CSV parsing error: ${error.message}`
          }],
          totalRows: 0,
          validRows: 0
        });
      }
    });
  });
}

// Parse Excel file
export async function parseExcel(fileBuffer: Buffer): Promise<ParseResult> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return {
        success: false,
        trips: [],
        errors: [{
          row: 0,
          field: 'file',
          message: 'No sheets found in Excel file'
        }],
        totalRows: 0,
        validRows: 0
      };
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const trips: ParsedTrip[] = [];
    const errors: ParseError[] = [];
    const seenTripIds = new Set<string>();

    jsonData.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 because: +1 for 1-based indexing, +1 for header row

      // Normalize column names (Excel might have spaces)
      const normalizedRow: any = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.trim().replace(/\s+/g, '_');
        normalizedRow[normalizedKey] = row[key];
      });

      const { trip, errors: rowErrors } = validateTrip(normalizedRow, rowNumber);

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else if (trip) {
        // Check for duplicate Trip_ID within the file
        if (seenTripIds.has(trip.trip_id)) {
          errors.push({
            row: rowNumber,
            field: 'Trip_ID',
            message: `Duplicate Trip_ID "${trip.trip_id}" found in file`,
            value: trip.trip_id
          });
        } else {
          seenTripIds.add(trip.trip_id);
          trips.push(trip);
        }
      }
    });

    return {
      success: errors.length === 0,
      trips,
      errors,
      totalRows: jsonData.length,
      validRows: trips.length
    };
  } catch (error: any) {
    return {
      success: false,
      trips: [],
      errors: [{
        row: 0,
        field: 'file',
        message: `Excel parsing error: ${error.message}`
      }],
      totalRows: 0,
      validRows: 0
    };
  }
}

// Main parser function that handles both CSV and Excel
export async function parseImportFile(
  file: File | Buffer,
  fileType: string
): Promise<ParseResult> {
  try {
    if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
      // Handle CSV
      let content: string;
      if (file instanceof Buffer) {
        content = file.toString('utf-8');
      } else if (file instanceof File) {
        content = await file.text();
      } else {
        throw new Error('Invalid file type');
      }
      return await parseCSV(content);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel'
    ) {
      // Handle Excel
      let buffer: Buffer;
      if (file instanceof Buffer) {
        buffer = file;
      } else if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error('Invalid file type');
      }
      return await parseExcel(buffer);
    } else {
      return {
        success: false,
        trips: [],
        errors: [{
          row: 0,
          field: 'file',
          message: `Unsupported file type: ${fileType}`
        }],
        totalRows: 0,
        validRows: 0
      };
    }
  } catch (error: any) {
    return {
      success: false,
      trips: [],
      errors: [{
        row: 0,
        field: 'file',
        message: `File parsing error: ${error.message}`
      }],
      totalRows: 0,
      validRows: 0
    };
  }
}
