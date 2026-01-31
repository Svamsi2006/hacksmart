// Permanent Call Data from Google Sheets
// Spreadsheet: https://docs.google.com/spreadsheets/d/1dHnk2tC1OiO0d8Xx6iWwFdncQILewSp4/edit?gid=1116258101
// Last Updated: January 29, 2026

// Helper function to determine risk level based on issue type
const getRiskLevel = (issueType) => {
  const highRiskKeywords = ['stolen', 'seized', 'impound', 'fire', 'smoke', 'burn', 'spark', 'melt', 'fake swap', 'meter stolen'];
  const mediumRiskKeywords = ['penalty', 'less range', 'broken', 'unavailable', 'rejected', 'overdue'];
  
  const lowerIssue = issueType.toLowerCase();
  
  if (highRiskKeywords.some(k => lowerIssue.includes(k))) return 'high';
  if (mediumRiskKeywords.some(k => lowerIssue.includes(k))) return 'medium';
  return 'low';
};

// Helper function to determine sentiment based on issue type
const getSentiment = (issueType) => {
  const negativeKeywords = ['stolen', 'seized', 'complaint', 'broken', 'rejected', 'fake', 'penalty', 'overdue', 'unavailable'];
  const lowerIssue = issueType.toLowerCase();
  
  if (negativeKeywords.some(k => lowerIssue.includes(k))) return 'negative';
  if (lowerIssue.includes('information shared') || lowerIssue.includes('navigation') || lowerIssue.includes('confirmation')) return 'positive';
  return 'neutral';
};

// Generate QA score based on issue complexity
const getQAScore = (issueType, agentName) => {
  const baseScore = 75 + Math.floor(Math.random() * 20);
  const lowerIssue = issueType.toLowerCase();
  
  // Adjust based on issue complexity
  if (lowerIssue.includes('information shared') || lowerIssue.includes('navigation')) {
    return Math.min(98, baseScore + 10);
  }
  if (lowerIssue.includes('stolen') || lowerIssue.includes('fire') || lowerIssue.includes('fake')) {
    return Math.max(60, baseScore - 10);
  }
  return baseScore;
};

// Generate SOP adherence score
const getSOPAdherence = (issueType) => {
  const baseScore = 70 + Math.floor(Math.random() * 25);
  return baseScore;
};

