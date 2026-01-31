# 🔋 Smart-Audit AI - Battery Smart Call Center QA Dashboard

> **Enterprise-Grade AI-Powered Call Quality Monitoring System**
>
> Built for Battery Smart Hackathon | January 2026

![Version](https://img.shields.io/badge/version-1.0.0-teal)
![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-7.x-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-cyan)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Data Sources](#-data-sources)
5. [API Integrations](#-api-integrations)
6. [Project Structure](#-project-structure)
7. [Dashboard Pages](#-dashboard-pages)
8. [SOP Integration](#-sop-integration)
9. [Installation & Setup](#-installation--setup)
10. [Configuration](#-configuration)

---

## 🎯 Project Overview

**Smart-Audit AI** is a comprehensive call center quality assurance dashboard designed specifically for **Battery Smart's** customer support operations. The system provides real-time monitoring, AI-powered analysis, and SOP compliance tracking for call center agents handling battery swap, penalty, and technical support queries.

### Key Objectives

- ✅ Real-time call quality monitoring
- ✅ AI-powered audio transcription and sentiment analysis
- ✅ SOP adherence tracking based on Battery Smart SOP v2.0
- ✅ High-risk call flagging and supervisor alerts
- ✅ Revenue leakage prevention
- ✅ Agent performance coaching

---

## ✨ Features

### 1. **Real-Time Call Monitoring**

- Live call feed with risk level indicators
- Sentiment analysis (Positive/Neutral/Negative)
- QA score calculation
- Risk filtering (High/Medium/Low)

### 2. **AI-Powered Analysis**

- Deepgram API integration for audio transcription
- Automatic sentiment detection
- SOP compliance scoring
- Issue type classification

### 3. **Supervisor Alerts**

- High-risk call notifications
- Escalation matrix based on SOP guidelines
- One-click navigation from dashboard

### 4. **Revenue Leakage Prevention**

- Compensation limit tracking (L1: ₹50, L2: ₹51-500, L3: >₹500)
- SOP-based compensation validation
- Real-time leakage alerts

### 5. **Agent Coaching**

- AI-generated coaching nudges
- Performance tracking per agent
- SOP evaluation checklist scoring

### 6. **City-wise Insights**

- Geographic performance breakdown
- Delhi, Noida, Gurgaon, Ghaziabad coverage
- Regional trend analysis

---

## 🛠 Tech Stack

### Frontend

| Technology    | Version          | Purpose            |
| ------------- | ---------------- | ------------------ |
| React         | 18.x             | UI Framework       |
| Vite          | 7.2.5 (Rolldown) | Build Tool         |
| Tailwind CSS  | 3.4.17           | Styling            |
| Framer Motion | Latest           | Animations         |
| Recharts      | Latest           | Data Visualization |
| Lucide React  | Latest           | Icons              |

### APIs & Services

| Service           | Purpose             |
| ----------------- | ------------------- |
| Deepgram API      | Audio transcription |
| Google Sheets API | Call data source    |
| PapaParse         | CSV parsing         |

### State Management

- React Context API (DataContext)
- localStorage for API key persistence

---

## 📊 Data Sources

### Google Sheets Integration

**Spreadsheet URL:**

```
https://docs.google.com/spreadsheets/d/1dHnk2tC1OiO0d8Xx6iWwFdncQILewSp4/edit?gid=1116258101
```

**Data Schema:**
| Column | Description |
|--------|-------------|
| Date | Call timestamp |
| Name | Agent name |
| Issue type | Call category |
| Call recording link | Google Drive audio URL |
| Calling No. | Customer phone number |

### Permanent Dataset (101 Calls)

Located in `src/data/permanentCallData.js`

**Date Range:** January 25-29, 2026

**Unique Agents (38 total):**

- Jyoti, Deepa Upadhyay, Rinki Rani, Anshika, Meenakshi
- Prachi, Abhijeet Yadav, Monika Pal, Prakhar Pandey, Shammi Saifi
- Prateeksha, Shivani, Khushi Singh, Jyoti Rani, Khushboo 1
- Ronit Kumar, Ankit Bajpai, Ashif, Aniket Solanki, Pradeep
- Abhishek Tyagi, Kumkum Sisodiya, Deepanshu Tyagi, Gulista
- Nikhil Raj, Priya Kumari, Sheeba Saifi, Shikha, Aarti Mishra
- Vikas, Rocky Pandey, Varsha Swain, Vishal Saraswat, Satyam Thakur
- Shivani Gautam, Neha Sachan, Babita Nautiyal, Rehan Saifi
- Arun Singh, Poonam, Anjali Marothiya, Gaurav Kumar

**Risk Level Distribution:**

- 🔴 High Risk: 7 calls
- 🟡 Medium Risk: 60 calls
- 🟢 Low Risk: 34 calls

**City Distribution:**

- Delhi: 40 calls
- Noida: 25 calls
- Gurgaon: 20 calls
- Ghaziabad: 16 calls

### Issue Types Covered

- Swap Information Shared
- Penalty Information Shared
- Less Range (within/after 2 hours of Swap)
- First Swap - Less Range within 2 Hours
- Meter Stolen / Meter Broken
- Wire Broken / Wiring Issue
- Connector Spark / Wire Melt / Smoke / Burn
- Fake Swap Created by Partner
- Vehicle Impounded / Seized with Battery
- Stolen Battery and Vehicle
- DSK Battery Unavailable
- Navigation Details Shared
- Payment Over Due Information
- Penalty/Leave Rejected
- Battery Pick-Up Request
- Station Closed: Within Operational Hours
- VIP Pass queries
- And more...

---

## 🔌 API Integrations

### 1. Deepgram API (Audio Transcription)

**API Key Input:** Available on the home page (Overview)

- Users can enter their Deepgram API key
- Key is persisted in localStorage
- Key: `deepgram_api_key`

**Default Key (for testing):**

```
da257132250f395f11a2a81269a8987c24182781
```

**Features Used:**

- Nova-2 model
- Smart formatting
- Speaker diarization
- Punctuation
- Hindi-English (hi-en) language support

**API Endpoint:**

```
https://api.deepgram.com/v1/listen
```

### 2. Google Sheets (CSV Export)

**Export URL Format:**

```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
```

**Implementation:** `src/services/googleSheetsService.js`

---

## 📁 Project Structure

```
smart-audit-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── BarChart.jsx
│   │   │   ├── DonutChart.jsx
│   │   │   └── LineChart.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Overview.jsx          # Home dashboard
│   │   │   ├── LiveCallMonitoring.jsx # Real-time calls
│   │   │   ├── QAAnalytics.jsx       # Quality analytics
│   │   │   ├── RevenueLeakage.jsx    # Revenue protection
│   │   │   ├── AgentCoaching.jsx     # Agent training
│   │   │   ├── CityInsights.jsx      # Geographic data
│   │   │   └── SupervisorAlerts.jsx  # High-risk alerts
│   │   └── shared/
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── DataLoadingOverlay.jsx
│   │       └── KPICard.jsx
│   ├── context/
│   │   └── DataContext.jsx           # Global state management
│   ├── data/
│   │   ├── mockData.js               # Fallback demo data
│   │   ├── permanentCallData.js      # 101 real calls
│   │   ├── sopData.js                # SOP v2.0 structured data
│   │   └── sop.txt                   # Raw SOP document
│   ├── services/
│   │   ├── audioAnalysisService.js   # AI analysis logic
│   │   ├── googleSheetsService.js    # Sheets integration
│   │   └── transcriptionService.js   # Deepgram API
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 📱 Dashboard Pages

### 1. Overview (Home)

**Route:** `/` (default)

**Features:**

- Deepgram API key input (highlighted purple section)
- Data source status (Live/Demo)
- KPI cards (Total Calls, Avg QA Score, High-Risk, Revenue Saved)
- Clickable High-Risk card → navigates to Supervisor Alerts
- Trend charts (Daily, Call Quality, Sentiment)
- AI insights summary

### 2. Live Call Monitoring

**Route:** `live-monitoring`

**Features:**

- Real-time call feed
- **Risk Filter:** All / High / Medium / Low
- Call cards with:
  - Agent name
  - Call type
  - QA score
  - SOP adherence
  - Sentiment badge
  - Risk level indicator

### 3. QA Analytics

**Route:** `qa-analytics`

**Features:**

- Overall QA score trends
- Agent performance comparison
- Issue type breakdown
- Compliance metrics

### 4. Revenue Leakage

**Route:** `revenue-leakage`

**Features:**

- Leakage amount calculation (based on high-risk calls)
- SOP Compensation Limits table
- Real-time alerts from high-risk calls
- City-wise breakdown

### 5. Agent Coaching

**Route:** `agent-coaching`

**Features:**

- Agent performance cards
- QA score per agent
- SOP adherence tracking
- AI-generated coaching nudges
- Coaching focus areas
- SOP Agent Evaluation Checklist (10-point system)

### 6. City Insights

**Route:** `city-insights`

**Features:**

- Geographic performance map
- City-wise call distribution
- Regional trend analysis

### 7. Supervisor Alerts

**Route:** `supervisor-alerts`

**Features:**

- High-risk call list
- Escalation recommendations
- One-click call review
- Priority-based sorting

---

## 📋 SOP Integration

### Battery Smart SOP v2.0

**Document:** `src/data/sop.txt` (240 lines)
**Structured Data:** `src/data/sopData.js`

### SOP Categories

#### 1. Swap Station Failure Resolution (BS-SOP-001-R2)

- **Priority:** CRITICAL
- **Steps:** Immediate Data Collection → Classify & Act → Resolution
- **Decision Matrix:**
  - No batteries available → Direct to nearest station (<2 min)
  - Low SOC (60-79%) → Offer ₹30 credit OR alt station (<3 min)
  - Low SOC (<60%) → Escalate to L2 for ₹50 credit (<5 min)
  - Slot stuck → Remote unlock → Manual reset (<5 min)
  - Station offline → Alt station + log outage (<2 min)
  - QR scan fails → Generate manual swap code (<2 min)

#### 2. Payment/Refund Handling (BS-SOP-002-R2)

- **Priority:** HIGH
- **Compensation Limits:**
  - L1 Agent: Up to ₹50
  - L2 Supervisor: ₹51-500
  - L3 Manager: Above ₹500

#### 3. Safety/Emergency Protocol (BS-SOP-003-R2)

- **Priority:** CRITICAL
- **Covers:** Fire, smoke, spark, theft, accidents

### Escalation Matrix

| Level | TAT      | Authority             |
| ----- | -------- | --------------------- |
| L1    | < 4 min  | Agent (₹50 max)       |
| L2    | < 15 min | Supervisor (₹500 max) |
| L3    | < 1 hour | Manager (Unlimited)   |

### Agent Evaluation Checklist (100 points)

1. Greeting & Customer Verification (10 pts)
2. Active Listening & Empathy (15 pts)
3. Problem Identification (10 pts)
4. SOP Adherence (15 pts)
5. Resolution Accuracy (15 pts)
6. TAT Compliance (10 pts)
7. Upsell/Cross-sell Attempt (5 pts)
8. Call Closure (10 pts)
9. Documentation (5 pts)
10. Professionalism (5 pts)

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Steps

1. **Clone/Navigate to the project:**

```bash
cd smart-audit-dashboard
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm run dev
```

4. **Open in browser:**

```
http://localhost:5173
```

### Dependencies Installed

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "framer-motion": "^11.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x",
    "papaparse": "^5.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "vite": "^7.x",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

---

## ⚙️ Configuration

### Tailwind CSS

**File:** `tailwind.config.js`

Custom colors:

```javascript
colors: {
  navy: '#0F172A',
  teal: '#14B8A6',
  amber: '#F59E0B',
  danger: '#EF4444',
}
```

### Vite Config

**File:** `vite.config.js`

Standard React plugin configuration.

### Environment Variables

Currently using hardcoded values. For production:

```env
VITE_DEEPGRAM_API_KEY=your_key_here
VITE_GOOGLE_SHEETS_ID=your_sheet_id
```

---

## 🎨 UI/UX Highlights

- **Color Scheme:** Navy, Teal, Amber, White
- **Typography:** System fonts with clear hierarchy
- **Animations:** Framer Motion for smooth transitions
- **Responsive:** Mobile-first design approach
- **Charts:** Recharts library with custom styling

---

## 📈 Analytics Calculated

| Metric               | Calculation                          |
| -------------------- | ------------------------------------ |
| Total Calls          | Count of all calls in dataset        |
| Avg QA Score         | Sum of QA scores / Total calls       |
| High-Risk Calls      | Calls with riskLevel = 'high'        |
| Revenue Saved        | Estimated based on prevented leakage |
| SOP Adherence        | Average of sopAdherence scores       |
| Positive Sentiment % | Positive calls / Total calls × 100   |

---

## 🏆 Hackathon Submission

### Project: Smart-Audit AI

### Company: Battery Smart

### Event: Battery Smart Hackathon 2026

### Date: January 2026

### Key Achievements

- ✅ 101 real call records integrated
- ✅ 38 agents tracked
- ✅ 7 dashboard pages
- ✅ SOP v2.0 full integration
- ✅ Deepgram AI transcription
- ✅ Real-time risk monitoring
- ✅ Revenue leakage prevention

---

## 📄 License

This project is proprietary to Battery Smart and built for the internal hackathon.

---

**Built with ❤️ for Battery Smart Hackathon 2026**
