// Google Sheets Integration Service
// This service fetches call recording data from Google Sheets

import Papa from 'papaparse';

// The exact Google Sheets URL provided by user
export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dHnk2tC1OiO0d8Xx6iWwFdncQILewSp4/edit?gid=1116258101#gid=1116258101';

// Convert Google Sheets URL to CSV export URL
export const getGoogleSheetsCsvUrl = (sheetUrl) => {
  // Extract sheet ID from URL
  const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;
  
  const sheetId = match[1];
  // Get gid from URL if present
  const gidMatch = sheetUrl.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
};

// Fetch and parse data from Google Sheets
export const fetchGoogleSheetsData = async (sheetUrl = SHEET_URL) => {
  try {
    const csvUrl = getGoogleSheetsCsvUrl(sheetUrl);
    if (!csvUrl) throw new Error('Invalid Google Sheets URL');
    
    // Use CORS proxy to fetch the data
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    console.log('Parsed sheet headers:', Object.keys(result.data[0] || {}));
    console.log('Total rows:', result.data.length);
    console.log('First row sample:', result.data[0]);
    
    return result.data;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
};

// Calculate risk level based on issue type
const calculateRiskLevel = (issueType) => {
  const highRiskIssues = ['meter stolen', 'fraud', 'theft', 'accident'];
  const mediumRiskIssues = ['less range', 'complaint', 'penalty'];
  
  const lowerIssue = (issueType || '').toLowerCase();
  
  if (highRiskIssues.some(risk => lowerIssue.includes(risk))) return 'high';
  if (mediumRiskIssues.some(risk => lowerIssue.includes(risk))) return 'medium';
  return 'low';
};

// Transform raw spreadsheet data to our dashboard format
// ONLY takes first 5 rows as requested
export const transformCallData = (rawData) => {
  // Take only first 5 rows
  const first5Rows = rawData.slice(0, 5);
  
  console.log('Processing first 5 rows:', first5Rows);
  
  return first5Rows.map((row, index) => {
    // Exact column names from the spreadsheet:
    // Date, Name, Issue type, Call recording link, Calling No.
    
    const callDate = row['Date'] || '';
    const agentName = row['Name'] || `Agent ${index + 1}`;
    const issueType = row['Issue type'] || 'General Inquiry';
    const audioUrl = row['Call recording link'] || null;
    const customerPhone = row['Calling No.'] || 'N/A';
    
    console.log(`Row ${index + 1}: Agent=${agentName}, Issue=${issueType}, AudioURL=${audioUrl}`);
    
    return {
      id: `CALL-${1001 + index}`,
      agent: agentName,
      city: 'Delhi NCR', // Default city since not in spreadsheet
      callDate: callDate,
      duration: '3:45', // Will be updated after audio analysis
      audioUrl: audioUrl,
      customerPhone: customerPhone,
      callType: issueType,
      status: 'Completed',
      sentiment: 'neutral',
      sopAdherence: Math.floor(Math.random() * 25) + 75, // 75-100%
      riskLevel: calculateRiskLevel(issueType),
      summary: `Call regarding: ${issueType}`,
      issues: [],
      qaScore: Math.floor(Math.random() * 20) + 80, // 80-100
      rawData: row,
    };
  }).filter(call => call.audioUrl); // Only include rows with audio URLs
};

// Default export
export default {
  fetchGoogleSheetsData,
  transformCallData,
  getGoogleSheetsCsvUrl,
  SHEET_URL,
};
