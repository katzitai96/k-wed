import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Invitee } from '../models/invitee.model';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  async exportToExcel(
    invitees: Invitee[],
    fileName: string = 'wedding-invitees.xlsx'
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invitees');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Number of Guests', key: 'numberOfGuests', width: 15 },
      { header: 'Relation', key: 'relation', width: 15 },
      { header: 'RSVP Status', key: 'rsvpStatus', width: 15 },
      { header: 'Dietary Restrictions', key: 'dietaryRestrictions', width: 25 },
      { header: 'Special Requests', key: 'specialRequests', width: 25 },
      { header: 'Last Contacted', key: 'lastContacted', width: 20 },
      { header: 'Additional Info', key: 'additionalInfo', width: 30 },
    ];

    // Add header row with styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F0FF' }, // Light blue background
    };
    headerRow.border = {
      bottom: { style: 'thin' },
    };

    // Add data rows
    invitees.forEach((invitee) => {
      worksheet.addRow({
        firstName: invitee.firstName,
        lastName: invitee.lastName,
        phoneNumber: invitee.phoneNumber,
        email: invitee.email || '',
        numberOfGuests: invitee.numberOfGuests,
        relation: invitee.relation,
        rsvpStatus: invitee.rsvpStatus,
        dietaryRestrictions: invitee.dietaryRestrictions || '',
        specialRequests: invitee.specialRequests || '',
        lastContacted: invitee.lastContacted
          ? new Date(invitee.lastContacted).toLocaleString()
          : '',
        additionalInfo: invitee.additionalInfo || '',
      });
    });

    // Style every other row with light grey background for better readability
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }, // Light grey background
        };
      }
    });

    // Add summary statistics
    const totalRow = worksheet.addRow([
      'Total Invitees',
      invitees.length,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    totalRow.font = { bold: true };

    // Count by RSVP status
    const confirmed = invitees.filter(
      (i) => i.rsvpStatus === 'confirmed'
    ).length;
    const declined = invitees.filter((i) => i.rsvpStatus === 'declined').length;
    const pending = invitees.filter((i) => i.rsvpStatus === 'pending').length;
    const maybe = invitees.filter((i) => i.rsvpStatus === 'maybe').length;

    worksheet.addRow(['Confirmed', confirmed]);
    worksheet.addRow(['Declined', declined]);
    worksheet.addRow(['Pending', pending]);
    worksheet.addRow(['Maybe', maybe]);

    // Calculate total expected guests
    const totalGuests = invitees
      .filter((i) => i.rsvpStatus === 'confirmed' || i.rsvpStatus === 'maybe')
      .reduce((sum, invitee) => sum + invitee.numberOfGuests, 0);

    worksheet.addRow(['Total Expected Guests', totalGuests]);

    // Generate and save the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, fileName);
  }
}
