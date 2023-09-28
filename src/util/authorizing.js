const path = require('path');
const process = require('process');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = path.join(__dirname, "../../token.json")
async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: TOKEN_PATH, //the key file
    //url to spreadsheets API
    scopes: SCOPES
  });
  const authClientObject = await auth.getClient();
  return authClientObject
}

module.exports = { authorize }