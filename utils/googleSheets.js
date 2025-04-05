const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

async function getUserByEmail(email) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
            range: 'Sheet1!A2:C', // Assuming headers are in row 1
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return null;
        }

        return rows.find(row => row[0] === email); // Email is in column A
    } catch (err) {
        console.error('Error accessing Google Sheets:', err);
        return null;
    }
}


// New functions for admin management
async function getAllUsers() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
            range: 'Sheet1!A2:C',
        });

        return response.data.values || [];
    } catch (err) {
        console.error('Error getting users:', err);
        return [];
    }
}

async function addUser(email, password, role) {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
            range: 'Sheet1!A2:C',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[email, password, role]]
            }
        });
        return true;
    } catch (err) {
        console.error('Error adding user:', err);
        return false;
    }
}

async function updateUser(email, newData) {
    try {
        const users = await getAllUsers();
        const rowIndex = users.findIndex(user => user[0] === email);

        if (rowIndex === -1) return false;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
            range: `Sheet1!A${rowIndex + 2}:C${rowIndex + 2}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[newData.email || email, newData.password, newData.role]]
            }
        });
        return true;
    } catch (err) {
        console.error('Error updating user:', err);
        return false;
    }
}

async function deleteUser(email) {
    try {
        const users = await getAllUsers();
        const rowIndex = users.findIndex(user => user[0] === email);

        if (rowIndex === -1) return false;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0, // Assuming Sheet1 is the first sheet
                            dimension: "ROWS",
                            startIndex: rowIndex + 1, // +1 because header row
                            endIndex: rowIndex + 2
                        }
                    }
                }]
            }
        });
        return true;
    } catch (err) {
        console.error('Error deleting user:', err);
        return false;
    }
}

module.exports = {
    getUserByEmail,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser
};
