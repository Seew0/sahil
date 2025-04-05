const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function submitForm(formType, data) {
  const sheetId = {
    'form1': process.env.FORM1_SHEET_ID,
    'form2': process.env.FORM2_SHEET_ID,
    'form3': process.env.FORM3_SHEET_ID
  }[formType];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A2:Z',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          new Date().toISOString(),
          data.drafterEmail,
          data.field1 || '',
          data.field2 || '',
          data.field3 || '',
          'Pending' // Initial status
        ]]
      }
    });
    return true;
  } catch (err) {
    console.error(`Error submitting ${formType}:`, err);
    return false;
  }
}

async function getFormSubmissions(formType) {
  const sheetId = {
    'form1': process.env.FORM1_SHEET_ID,
    'form2': process.env.FORM2_SHEET_ID,
    'form3': process.env.FORM3_SHEET_ID
  }[formType];

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A2:F',
    });
    return response.data.values || [];
  } catch (err) {
    console.error(`Error getting ${formType} submissions:`, err);
    return [];
  }
}

async function updateSubmission(formType, rowIndex, updates) {
  const sheetId = {
    'form1': process.env.FORM1_SHEET_ID,
    'form2': process.env.FORM2_SHEET_ID,
    'form3': process.env.FORM3_SHEET_ID
  }[formType];

  try {
    // Update status and fields
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `A${rowIndex}:F${rowIndex}`,
            values: [[
              updates.timestamp || new Date().toISOString(),
              updates.drafterEmail,
              updates.field1,
              updates.field2,
              updates.field3,
              updates.status || 'Pending'
            ]]
          }
        ]
      }
    });
    return true;
  } catch (err) {
    console.error(`Error updating ${formType} submission:`, err);
    return false;
  }
}

module.exports = { submitForm, getFormSubmissions, updateSubmission };