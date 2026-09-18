import ExcelJS from 'exceljs';

/**
 * Generates a professionally styled Excel attendance report
 * @param {Object} options
 * @param {string} options.activityTitle
 * @param {string} options.activityDate
 * @param {string} options.category
 * @param {string} options.venue
 * @param {Array} options.attendees
 * @returns {Promise<ExcelJS.Workbook>}
 */
export const generateAttendanceExcel = async ({
  activityTitle,
  activityDate,
  category = 'General',
  venue = 'Main Auditorium',
  attendees = []
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'College Club Attendance Management System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Attendance Report', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
  });

  // Enable grid lines
  worksheet.views = [{ showGridLines: true }];

  // 1. Institution / Title Banner
  worksheet.mergeCells('A1:H1');
  const titleRow = worksheet.getCell('A1');
  titleRow.value = 'COLLEGE CLUB ACTIVITY & ATTENDANCE MANAGEMENT SYSTEM';
  titleRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' } // Deep Navy Blue
  };
  worksheet.getRow(1).height = 36;

  // 2. Activity Details Sub-banner
  worksheet.mergeCells('A2:H2');
  const subRow = worksheet.getCell('A2');
  subRow.value = `OFFICIAL ATTENDANCE REPORT: ${activityTitle.toUpperCase()}`;
  subRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1E293B' } };
  subRow.alignment = { horizontal: 'center', vertical: 'middle' };
  subRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' } // Light slate gray
  };
  worksheet.getRow(2).height = 24;

  // 3. Metadata Block
  worksheet.mergeCells('A3:D3');
  worksheet.getCell('A3').value = `Category: ${category}  |  Venue: ${venue}`;
  worksheet.getCell('A3').font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  worksheet.getCell('A3').alignment = { vertical: 'middle' };

  worksheet.mergeCells('E3:H3');
  worksheet.getCell('E3').value = `Event Date: ${activityDate}  |  Report Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  worksheet.getCell('E3').font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  worksheet.getCell('E3').alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getRow(3).height = 20;

  // Blank row
  worksheet.getRow(4).height = 8;

  // 4. Table Header Row (Row 5)
  const headers = [
    { header: 'Student ID', key: 'studentId', width: 16 },
    { header: 'Student Name', key: 'studentName', width: 26 },
    { header: 'Branch', key: 'branch', width: 28 },
    { header: 'Section', key: 'section', width: 12 },
    { header: 'Year / Semester', key: 'yearSem', width: 20 },
    { header: 'Activity Name', key: 'activityName', width: 28 },
    { header: 'Activity Date', key: 'activityDate', width: 16 },
    { header: 'Attendance Status', key: 'status', width: 18 }
  ];

  const headerRow = worksheet.getRow(5);
  headerRow.values = headers.map(h => h.header);
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' } // Primary Blue
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
      left: { style: 'thin', color: { argb: 'FF1D4ED8' } },
      bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1D4ED8' } }
    };
  });

  // 5. Data Rows
  let currentRowIndex = 6;
  attendees.forEach((att, index) => {
    const row = worksheet.getRow(currentRowIndex);
    row.values = [
      att.studentId || 'N/A',
      att.studentName || 'N/A',
      att.branch || 'N/A',
      att.section || 'N/A',
      att.yearSem || (att.year && att.semester ? `${att.year} / ${att.semester}` : 'N/A'),
      att.activityName || activityTitle,
      att.activityDate || activityDate,
      att.attendanceStatus || 'Present'
    ];
    row.height = 22;

    const isZebra = index % 2 === 1;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isZebra ? 'FFF8FAFC' : 'FFFFFFFF' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alignment rules
      if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber === 7) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 8) {
        // Attendance status column: styled badge
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (cell.value === 'Present') {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF15803D' } }; // Green
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDCFCE7' } // Light green pill background
          };
        } else {
          cell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };
        }
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });

    currentRowIndex++;
  });

  // If no attendees
  if (attendees.length === 0) {
    const emptyRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:H${currentRowIndex}`);
    const emptyCell = worksheet.getCell(`A${currentRowIndex}`);
    emptyCell.value = 'No verified attendees found for this activity yet.';
    emptyCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF64748B' } };
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.height = 28;
    currentRowIndex++;
  }

  // 6. Summary Footer
  const summaryRow = worksheet.getRow(currentRowIndex);
  worksheet.mergeCells(`A${currentRowIndex}:G${currentRowIndex}`);
  const summaryLabel = worksheet.getCell(`A${currentRowIndex}`);
  summaryLabel.value = `Total Verified Present: ${attendees.length} student(s)`;
  summaryLabel.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  summaryLabel.alignment = { horizontal: 'right', vertical: 'middle' };
  summaryLabel.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }
  };

  const summaryVal = worksheet.getCell(`H${currentRowIndex}`);
  summaryVal.value = attendees.length;
  summaryVal.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF166534' } };
  summaryVal.alignment = { horizontal: 'center', vertical: 'middle' };
  summaryVal.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDCFCE7' }
  };
  summaryRow.height = 24;

  // Set explicit column widths
  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = h.width;
  });

  return workbook;
};