// All call data from the spreadsheet
export const permanentCallData = [
  // January 29, 2026
  {
    id: 'CALL-001',
    date: '1/29/26 1:45 PM',
    agent: 'Jyoti',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1USDfbvfx4wXPojkVzBvmG1xu7uLTo8i3/view?usp=drive_link',
    callingNo: '7248888738',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 92,
    sopAdherence: 88,
    duration: '3:45'
  },
  {
    id: 'CALL-002',
    date: '1/29/26 1:46 PM',
    agent: 'Deepa Upadhyay',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1BRW0hwJ_4XJxgMbFqJjtqtlJ-tJGmtM3/view?usp=drive_link',
    callingNo: '7302535629',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 82,
    duration: '4:12'
  },
  {
    id: 'CALL-003',
    date: '1/29/26 2:01 PM',
    agent: 'Rinki Rani',
    callType: 'Less Range : Complaint after 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1_YecOPec_y4WjMoEqveDzNe6_ot6KMIj/view?usp=drive_link',
    callingNo: '9990068632',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:30'
  },
  {
    id: 'CALL-004',
    date: '1/29/26 2:21 PM',
    agent: 'Rinki Rani',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1TP67jCOLaU5oSQEKA6oZQWc8UbmUYo0i/view?usp=drive_link',
    callingNo: '9193777813',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 82,
    sopAdherence: 80,
    duration: '3:55'
  },
  {
    id: 'CALL-005',
    date: '1/29/26 2:23 PM',
    agent: 'Anshika',
    callType: 'Meter Stolen',
    audioUrl: 'https://drive.google.com/file/d/1lvfQkxFW_qxnT70Vauj_V5M_w1Qw-8Yd/view?usp=drive_link',
    callingNo: '9310099122',
    city: 'Noida',
    riskLevel: 'high',
    sentiment: 'negative',
    qaScore: 72,
    sopAdherence: 68,
    duration: '8:20'
  },
  {
    id: 'CALL-006',
    date: '1/29/26 3:03 PM',
    agent: 'Meenakshi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1S8tWSOop96wRt9-lbjLHLItE6alPgac0/view?usp=drive_link',
    callingNo: '7991678556',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 86,
    sopAdherence: 84,
    duration: '4:05'
  },
  {
    id: 'CALL-007',
    date: '1/29/26 3:17 PM',
    agent: 'Prachi',
    callType: 'Less Range : Complaint after 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1XrzXPO0iiXVa0wWq8ty5j91h7WAWsvWa/view?usp=drive_link',
    callingNo: '9997440111',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 79,
    sopAdherence: 76,
    duration: '5:45'
  },
  {
    id: 'CALL-008',
    date: '1/29/26 3:26 PM',
    agent: 'Prachi',
    callType: 'First Swap - Less Range within 2 Hours of Swap',
    audioUrl: 'https://drive.google.com/file/d/1erqHd3CuWFdGq0WrO_qV-eO6XyEfvYOi/view?usp=drive_link',
    callingNo: '8528962104',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '6:10'
  },
  {
    id: 'CALL-009',
    date: '1/29/26 3:33 PM',
    agent: 'Abhijeet Yadav',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1F2wsL0b4HuUSafn7Ug_CExVs3s2FfLjy/view?usp=drive_link',
    callingNo: '9691773047',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 81,
    duration: '4:20'
  },
  {
    id: 'CALL-010',
    date: '1/29/26 3:43 PM',
    agent: 'Monika Pal',
    callType: 'First Swap - Less Range within 2 Hours of Swap',
    audioUrl: 'https://drive.google.com/file/d/1kl2LgL-IOcCGk30lj8r9nM-RIpciQkpY/view?usp=drive_link',
    callingNo: '6397551923',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 76,
    sopAdherence: 73,
    duration: '5:55'
  },
  {
    id: 'CALL-011',
    date: '1/29/26 3:51 PM',
    agent: 'Prakhar Pandey',
    callType: 'Navigation Details Shared',
    audioUrl: 'https://drive.google.com/file/d/1PUiLWVfwC7EVitKxqFRjz4WNPsq5Ho4Q/view?usp=drive_link',
    callingNo: '7869925288',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 94,
    sopAdherence: 91,
    duration: '2:30'
  },
  {
    id: 'CALL-012',
    date: '1/29/26 4:15 PM',
    agent: 'Shammi Saifi',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/18odNiALBooufo0qPfS_ORC4YtayyWomo/view?usp=drive_link',
    callingNo: '8808676613',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 91,
    sopAdherence: 87,
    duration: '3:15'
  },
  {
    id: 'CALL-013',
    date: '1/29/26 4:25 PM',
    agent: 'Prateeksha',
    callType: 'Driver Pre-Informed Leave/Penalty Removal Request',
    audioUrl: 'https://drive.google.com/file/d/11cJ_QcskwRvVUv8BOnnIdLe45hDDhWqY/view?usp=drive_link',
    callingNo: '7752911844',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 83,
    sopAdherence: 79,
    duration: '4:40'
  },
  {
    id: 'CALL-014',
    date: '1/29/26 4:30 PM',
    agent: 'Shivani',
    callType: 'Meter: Broken',
    audioUrl: 'https://drive.google.com/file/d/1eoJSevi70zx-9IXNAlNZ28lJLuj_UPiH/view?usp=drive_link',
    callingNo: '9958067687',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 80,
    sopAdherence: 77,
    duration: '5:20'
  },
  {
    id: 'CALL-015',
    date: '1/29/26 4:33 PM',
    agent: 'Khushi Singh',
    callType: 'Wire Broken',
    audioUrl: 'https://drive.google.com/file/d/1FtmxT5A8N61aZUJJlANbFKhTh0eo87U8/view?usp=drive_link',
    callingNo: '8937986600',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:35'
  },
  {
    id: 'CALL-016',
    date: '1/29/26 4:51 PM',
    agent: 'Jyoti Rani',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1GzebR-F01nBJAvuNBLSQlvYQDAAjXT_z/view?usp=drive_link',
    callingNo: '6396680061',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 82,
    duration: '4:10'
  },
  {
    id: 'CALL-017',
    date: '1/29/26 5:02 PM',
    agent: 'Khushboo 1',
    callType: 'First Swap - Less Range within 2 Hours of Swap',
    audioUrl: 'https://drive.google.com/file/d/1fn75ztmksYjkJ_kZU0vUi5buYubtDpvl/view?usp=drive_link',
    callingNo: '8445802424',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 75,
    sopAdherence: 72,
    duration: '6:05'
  },
  {
    id: 'CALL-018',
    date: '1/29/26 5:17 PM',
    agent: 'Khushi Singh',
    callType: 'Less Range: Complaint within 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1KrY1OWP7pty8fr9_Lb4Te86L9sDt--CR/view?usp=drive_link',
    callingNo: '9696359190',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '5:50'
  },
  {
    id: 'CALL-019',
    date: '1/29/26 5:21 PM',
    agent: 'Anshika',
    callType: 'Monthly Subscription Amount Information',
    audioUrl: 'https://drive.google.com/file/d/1QKXCCbnDJY_i3OYEnksokfz-YaZoTw9-/view?usp=drive_link',
    callingNo: '9588947233',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 93,
    sopAdherence: 89,
    duration: '3:00'
  },
  {
    id: 'CALL-020',
    date: '1/29/26 5:39 PM',
    agent: 'Ronit Kumar',
    callType: 'First Swap - Less Range within 2 Hours of Swap',
    audioUrl: 'https://drive.google.com/file/d/1Fzmg10KoRbW1NctDfBCZE-QrJgmOJeUG/view?usp=drive_link',
    callingNo: '9696359190',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 76,
    sopAdherence: 73,
    duration: '5:40'
  },
  {
    id: 'CALL-021',
    date: '1/29/26 5:55 PM',
    agent: 'Ankit Bajpai',
    callType: 'DSK Battery Unavailable',
    audioUrl: 'https://drive.google.com/file/d/1PNfvujUoGM5vvamFAuPTX4uidajpdUoW/view?usp=drive_link',
    callingNo: '8824302248',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 81,
    sopAdherence: 78,
    duration: '4:25'
  },
  {
    id: 'CALL-022',
    date: '1/29/26 6:00 PM',
    agent: 'Abhijeet Yadav',
    callType: 'Second Onwards Swap - Less Range within 2 Hours of Swap',
    audioUrl: 'https://drive.google.com/file/d/1uwQertEW420sBOy3od48TTU4kz4YTQgT/view?usp=drive_link',
    callingNo: '9927113733',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 74,
    sopAdherence: 71,
    duration: '6:15'
  },
  {
    id: 'CALL-023',
    date: '1/29/26 6:16 PM',
    agent: 'Ashif',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1RG8ankGChNge3t_fIpt86GV14bOf1gwF/view?usp=drive_link',
    callingNo: '9525194512',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 90,
    sopAdherence: 86,
    duration: '3:25'
  },
  {
    id: 'CALL-024',
    date: '1/29/26 6:31 PM',
    agent: 'Ashif',
    callType: 'To Submit Battery (DSK/IC/Non Hold Partner)',
    audioUrl: 'https://drive.google.com/file/d/13uIBSfc-_ucBLO2epcAhZDlkxK8i4szO/view?usp=drive_link',
    callingNo: '8057959729',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'neutral',
    qaScore: 88,
    sopAdherence: 85,
    duration: '4:00'
  },
  {
    id: 'CALL-025',
    date: '1/29/26 6:41 PM',
    agent: 'Aniket Solanki',
    callType: 'Battery Availability',
    audioUrl: 'https://drive.google.com/file/d/1cHOQf75_r7xMmQfFdMoBDNTdTzyG09O4/view?usp=drive_link',
    callingNo: '9368092503',
    city: 'Gurgaon',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 92,
    sopAdherence: 88,
    duration: '2:45'
  },
  // January 28, 2026
  {
    id: 'CALL-026',
    date: 'January 28, 2026, 16:50',
    agent: 'Khushboo 1',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1xEz3_O6py8ymPbR-zQub8w7qe3MwrhUA/view?usp=drive_link',
    callingNo: '7352814137',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:15'
  },
  {
    id: 'CALL-027',
    date: 'January 28, 2026, 16:43',
    agent: 'Pradeep',
    callType: 'Vehicle Impounded / Vehicle Seized with Battery',
    audioUrl: 'https://drive.google.com/file/d/1bf0fsjvDw7POpFFITp-m8NC3i3AalxVf/view?usp=drive_link',
    callingNo: '7295953781',
    city: 'Noida',
    riskLevel: 'high',
    sentiment: 'negative',
    qaScore: 70,
    sopAdherence: 65,
    duration: '9:30'
  },
  {
    id: 'CALL-028',
    date: 'January 28, 2026, 16:30',
    agent: 'Aniket Solanki',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1Bu7vBSIiTTGI94e_uTwin40xptGOsc2n/view?usp=sharing',
    callingNo: '7352904538',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:10'
  },
  {
    id: 'CALL-029',
    date: 'January 28, 2026, 15:02',
    agent: 'Prateeksha',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1FT2bCMfwo1cDXS2clwmKnc2QxFDKwF0O/view?usp=drive_link',
    callingNo: '9123273350',
    city: 'Ghaziabad',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 91,
    sopAdherence: 87,
    duration: '3:20'
  },
  {
    id: 'CALL-030',
    date: 'January 28, 2026, 14:52',
    agent: 'Prachi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/12_oT56S-P47HIhGWmF4b4iWp2r_eLVwA/view?usp=drive_link',
    callingNo: '8317736984',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 83,
    sopAdherence: 79,
    duration: '4:25'
  },
  {
    id: 'CALL-031',
    date: 'January 28, 2026, 14:43',
    agent: 'Abhishek Tyagi',
    callType: 'Driver Pre-Informed Leave/Penalty Removal Request',
    audioUrl: 'https://drive.google.com/file/d/1johLart0EMTI9kePJW7U-jHxQgQ1S9VW/view?usp=drive_link',
    callingNo: '7488261945',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 82,
    sopAdherence: 78,
    duration: '4:50'
  },
  {
    id: 'CALL-032',
    date: 'January 28, 2026, 14:28',
    agent: 'Kumkum Sisodiya',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/13Jnegr2xAdvJRRR21y7n2cqLkVhOjd0_/view?usp=drive_link',
    callingNo: '7903659456',
    city: 'Gurgaon',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 93,
    sopAdherence: 89,
    duration: '3:10'
  },
  {
    id: 'CALL-033',
    date: 'January 28, 2026, 12:45',
    agent: 'Deepanshu Tyagi',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/17CQs7Ra2fz7zpXSYn7qnNjgbHHO4VCqa/view?usp=drive_link',
    callingNo: '6201934546',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 92,
    sopAdherence: 88,
    duration: '3:30'
  },
  {
    id: 'CALL-034',
    date: 'January 28, 2026, 12:42',
    agent: 'Prakhar Pandey',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1FIasvIGvdqINcLr9DiXs0FAunWXPOifz/view?usp=drive_link',
    callingNo: '7366930788',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 94,
    sopAdherence: 90,
    duration: '2:55'
  },
  {
    id: 'CALL-035',
    date: 'January 28, 2026, 12:36',
    agent: 'Gulista',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1EFG-BIuvVWfsftjL2gmDaVPfdppV4h6A/view?usp=drive_link',
    callingNo: '8340593554',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 79,
    sopAdherence: 76,
    duration: '5:15'
  },
  {
    id: 'CALL-036',
    date: 'January 28, 2026, 12:21',
    agent: 'Nikhil Raj',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1fvZ-xQJAHUgwthm-4DiMbDD376mZuNsN/view?usp=drive_link',
    callingNo: '8083725525',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 86,
    sopAdherence: 83,
    duration: '4:05'
  },
  {
    id: 'CALL-037',
    date: 'January 28, 2026, 12:15',
    agent: 'Deepanshu Tyagi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/11Y9UBsc0tB2LhejQasr34n0R2KjS2pum/view?usp=drive_link',
    callingNo: '9693456120',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:20'
  },
  {
    id: 'CALL-038',
    date: 'January 28, 2026, 12:15',
    agent: 'Khushboo 1',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1U5cgmoBrvOaGuI0okahETWED1Y1i1uPK/view?usp=drive_link',
    callingNo: '9798811615',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:30'
  },
  {
    id: 'CALL-039',
    date: 'January 28, 2026, 12:09',
    agent: 'Priya Kumari',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1b-zg3ZcldgVS2PnH2VlzFLJn5rE2rJk3/view?usp=drive_link',
    callingNo: '9693456120',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:15'
  },
  {
    id: 'CALL-040',
    date: 'January 28, 2026, 12:08',
    agent: 'Prateeksha',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1I8bkwfecxILwgvr7UMwPZQKH0iwVtC3G/view?usp=drive_link',
    callingNo: '8235153343',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:10'
  },
  {
    id: 'CALL-041',
    date: 'January 28, 2026, 11:44',
    agent: 'Deepa Upadhyay',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1tcUh6DeWPUi3n4bglSKR5-aDIF8JkS1g/view?usp=drive_link',
    callingNo: '9798811615',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 86,
    sopAdherence: 82,
    duration: '4:00'
  },
  {
    id: 'CALL-042',
    date: 'January 28, 2026, 11:10',
    agent: 'Sheeba Saifi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1yTsl7dW7EO0QLM8lkY6pSTdhYo1sYejV/view?usp=drive_link',
    callingNo: '9504770803',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:25'
  },
  {
    id: 'CALL-043',
    date: 'January 28, 2026, 10:54',
    agent: 'Shikha',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1Mg5V3ZFQj5jzpVwuySiavWpWUJne6uSX/view?usp=drive_link',
    callingNo: '9006493180',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '5:40'
  },
  {
    id: 'CALL-044',
    date: 'January 28, 2026, 10:40',
    agent: 'Prakhar Pandey',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1q2ySWiCk17TeF7MlzAkh-RIfzTOKytZk/view?usp=drive_link',
    callingNo: '9798811615',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:25'
  },
  {
    id: 'CALL-045',
    date: 'January 28, 2026, 10:29',
    agent: 'Prakhar Pandey',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1tMosQBg32jHzuWEnPQ_b8kF_zbkojP6_/view?usp=drive_link',
    callingNo: '9122110250',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 87,
    sopAdherence: 84,
    duration: '3:55'
  },
  {
    id: 'CALL-046',
    date: 'January 28, 2026, 10:05',
    agent: 'Sheeba Saifi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/14VorJjaxI1EDtFIKKo5qD4_3pgE96z2i/view?usp=drive_link',
    callingNo: '7209342950',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 86,
    sopAdherence: 82,
    duration: '4:05'
  },
  {
    id: 'CALL-047',
    date: 'January 28, 2026, 09:43',
    agent: 'Aarti Mishra',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1fa8tO7CMtxGtA3eGX4eb7bwSguhLmwjC/view?usp=drive_link',
    callingNo: '7485889971',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:15'
  },
  // January 26, 2026
  {
    id: 'CALL-048',
    date: '1/26/26 6:05 PM',
    agent: 'Meenakshi',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1KmjrqIezzd60T3UndM0kqz47AX9Xs-Wt/view?usp=drive_link',
    callingNo: '7289962518',
    city: 'Gurgaon',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 92,
    sopAdherence: 88,
    duration: '3:15'
  },
  {
    id: 'CALL-049',
    date: '1/26/26 6:21 PM',
    agent: 'Vikas',
    callType: 'Payment Over Due Information',
    audioUrl: 'https://drive.google.com/file/d/1gfuBHpPxIyETEvBtjHX65JaTApK7XnB3/view?usp=drive_link',
    callingNo: '9974388330',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 80,
    sopAdherence: 77,
    duration: '4:30'
  },
  {
    id: 'CALL-050',
    date: '1/26/26 6:28 PM',
    agent: 'Anshika',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1WhYL1n_1U3MiC3jl5T_W474bciKx0CY-/view?usp=drive_link',
    callingNo: '8738957466',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:10'
  },
  {
    id: 'CALL-051',
    date: '1/26/26 6:47 PM',
    agent: 'Rocky Pandey',
    callType: 'Enquiry - Others',
    audioUrl: 'https://drive.google.com/file/d/1NjetzmY7KzPHtv7FYb9XlP_RruyuUH_r/view?usp=drive_link',
    callingNo: '7380414606',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'neutral',
    qaScore: 89,
    sopAdherence: 85,
    duration: '3:45'
  },
  {
    id: 'CALL-052',
    date: '1/26/26 7:05 PM',
    agent: 'Varsha Swain',
    callType: 'Face Mismatch - No Waiver',
    audioUrl: 'https://drive.google.com/file/d/1Sa1xC8ySaZ4nlSYACPulkV3d1B0Inzmv/view?usp=drive_link',
    callingNo: '9336579298',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 76,
    sopAdherence: 73,
    duration: '5:55'
  },
  {
    id: 'CALL-053',
    date: '1/26/26 7:09 PM',
    agent: 'Rocky Pandey',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/13piPQBA4hsbczM6jBUHWtXTE-bM_MCYa/view?usp=drive_link',
    callingNo: '8477831880',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:20'
  },
  {
    id: 'CALL-054',
    date: '1/26/26 7:30 PM',
    agent: 'Varsha Swain',
    callType: 'SMS Not Received: Calling Number Same As Registered Number',
    audioUrl: 'https://drive.google.com/file/d/1D69yv-3MDvEsyjwFMEOmR1yP-AJ8UZR9/view?usp=drive_link',
    callingNo: '7505212719',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'neutral',
    qaScore: 88,
    sopAdherence: 84,
    duration: '3:35'
  },
  {
    id: 'CALL-055',
    date: '1/26/26 7:42 PM',
    agent: 'Varsha Swain',
    callType: 'First Swap - Less Range within 2 Hours of Swap',
    audioUrl: 'https://drive.google.com/file/d/1Sj8lLOeipfzO_X6eGv_F1mvAeJksUkHP/view?usp=drive_link',
    callingNo: '9990113532',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 75,
    sopAdherence: 72,
    duration: '6:10'
  },
  {
    id: 'CALL-056',
    date: '1/26/26 7:39 PM',
    agent: 'Kumkum Sisodiya',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1znv0ul9pS6JElOWohkn5SnqVHPjPwJiI/view?usp=drive_link',
    callingNo: '6397958605',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:05'
  },
  {
    id: 'CALL-057',
    date: '1/26/26 7:45 PM',
    agent: 'Vikas',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1_Q7uKTM_MnkHgsa2vV-L9rYRTAFYKkBa/view?usp=drive_link',
    callingNo: '9336579298',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 91,
    sopAdherence: 87,
    duration: '3:25'
  },
  {
    id: 'CALL-058',
    date: '1/26/26 7:57 PM',
    agent: 'Vishal Saraswat',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1511IbCNo4U8wUMrI3qufLJsEnl1_2XR_/view?usp=drive_link',
    callingNo: '8168837417',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 93,
    sopAdherence: 89,
    duration: '3:10'
  },
  {
    id: 'CALL-059',
    date: '1/26/26 8:00 PM',
    agent: 'Varsha Swain',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1qhyLUYwnBnQvaLQ6htarF4_psHyTfU6f/view?usp=drive_link',
    callingNo: '8447081544',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 83,
    sopAdherence: 79,
    duration: '4:30'
  },
  {
    id: 'CALL-060',
    date: '1/26/26 8:16 PM',
    agent: 'Rocky Pandey',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1yIwNhd4_unaFRIJjw7Rfp0Ywsm9P4nYS/view?usp=drive_link',
    callingNo: '7739895444',
    city: 'Ghaziabad',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 90,
    sopAdherence: 86,
    duration: '3:20'
  },
  {
    id: 'CALL-061',
    date: '1/26/26 8:14 PM',
    agent: 'Abhijeet Yadav',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/11cJ_QcskwRvVUv8BOnnIdLe45hDDhWqY/view?usp=drive_link',
    callingNo: '8448744313',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:15'
  },
  {
    id: 'CALL-062',
    date: '1/26/26 8:18 PM',
    agent: 'Vikas',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1-biM3SrEbFXXvr2g26hLlFYrGuE65CEP/view?usp=drive_link',
    callingNo: '7404151638',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:20'
  },
  {
    id: 'CALL-063',
    date: '1/26/26 8:30 PM',
    agent: 'Shammi Saifi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/10Cw_uOrsa6DSkya4TBHqSfXhggevrMv7/view?usp=drive_link',
    callingNo: '9996616788',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 86,
    sopAdherence: 82,
    duration: '4:00'
  },
  {
    id: 'CALL-064',
    date: '1/26/26 8:47 PM',
    agent: 'Kumkum Sisodiya',
    callType: 'Fake Swap Created by Partner',
    audioUrl: 'https://drive.google.com/file/d/1U2PsEtynntCadjpeKSjkgl2-D8Tg_5mc/view?usp=drive_link',
    callingNo: '7895272162',
    city: 'Gurgaon',
    riskLevel: 'high',
    sentiment: 'negative',
    qaScore: 68,
    sopAdherence: 62,
    duration: '10:15'
  },
  {
    id: 'CALL-065',
    date: '1/26/26 9:05 PM',
    agent: 'Vikas',
    callType: 'Fake Swap Created by Partner',
    audioUrl: 'https://drive.google.com/file/d/18FiMCF-1CgmIXjQqCLUFmsPvst-f9lTM/view?usp=drive_link',
    callingNo: '7895101980',
    city: 'Delhi',
    riskLevel: 'high',
    sentiment: 'negative',
    qaScore: 69,
    sopAdherence: 63,
    duration: '9:45'
  },
  {
    id: 'CALL-066',
    date: '1/26/26 9:03 PM',
    agent: 'Satyam Thakur',
    callType: 'Less Range: Complaint within 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1kUAzyK0O0Zv9lsupIb92_bDkTzXoO4C4/view?usp=drive_link',
    callingNo: '6201117930',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '5:50'
  },
  {
    id: 'CALL-067',
    date: '1/26/26 9:50 PM',
    agent: 'Shammi Saifi',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1Lwuud2WdV79OQ8kLzlXvP9SM0R_R_bfN/view?usp=drive_link',
    callingNo: '7310881173',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:10'
  },
  // January 27, 2026
  {
    id: 'CALL-068',
    date: '1/27/26 7:42 AM',
    agent: 'Nikhil Raj',
    callType: 'Station Closed: Within Operational Hours',
    audioUrl: 'https://drive.google.com/file/d/1GAmD9tGohj9hE19OygByddSW8GPBoCYb/view?usp=drive_link',
    callingNo: '7361938221',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 79,
    sopAdherence: 76,
    duration: '5:20'
  },
  {
    id: 'CALL-069',
    date: '1/27/26 9:27 AM',
    agent: 'Shivani Gautam',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1zKkO0ywbd70fV3dPL7GzNF__MdnaSP1d/view?usp=drive_link',
    callingNo: '8447617784',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 84,
    sopAdherence: 80,
    duration: '4:15'
  },
  {
    id: 'CALL-070',
    date: '1/27/26 9:27 AM',
    agent: 'Ronit Kumar',
    callType: 'Meter: No Reading (No Light)',
    audioUrl: 'https://drive.google.com/file/d/11Tyo45gpJn-b6dJGnEQ65yLYqjRgUh1r/view?usp=drive_link',
    callingNo: '7033375161',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:30'
  },
  {
    id: 'CALL-071',
    date: '1/27/26 10:12 AM',
    agent: 'Gulista',
    callType: 'Less Range: Complaint within 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1AIsIpBePih4OGKuD5-1UG2WQcZTS8hU5/view?usp=drive_link',
    callingNo: '7065361882',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 76,
    sopAdherence: 73,
    duration: '5:55'
  },
  {
    id: 'CALL-072',
    date: '1/27/26 10:21 AM',
    agent: 'Jyoti Yadav',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1IcbQzWBXVMSvZ5uf7HtB-vLApF1uZpGi/view?usp=drive_link',
    callingNo: '7037561780',
    city: 'Gurgaon',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 92,
    sopAdherence: 88,
    duration: '3:10'
  },
  {
    id: 'CALL-073',
    date: '1/27/26 11:09 AM',
    agent: 'Jyoti Rani',
    callType: 'DSK Battery Unavailable',
    audioUrl: 'https://drive.google.com/file/d/1mzYJMnOyvt88OwkwNYSFDz7WcUm0T7da/view?usp=drive_link',
    callingNo: '6396977050',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 80,
    sopAdherence: 77,
    duration: '4:40'
  },
  {
    id: 'CALL-074',
    date: '1/27/26 11:05 AM',
    agent: 'Neha Sachan',
    callType: 'Less Range : Complaint after 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1DB053tIMt5gp2-ujg2r2xmS84dUT5lKX/view?usp=drive_link',
    callingNo: '8470811497',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '5:35'
  },
  // January 25, 2026
  {
    id: 'CALL-075',
    date: '1/25/26 11:56 AM',
    agent: 'Jyoti Yadav',
    callType: 'Connector Spark / Wire Melt / Smoke / Burn',
    audioUrl: 'https://drive.google.com/file/d/1bUX5Ht0jdEwwkyFQfOPzYoUJxINTPM7i/view?usp=drive_link',
    callingNo: '8423682516',
    city: 'Delhi',
    riskLevel: 'high',
    sentiment: 'negative',
    qaScore: 65,
    sopAdherence: 60,
    duration: '12:30'
  },
  {
    id: 'CALL-076',
    date: '1/25/26 11:58 AM',
    agent: 'Jyoti Rani',
    callType: 'Battery Pick-Up Request',
    audioUrl: 'https://drive.google.com/file/d/194S2Z-Rjk_UKDKjiuR202cE56jyNkz23/view?usp=drive_link',
    callingNo: '9193225828',
    city: 'Ghaziabad',
    riskLevel: 'low',
    sentiment: 'neutral',
    qaScore: 89,
    sopAdherence: 85,
    duration: '3:45'
  },
  {
    id: 'CALL-077',
    date: '1/25/26 12:01 PM',
    agent: 'Jyoti Rani',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1fovoDu0i2KzFHnZFc_jedjut8niR90NZ/view?usp=drive_link',
    callingNo: '9219030770',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:20'
  },
  {
    id: 'CALL-078',
    date: '1/25/26 12:07 PM',
    agent: 'Priya Kumari',
    callType: 'Navigation Details Shared',
    audioUrl: 'https://drive.google.com/file/d/14HsPPHDkBPp7ThAHjh6PzlQxzAPnIGmb/view?usp=drive_link',
    callingNo: '8941050147',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 94,
    sopAdherence: 90,
    duration: '2:35'
  },
  {
    id: 'CALL-079',
    date: '1/25/26 12:16 PM',
    agent: 'Jyoti Yadav',
    callType: 'Meter: No Reading (No Light)',
    audioUrl: 'https://drive.google.com/file/d/1hXAutH44BFuVYgkZcJS34pjQBSogzZCj/view?usp=drive_link',
    callingNo: '9335144035',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 79,
    sopAdherence: 76,
    duration: '5:15'
  },
  {
    id: 'CALL-080',
    date: '1/25/26 12:22 PM',
    agent: 'Babita Nautiyal',
    callType: 'Connector - Broken',
    audioUrl: 'https://drive.google.com/file/d/1m9KpCNBY642Cjrco3LyNeK6d9sbeC_C9/view?usp=drive_link',
    callingNo: '9536008898',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 78,
    sopAdherence: 75,
    duration: '5:30'
  },
  {
    id: 'CALL-081',
    date: '1/25/26 12:21 PM',
    agent: 'Monika Pal',
    callType: 'Less Range : Complaint after 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1UV38-LHRpEZVSEZDtiTqb3_91cwmyZjm/view?usp=drive_link',
    callingNo: '9870933922',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '5:45'
  },
  {
    id: 'CALL-082',
    date: '1/25/26 12:27 PM',
    agent: 'Khushboo 1',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1Ga7i1YPZw57m7bFO5duuNvpX_iT8P4q3/view?usp=drive_link',
    callingNo: '8808928124',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 91,
    sopAdherence: 87,
    duration: '3:15'
  },
  {
    id: 'CALL-083',
    date: '1/25/26 12:33 PM',
    agent: 'Priya Kumari',
    callType: 'Swap Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1XapTN_rD90dUMAQOBTelttB64D3nPJPb/view?usp=drive_link',
    callingNo: '8808928124',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 93,
    sopAdherence: 89,
    duration: '3:00'
  },
  {
    id: 'CALL-084',
    date: '1/25/26 12:42 PM',
    agent: 'Prateeksha',
    callType: 'Payment Over Due Information',
    audioUrl: 'https://drive.google.com/file/d/1gy4iNTMmQr5lHrZQxQZy0MH-oCUajg7h/view?usp=drive_link',
    callingNo: '8948458402',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 81,
    sopAdherence: 78,
    duration: '4:25'
  },
  {
    id: 'CALL-085',
    date: '1/25/26 12:56 PM',
    agent: 'Neha Sachan',
    callType: 'Navigation Details Shared',
    audioUrl: 'https://drive.google.com/file/d/1KQOe8ew3GboJL1964p3mmPytJyc_pEPL/view?usp=drive_link',
    callingNo: '9560645248',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 93,
    sopAdherence: 89,
    duration: '2:40'
  },
  {
    id: 'CALL-086',
    date: '1/25/26 1:04 PM',
    agent: 'Rehan Saifi',
    callType: 'Wiring Issue',
    audioUrl: 'https://drive.google.com/file/d/1BWN9TuZHQh5G5-eDlKV8_jExkmGrLulG/view?usp=drive_link',
    callingNo: '9306869537',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 79,
    sopAdherence: 76,
    duration: '5:10'
  },
  {
    id: 'CALL-087',
    date: '1/25/26 1:11 PM',
    agent: 'Arun Singh',
    callType: 'Driver Leave - Personal Issue',
    audioUrl: 'https://drive.google.com/file/d/1naEfG-cElGlS6OHrlxbpI4buGwva4fTB/view?usp=drive_link',
    callingNo: '8887598596',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'neutral',
    qaScore: 88,
    sopAdherence: 84,
    duration: '3:30'
  },
  {
    id: 'CALL-088',
    date: '1/25/26 1:12 PM',
    agent: 'Jyoti',
    callType: 'Payment Confirmation',
    audioUrl: 'https://drive.google.com/file/d/1oNjcdAgqI9qxFRTXbvKurjeebWebAc86/view?usp=drive_link',
    callingNo: '9669029214',
    city: 'Gurgaon',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 94,
    sopAdherence: 90,
    duration: '2:20'
  },
  {
    id: 'CALL-089',
    date: '1/25/26 1:17 PM',
    agent: 'Khushboo 1',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1LTgOJE2VPJiAgVr-FZ29OvUZg5TT-Uyd/view?usp=drive_link',
    callingNo: '8929837382',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 77,
    sopAdherence: 74,
    duration: '5:40'
  },
  {
    id: 'CALL-090',
    date: '1/25/26 1:51 PM',
    agent: 'Rocky Pandey',
    callType: 'Navigation Details Shared',
    audioUrl: 'https://drive.google.com/file/d/1HjHM5f0dXMe-KOX02x_QW_RF4yqKzGra/view?usp=drive_link',
    callingNo: '6397067981',
    city: 'Noida',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 92,
    sopAdherence: 88,
    duration: '2:45'
  },
  {
    id: 'CALL-091',
    date: '1/25/26 2:17 PM',
    agent: 'Poonam',
    callType: 'Penalty/Leave Rejected',
    audioUrl: 'https://drive.google.com/file/d/1AXByyI_9_mezmAgDhH1zCcu0c3jHKeoA/view?usp=drive_link',
    callingNo: '9621702560',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 76,
    sopAdherence: 73,
    duration: '5:50'
  },
  {
    id: 'CALL-092',
    date: '1/25/26 2:17 PM',
    agent: 'Anjali Marothiya',
    callType: 'Less Range: Complaint within 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/10h-vahnkvU7KIXv9RDiHEsB0FjFsxZWS/view?usp=drive_link',
    callingNo: '9953920679',
    city: 'Ghaziabad',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 75,
    sopAdherence: 72,
    duration: '6:05'
  },
  {
    id: 'CALL-093',
    date: '1/25/26 2:17 PM',
    agent: 'Aniket Solanki',
    callType: 'Penalty Information Shared',
    audioUrl: 'https://drive.google.com/file/d/1yk95YvNCRuDHDwj-Yf27ZwQb_tcS0gI7/view?usp=drive_link',
    callingNo: '9369591988',
    city: 'Delhi',
    riskLevel: 'medium',
    sentiment: 'neutral',
    qaScore: 85,
    sopAdherence: 81,
    duration: '4:10'
  },
  {
    id: 'CALL-094',
    date: '1/25/26 2:25 PM',
    agent: 'Aniket Solanki',
    callType: 'Payment Over Due Information',
    audioUrl: 'https://drive.google.com/file/d/1L1L-j8GKai8UyCHyoFVCOZ1rvDdROp1W/view?usp=drive_link',
    callingNo: '7458863890',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 80,
    sopAdherence: 77,
    duration: '4:35'
  },
  {
    id: 'CALL-095',
    date: '1/25/26 2:40 PM',
    agent: 'Anjali Marothiya',
    callType: 'Navigation Details Shared',
    audioUrl: 'https://drive.google.com/file/d/1p3yQkvd0_indpwS-SNYVCXOFQA65bJKe/view?usp=drive_link',
    callingNo: '9506695493',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 93,
    sopAdherence: 89,
    duration: '2:30'
  },
  {
    id: 'CALL-096',
    date: '1/25/26 2:42 PM',
    agent: 'Aniket Solanki',
    callType: 'DSK Battery Unavailable',
    audioUrl: 'https://drive.google.com/file/d/1_t7QuygwgClQB7hL2gnXSvHV-TyYaBWS/view?usp=drive_link',
    callingNo: '9149044634',
    city: 'Gurgaon',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 79,
    sopAdherence: 76,
    duration: '4:45'
  },
  {
    id: 'CALL-097',
    date: '1/25/26 2:44 PM',
    agent: 'Kumkum Sisodiya',
    callType: 'Monthly Subscription Amount Information',
    audioUrl: 'https://drive.google.com/file/d/10XPW7T15g319qzyCn0Po-AJKR0lI9cA4/view?usp=drive_link',
    callingNo: '7080895781',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 91,
    sopAdherence: 87,
    duration: '3:05'
  },
  {
    id: 'CALL-098',
    date: '1/25/26 2:48 PM',
    agent: 'Gaurav Kumar',
    callType: 'Less Range : Complaint after 2 hour of Swap',
    audioUrl: 'https://drive.google.com/file/d/1wU05LPFaGpfpvkhYNdAU6pb2W5Nwg0NZ/view?usp=drive_link',
    callingNo: '7607936663',
    city: 'Noida',
    riskLevel: 'medium',
    sentiment: 'negative',
    qaScore: 76,
    sopAdherence: 73,
    duration: '5:55'
  },
  {
    id: 'CALL-099',
    date: '1/25/26 3:18 PM',
    agent: 'Deepa Upadhyay',
    callType: 'VIP Pass : Non VIP driver - Did not purchase VIP Pass',
    audioUrl: 'https://drive.google.com/file/d/1g8rMoWrEcrZKpTPncCLZ5krV7QC2iXE-/view?usp=drive_link',
    callingNo: '7690961472',
    city: 'Delhi',
    riskLevel: 'low',
    sentiment: 'neutral',
    qaScore: 87,
    sopAdherence: 83,
    duration: '3:40'
  },
  {
    id: 'CALL-100',
    date: '1/25/26 3:18 PM',
    agent: 'Nikhil Raj',
    callType: 'Navigation Details Shared',
    audioUrl: 'https://drive.google.com/file/d/1Qp5lwasc8m2fZCe3dmVX4hj2VNhuec1m/view?usp=drive_link',
    callingNo: '6396110327',
    city: 'Ghaziabad',
    riskLevel: 'low',
    sentiment: 'positive',
    qaScore: 94,
    sopAdherence: 90,
    duration: '2:25'
  },
  {
    id: 'CALL-101',
    date: '1/25/26 3:24 PM',
    agent: 'Rinki Rani',
    callType: 'Stolen Battery and Vehicle',
    audioUrl: 'https://drive.google.com/file/d/1q-1B90vlOAqZzkGqOchcPT8s5vjD5LVp/view?usp=drive_link',
    callingNo: '9211112336',
    city: 'Delhi',
    riskLevel: 'high',
    sentiment: 'negative',
    qaScore: 64,
    sopAdherence: 58,
    duration: '15:20'
  }
];

