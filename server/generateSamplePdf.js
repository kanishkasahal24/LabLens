const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generateSamplePDF(filePath, data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header
    doc.fillColor('#0F6E6E').fontSize(22).font('Helvetica-Bold').text(data.labName, { align: 'left' });
    doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('Certified Diagnostic & Clinical Pathology Services', { align: 'left' });
    doc.moveDown(0.5);

    // Divider line
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Patient & Test Metadata Box
    const metaTop = doc.y;
    doc.fillColor('#1A1A1A').fontSize(10).font('Helvetica-Bold');
    doc.text(`Patient Name: ${data.patientName}`, 40, metaTop);
    doc.font('Helvetica').text(`Age / Gender: ${data.patientAge} Y / ${data.patientSex}`, 40, metaTop + 16);
    doc.text(`Referred By: Dr. Sarah Jenkins, MD`, 40, metaTop + 32);

    doc.font('Helvetica-Bold').text(`Collection Date: ${data.collectionDate}`, 320, metaTop);
    doc.font('Helvetica').text(`Report Test Date: ${data.testDate}`, 320, metaTop + 16);
    doc.text(`Specimen Type: ${data.sampleType}`, 320, metaTop + 32);

    doc.y = metaTop + 55;
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1.5);

    // Table Header
    doc.fillColor('#0F6E6E').fontSize(14).font('Helvetica-Bold').text('Comprehensive Diagnostic Report', 40, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.rect(40, tableTop, 515, 22).fill('#F1F5F9');
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
    doc.text('TEST BIOMARKER', 50, tableTop + 6);
    doc.text('RESULT', 240, tableTop + 6);
    doc.text('UNIT', 330, tableTop + 6);
    doc.text('REFERENCE INTERVAL', 410, tableTop + 6);

    let currentY = tableTop + 24;

    data.parameters.forEach((item, index) => {
      // Alternating row background
      if (index % 2 === 1) {
        doc.rect(40, currentY, 515, 20).fill('#F8FAFC');
      }

      doc.fillColor('#1A1A1A').fontSize(9).font('Helvetica');
      doc.text(item.name, 50, currentY + 5);

      // Result
      doc.font('Helvetica-Bold');
      doc.text(String(item.value), 240, currentY + 5);

      // Unit
      doc.font('Helvetica').fillColor('#64748B');
      doc.text(item.unit || '-', 330, currentY + 5);

      // Range
      doc.text(item.range || '-', 410, currentY + 5);

      currentY += 20;
    });

    doc.y = currentY + 20;

    // Notes
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);
    doc.fillColor('#64748B').fontSize(8).font('Helvetica');
    doc.text('Clinical Notes: 12-hour overnight fasting confirmed prior to blood draw.', 40, doc.y);
    doc.moveDown(0.5);
    doc.text('*** End of Laboratory Report ***', { align: 'center' });

    doc.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}

const sampleReportData = {
  labName: 'Quest Diagnostics Labs',
  patientName: 'John Doe',
  patientAge: '40',
  patientSex: 'Male',
  collectionDate: '15-Oct-2026',
  testDate: '15-Oct-2026',
  sampleType: 'Venous Blood',
  parameters: [
    { name: 'Hemoglobin', value: 14.5, unit: 'g/dL', range: '13.5 - 17.5' },
    { name: 'Fasting Blood Sugar', value: 104, unit: 'mg/dL', range: '70 - 99' },
    { name: 'Total Cholesterol', value: 218, unit: 'mg/dL', range: '125 - 200' },
    { name: 'Triglycerides', value: 165, unit: 'mg/dL', range: '40 - 150' },
    { name: 'HDL Cholesterol', value: 48, unit: 'mg/dL', range: '40 - 60' },
    { name: 'LDL Cholesterol', value: 137, unit: 'mg/dL', range: '50 - 100' },
    { name: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', range: '0.7 - 1.3' },
    { name: 'WBC Count', value: 6.8, unit: 'x10^3/uL', range: '4.5 - 11.0' },
    { name: 'Platelet Count', value: 245, unit: 'x10^3/uL', range: '150 - 450' },
    { name: 'Thyroid Stimulating Hormone (TSH)', value: 2.4, unit: 'uIU/mL', range: '0.4 - 4.0' },
    { name: 'Serum Calcium', value: 9.4, unit: 'mg/dL', range: '8.5 - 10.2' }
  ]
};

// Generate sample report in client/public and root
const clientPublicDir = path.join(__dirname, '..', 'client', 'public');
if (!fs.existsSync(clientPublicDir)) {
  fs.mkdirSync(clientPublicDir, { recursive: true });
}

const samplePdfPath = path.join(clientPublicDir, 'sample_blood_report.pdf');
const desktopSamplePdfPath = path.join(__dirname, '..', 'sample_blood_report.pdf');

Promise.all([
  generateSamplePDF(samplePdfPath, sampleReportData),
  generateSamplePDF(desktopSamplePdfPath, sampleReportData)
]).then(() => {
  console.log('Sample reports successfully generated:');
  console.log('1. Client Public:', samplePdfPath);
  console.log('2. Project Root:', desktopSamplePdfPath);
}).catch(console.error);
