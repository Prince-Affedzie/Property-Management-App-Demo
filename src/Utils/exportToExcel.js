import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Helper function to handle nested fields like 'tenant.name'
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
}


function formatDateIfNeeded(value) {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date)) return value; // If not a valid date, return as is
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

export default function exportToExcel(data, fileName, fields) {
  const preparedData = data.map(item => {
    const formattedItem = {};
    fields.forEach(field => {
        let value = getNestedValue(item, field.key);

        if (Array.isArray(value)) {
            value = value.join(', ');
          }

        if (typeof (value) === Date) {
            value = formatDateIfNeeded(value);
          }
      formattedItem[field.label] = value;
    });
    return formattedItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(preparedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, `${fileName}.xlsx`);
}