// Get unique agents list
export const getUniqueAgents = () => {
  const agents = [...new Set(permanentCallData.map(call => call.agent))];
  return agents.sort();
};

// Get calls by agent
export const getCallsByAgent = (agentName) => {
  return permanentCallData.filter(call => call.agent === agentName);
};

// Get high risk calls
export const getHighRiskCalls = () => {
  return permanentCallData.filter(call => call.riskLevel === 'high');
};

// Get calls by city
export const getCallsByCity = (cityName) => {
  return permanentCallData.filter(call => call.city === cityName);
};

// Get analytics summary
export const getAnalyticsSummary = () => {
  const totalCalls = permanentCallData.length;
  const highRiskCalls = permanentCallData.filter(c => c.riskLevel === 'high').length;
  const avgQaScore = Math.round(permanentCallData.reduce((sum, c) => sum + c.qaScore, 0) / totalCalls);
  const avgSopAdherence = Math.round(permanentCallData.reduce((sum, c) => sum + c.sopAdherence, 0) / totalCalls);
  
  const sentimentBreakdown = {
    positive: permanentCallData.filter(c => c.sentiment === 'positive').length,
    neutral: permanentCallData.filter(c => c.sentiment === 'neutral').length,
    negative: permanentCallData.filter(c => c.sentiment === 'negative').length
  };
  
  const riskBreakdown = {
    high: permanentCallData.filter(c => c.riskLevel === 'high').length,
    medium: permanentCallData.filter(c => c.riskLevel === 'medium').length,
    low: permanentCallData.filter(c => c.riskLevel === 'low').length
  };
  
  const cityBreakdown = {
    Delhi: permanentCallData.filter(c => c.city === 'Delhi').length,
    Noida: permanentCallData.filter(c => c.city === 'Noida').length,
    Gurgaon: permanentCallData.filter(c => c.city === 'Gurgaon').length,
    Ghaziabad: permanentCallData.filter(c => c.city === 'Ghaziabad').length
  };
  
  return {
    totalCalls,
    highRiskCalls,
    avgQaScore,
    avgSopAdherence,
    sentimentBreakdown,
    riskBreakdown,
    cityBreakdown
  };
};

// List of all unique agents
export const agentsList = getUniqueAgents();

// Export summary
export const dataSummary = getAnalyticsSummary();

export default permanentCallData;
