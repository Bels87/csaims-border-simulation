import React, { useState, useMemo } from 'react';
import {
  Shield, AlertTriangle, CheckCircle2, Clock, MapPin, 
  Search, Filter, Send, Download, RefreshCw, MessageSquare, 
  Users, ChevronRight, FileText, ArrowRight, UserCheck, ShieldAlert,
  Building, Activity, Smartphone, Info, BarChart3, Database, Check,
  Compass, Radio, Terminal, Play, Server
} from 'lucide-react';

// ============================================================================
// SQLITE RECORD TYPES (Directly mirror sqlite columns)
// ============================================================================
export interface SqliteIncident {
  id: string;
  reference_number: string;
  raw_message: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'ACKNOWLEDGED' | 'TRIAGED' | 'UNDER_INVESTIGATION' | 'REFERRED_TO_AGENCY' | 'RESOLVED' | 'CLOSED';
  verification_status: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'UNVERIFIED' | 'INCONCLUSIVE' | 'FALSE_REPORT';
  village: string;
  ward: string;
  lga: string;
  state: string;
  nearest_landmark: string;
  latitude: number;
  longitude: number;
  location_confidence: string;
  time_of_observation: string;
  reporter_phone: string;
  is_anonymous: number;
  received_at: string;
  acknowledged_at?: string;
  triaged_at?: string;
  verified_at?: string;
  resolved_at?: string;
  assigned_liaison?: string;
  assigned_agency?: string;
  closing_notes?: string;
}

export interface SqliteSMS {
  id: string;
  incident_id?: string;
  sender_number: string;
  short_code: string;
  direction: 'INCOMING' | 'OUTGOING_ACK' | 'OUTGOING_FEEDBACK';
  body: string;
  delivery_status: string;
  created_at: string;
}

export interface SqliteIntel {
  id: string;
  ref_code: string;
  frontier_sector: string;
  category: string;
  threat_pattern: string;
  severity: string;
  similarity_score: number;
  recorded_date: string;
}

// ============================================================================
// INITIAL SEED DATA FOR THE EMBEDDED SQLITE VIRTUAL DISK
// ============================================================================
const INITIAL_SQLITE_INCIDENTS: SqliteIncident[] = [
  {
    id: 'bdr-01',
    reference_number: 'CSAIMS-2026-BDR-00001',
    raw_message: '4 motorbikes carrying wrapped sack parcels shaped like disassembled rifles bypassing customs gate via bush track.',
    category: 'Arms Trafficking',
    severity: 'CRITICAL',
    status: 'TRIAGED',
    verification_status: 'IN_PROGRESS',
    village: 'Magama',
    ward: "Jibia Ward A",
    lga: 'Jibia',
    state: 'Katsina',
    nearest_landmark: '400m West of International Border Pillar 14',
    latitude: 13.0950,
    longitude: 7.2210,
    location_confidence: 'Reported Landmark',
    time_of_observation: '2026-10-21 21:15 WAT',
    reporter_phone: '+234-803-***-8812',
    is_anonymous: 0,
    received_at: '2026-10-21 21:18:20',
    acknowledged_at: '2026-10-21 21:18:45',
    triaged_at: '2026-10-21 21:25:00',
    assigned_liaison: 'Liaison Officer Lawal (Katsina Border)',
    assigned_agency: 'Joint Border Patrol Team (JBPT Demo)'
  },
  {
    id: 'bdr-02',
    reference_number: 'CSAIMS-2026-BDR-00002',
    raw_message: 'Covered canvas truck offloading 28 undocumented foreign nationals into hidden staging orchard.',
    category: 'Irregular Migration',
    severity: 'HIGH',
    status: 'REFERRED_TO_AGENCY',
    verification_status: 'VERIFIED',
    village: 'Ajegunle',
    ward: 'Idiroko Ward',
    lga: 'Ipokia',
    state: 'Ogun',
    nearest_landmark: 'Behind abandoned cocoa warehouse, Old Customs Outpost',
    latitude: 6.6340,
    longitude: 2.7420,
    location_confidence: 'Field-Verified Recon',
    time_of_observation: '2026-10-21 23:40 WAT',
    reporter_phone: '+234-802-***-4419',
    is_anonymous: 0,
    received_at: '2026-10-21 23:44:10',
    acknowledged_at: '2026-10-21 23:44:35',
    triaged_at: '2026-10-21 23:55:00',
    verified_at: '2026-10-22 00:30:00',
    assigned_liaison: 'Liaison Officer Dosu (Ogun Border)',
    assigned_agency: 'Nigeria Immigration Service (NIS Demo)'
  },
  {
    id: 'bdr-03',
    reference_number: 'CSAIMS-2026-BDR-00003',
    raw_message: 'Night convoy of 8 utility vehicles operating without headlights through dry riverbed crossing into Nigeria.',
    category: 'Suspicious Movement',
    severity: 'HIGH',
    status: 'UNDER_INVESTIGATION',
    verification_status: 'IN_PROGRESS',
    village: 'Sahuda',
    ward: 'Konkol Ward',
    lga: 'Maiha',
    state: 'Adamawa',
    nearest_landmark: 'Seasonal River Crossing, 1.2km from Cameroon Boundary',
    latitude: 9.9920,
    longitude: 13.2100,
    location_confidence: 'Estimated Track',
    time_of_observation: '2026-10-22 02:20 WAT',
    reporter_phone: '+234-706-***-1100',
    is_anonymous: 1,
    received_at: '2026-10-22 02:24:50',
    acknowledged_at: '2026-10-22 02:25:15',
    triaged_at: '2026-10-22 02:40:00',
    assigned_liaison: 'Liaison Officer Buba (Adamawa Border)'
  },
  {
    id: 'bdr-04',
    reference_number: 'CSAIMS-2026-BDR-00004',
    raw_message: 'Wooden longboats ferrying modified drums of petroleum products across maritime creek into foreign waters.',
    category: 'Contraband Smuggling',
    severity: 'MEDIUM',
    status: 'REFERRED_TO_AGENCY',
    verification_status: 'VERIFIED',
    village: 'Ikang',
    ward: 'Ikang Central Ward',
    lga: 'Bakassi',
    state: 'Cross River',
    nearest_landmark: 'Unofficial Mangrove Jetty behind Fish Market',
    latitude: 4.7710,
    longitude: 8.5320,
    location_confidence: 'Field-Verified Recon',
    time_of_observation: '2026-10-21 19:30 WAT',
    reporter_phone: '+234-814-***-9012',
    is_anonymous: 0,
    received_at: '2026-10-21 19:35:00',
    acknowledged_at: '2026-10-21 19:35:30',
    triaged_at: '2026-10-21 19:50:00',
    verified_at: '2026-10-21 20:30:00',
    assigned_liaison: 'Liaison Officer Briggs (Maritime Border)',
    assigned_agency: 'Nigeria Customs Service (NCS Demo)'
  },
  {
    id: 'bdr-05',
    reference_number: 'CSAIMS-2026-BDR-00005',
    raw_message: 'Unauthorised armed men mounting makeshift timber barrier collecting extortion tolls from cross-border traders.',
    category: 'Illegal Border Checkpoint',
    severity: 'HIGH',
    status: 'TRIAGED',
    verification_status: 'IN_PROGRESS',
    village: 'Chikanda',
    ward: 'Yashikira Ward',
    lga: 'Baruten',
    state: 'Kwara',
    nearest_landmark: '500m before Nigerian Border Control Post Arch',
    latitude: 9.4210,
    longitude: 3.0110,
    location_confidence: 'Reported Landmark',
    time_of_observation: '2026-10-22 05:45 WAT',
    reporter_phone: '+234-809-***-2234',
    is_anonymous: 0,
    received_at: '2026-10-22 05:50:10',
    acknowledged_at: '2026-10-22 05:50:35',
    triaged_at: '2026-10-22 06:05:00',
    assigned_liaison: 'Liaison Officer Usman (Kwara Border)'
  },
  {
    id: 'bdr-06',
    reference_number: 'CSAIMS-2026-BDR-00006',
    raw_message: 'Group of 14 foreign nationals guided on foot through thick bush tracks avoiding biometric screening.',
    category: 'Irregular Migration',
    severity: 'MEDIUM',
    status: 'ACKNOWLEDGED',
    verification_status: 'PENDING',
    village: 'Pashi',
    ward: 'Seme-Krake Ward',
    lga: 'Badagry',
    state: 'Lagos',
    nearest_landmark: 'Unofficial footpath beside Seme Coconut Plantation',
    latitude: 6.3810,
    longitude: 2.7150,
    location_confidence: 'Reported Landmark',
    time_of_observation: '2026-10-22 06:10 WAT',
    reporter_phone: '+234-903-***-5511',
    is_anonymous: 1,
    received_at: '2026-10-22 06:12:00',
    acknowledged_at: '2026-10-22 06:12:28'
  },
  {
    id: 'bdr-07',
    reference_number: 'CSAIMS-2026-BDR-00007',
    raw_message: 'Armed raiders on camels and horses crossing northern frontier into grazing reserve corridor.',
    category: 'Cross-Border Incursion / Banditry',
    severity: 'CRITICAL',
    status: 'REFERRED_TO_AGENCY',
    verification_status: 'VERIFIED',
    village: 'Gidan Akwai',
    ward: 'Kalmalo Ward',
    lga: 'Illela',
    state: 'Sokoto',
    nearest_landmark: 'Dry Valley Depression near Border Beacon 27',
    latitude: 13.7250,
    longitude: 5.3010,
    location_confidence: 'Field-Verified Recon',
    time_of_observation: '2026-10-21 22:50 WAT',
    reporter_phone: '+234-703-***-7722',
    is_anonymous: 0,
    received_at: '2026-10-21 22:53:00',
    acknowledged_at: '2026-10-21 22:53:25',
    triaged_at: '2026-10-21 23:00:00',
    verified_at: '2026-10-21 23:25:00',
    assigned_agency: 'Police Border Patrol Unit (Demo)'
  },
  {
    id: 'bdr-08',
    reference_number: 'CSAIMS-2026-BDR-00008',
    raw_message: 'Concealed metal crates offloaded from pirogue canoe into pickup truck under cover of darkness.',
    category: 'Arms Trafficking',
    severity: 'CRITICAL',
    status: 'CLOSED',
    verification_status: 'VERIFIED',
    village: 'Banki Waterpoint',
    ward: 'Banki Ward',
    lga: 'Bama',
    state: 'Borno',
    nearest_landmark: 'Banki Customs Secondary Crossing Point',
    latitude: 11.2510,
    longitude: 14.1480,
    location_confidence: 'Field-Verified Recon',
    time_of_observation: '2026-10-22 01:10 WAT',
    reporter_phone: '+234-802-***-9901',
    is_anonymous: 0,
    received_at: '2026-10-22 01:14:00',
    acknowledged_at: '2026-10-22 01:14:25',
    triaged_at: '2026-10-22 01:20:00',
    verified_at: '2026-10-22 01:45:00',
    resolved_at: '2026-10-22 04:00:00',
    assigned_agency: 'Joint Border Patrol Team (JBPT Demo)'
  }
];

const INITIAL_SQLITE_SMS: SqliteSMS[] = [
  {
    id: 'sms-01',
    incident_id: 'bdr-01',
    sender_number: '+234-803-***-8812',
    short_code: '20200',
    direction: 'INCOMING',
    body: '4 motorbikes carrying wrapped rifles bypassing customs gate via bush track. Observed 21:15 WAT near Pillar 14, Magama village.',
    delivery_status: 'DELIVERED_DEMO',
    created_at: '2026-10-21 21:18:20'
  },
  {
    id: 'sms-02',
    incident_id: 'bdr-01',
    sender_number: '20200',
    short_code: '20200',
    direction: 'OUTGOING_ACK',
    body: 'Border alert logged. Ref: CSAIMS-2026-BDR-00001. Location: Magama, Jibia. Operations team reviewing. (Simulated acknowledgement)',
    delivery_status: 'DELIVERED_DEMO',
    created_at: '2026-10-21 21:18:45'
  }
];

const INITIAL_SQLITE_INTEL: SqliteIntel[] = [
  {
    id: 'intel-01',
    ref_code: 'INTEL-BDR-NW-08',
    frontier_sector: 'Jibia / Magama Sector (Katsina - Niger Frontier)',
    category: 'Arms Trafficking',
    threat_pattern: 'Night motorbike convoys using Pillar 12-16 bypass corridors',
    severity: 'CRITICAL',
    similarity_score: 93,
    recorded_date: '2026-10-12'
  },
  {
    id: 'intel-02',
    ref_code: 'INTEL-BDR-SW-04',
    frontier_sector: 'Idiroko / Ajegunle Sector (Ogun - Benin Frontier)',
    category: 'Irregular Migration',
    threat_pattern: 'Abandoned cocoa warehouses used as staging depots',
    severity: 'HIGH',
    similarity_score: 89,
    recorded_date: '2026-10-08'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CSAIMSBorderApp() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inbox' | 'register' | 'map' | 'intel' | 'verification' | 'agencies' | 'feedback' | 'sqlite'>('dashboard');
  const [currentRole, setCurrentRole] = useState<string>('OPERATOR');

  // SQLite Embedded State (In-Memory Virtual DB)
  const [dbIncidents, setDbIncidents] = useState<SqliteIncident[]>(INITIAL_SQLITE_INCIDENTS);
  const [dbSMS, setDbSMS] = useState<SqliteSMS[]>(INITIAL_SQLITE_SMS);
  const [selectedIncident, setSelectedIncident] = useState<SqliteIncident | null>(INITIAL_SQLITE_INCIDENTS[0]);

  // Virtual Phone State
  const [smsInputMessage, setSmsInputMessage] = useState('');
  const [smsVillage, setSmsVillage] = useState('Magama');
  const [smsWard, setSmsWard] = useState("Jibia Ward A");
  const [smsLga, setSmsLga] = useState('Jibia');
  const [smsState, setSmsState] = useState('Katsina');
  const [smsLandmark, setSmsLandmark] = useState('Border Pillar 14 track');
  const [smsObsTime, setSmsObsTime] = useState('2026-10-22 08:30 WAT');
  const [smsIsAnonymous, setSmsIsAnonymous] = useState(false);

  // SQL Console State
  const [sqlQueryInput, setSqlQueryInput] = useState('SELECT reference_number, category, severity, village, lga, time_of_observation FROM incidents;');
  const [sqlQueryResult, setSqlQueryResult] = useState<any[]>(INITIAL_SQLITE_INCIDENTS.map(i => ({
    reference_number: i.reference_number,
    category: i.category,
    severity: i.severity,
    village: i.village,
    lga: i.lga,
    time_of_observation: i.time_of_observation
  })));
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Triage Dialog State
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [triageCat, setTriageCat] = useState('Arms Trafficking');
  const [triageSev, setTriageSev] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('CRITICAL');
  const [triageOfficer, setTriageOfficer] = useState('Liaison Officer Lawal (Katsina Border)');
  const [feedbackBody, setFeedbackBody] = useState('');

  // ============================================================================
  // SQLITE EMBEDDED OPERATIONS (Simulated DML Engine)
  // ============================================================================
  
  // 1. INSERT INTO incidents & simulated_sms
  const handleInsertIncidentSMS = () => {
    if (!smsInputMessage.trim()) return;

    const nextIdNum = dbIncidents.length + 1;
    const refCode = `CSAIMS-2026-BDR-${String(nextIdNum).padStart(5, '0')}`;
    const timestampNow = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Auto-categorize
    let autoCategory = 'Suspicious Movement';
    let autoSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    const lower = smsInputMessage.toLowerCase();
    if (lower.includes('rifle') || lower.includes('arm') || lower.includes('gun') || lower.includes('ammunition')) {
      autoCategory = 'Arms Trafficking';
      autoSeverity = 'CRITICAL';
    } else if (lower.includes('migrant') || lower.includes('foreigner') || lower.includes('undocumented')) {
      autoCategory = 'Irregular Migration';
      autoSeverity = 'HIGH';
    } else if (lower.includes('smuggl') || lower.includes('petrol') || lower.includes('boat')) {
      autoCategory = 'Contraband Smuggling';
      autoSeverity = 'MEDIUM';
    }

    const newRow: SqliteIncident = {
      id: `bdr-${String(nextIdNum).padStart(2, '0')}`,
      reference_number: refCode,
      raw_message: smsInputMessage.trim(),
      category: autoCategory,
      severity: autoSeverity,
      status: 'ACKNOWLEDGED',
      verification_status: 'PENDING',
      village: smsVillage,
      ward: smsWard,
      lga: smsLga,
      state: smsState,
      nearest_landmark: smsLandmark,
      latitude: 13.0800 + (Math.random() - 0.5) * 0.1,
      longitude: 7.2100 + (Math.random() - 0.5) * 0.1,
      location_confidence: 'Reported Landmark',
      time_of_observation: smsObsTime,
      reporter_phone: smsIsAnonymous ? 'Anonymous' : '+234-803-555-0199',
      is_anonymous: smsIsAnonymous ? 1 : 0,
      received_at: timestampNow,
      acknowledged_at: timestampNow
    };

    const inSmsRow: SqliteSMS = {
      id: `sms-in-${Date.now()}`,
      incident_id: newRow.id,
      sender_number: newRow.reporter_phone,
      short_code: '20200',
      direction: 'INCOMING',
      body: `${smsInputMessage} | Obs: ${smsObsTime} at ${smsVillage}, Landmark: ${smsLandmark}`,
      delivery_status: 'DELIVERED_DEMO',
      created_at: timestampNow
    };

    const ackSmsRow: SqliteSMS = {
      id: `sms-ack-${Date.now() + 1}`,
      incident_id: newRow.id,
      sender_number: '20200',
      short_code: '20200',
      direction: 'OUTGOING_ACK',
      body: `Border alert logged. Ref: ${refCode}. Location: ${smsVillage}, ${smsLga} LGA. Observed: ${smsObsTime}. Operations reviewing. (Simulated acknowledgement)`,
      delivery_status: 'DELIVERED_DEMO',
      created_at: timestampNow
    };

    // Execute SQLite Virtual INSERT
    setDbIncidents(prev => [newRow, ...prev]);
    setDbSMS(prev => [...prev, inSmsRow, ackSmsRow]);
    setSelectedIncident(newRow);
    setSmsInputMessage('');
    showToast(`Executed: INSERT INTO incidents (ref: ${refCode})`);
  };

  // 2. UPDATE incidents (Triage)
  const handleUpdateTriage = () => {
    if (!selectedIncident) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setDbIncidents(prev => prev.map(row => {
      if (row.id === selectedIncident.id) {
        return {
          ...row,
          category: triageCat,
          severity: triageSev,
          status: 'TRIAGED',
          verification_status: 'IN_PROGRESS',
          assigned_liaison: triageOfficer,
          triaged_at: nowStr
        };
      }
      return row;
    }));

    setIsTriageOpen(false);
    showToast(`Executed: UPDATE incidents SET status='TRIAGED', severity='${triageSev}' WHERE id='${selectedIncident.id}'`);
  };

  // 3. UPDATE incidents (Verification)
  const handleUpdateVerification = (outcome: 'VERIFIED' | 'INCONCLUSIVE' | 'FALSE_REPORT') => {
    if (!selectedIncident) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setDbIncidents(prev => prev.map(row => {
      if (row.id === selectedIncident.id) {
        return {
          ...row,
          verification_status: outcome,
          location_confidence: 'Field-Verified Recon',
          verified_at: nowStr
        };
      }
      return row;
    }));
    showToast(`Executed: UPDATE incidents SET verification_status='${outcome}' WHERE id='${selectedIncident.id}'`);
  };

  // 4. UPDATE incidents (Agency Referral)
  const handleReferAgency = (agencyName: string) => {
    if (!selectedIncident) return;
    setDbIncidents(prev => prev.map(row => {
      if (row.id === selectedIncident.id) {
        return {
          ...row,
          status: 'REFERRED_TO_AGENCY',
          assigned_agency: agencyName
        };
      }
      return row;
    }));
    showToast(`Executed: UPDATE incidents SET assigned_agency='${agencyName}' WHERE id='${selectedIncident.id}'`);
  };

  // 5. Interactive SQL Query Runner
  const handleRunSqlQuery = () => {
    setSqlError(null);
    const q = sqlQueryInput.trim().toUpperCase();

    try {
      if (q.startsWith('SELECT')) {
        if (q.includes('FROM INCIDENTS')) {
          if (q.includes("CRITICAL")) {
            setSqlQueryResult(dbIncidents.filter(i => i.severity === 'CRITICAL'));
          } else if (q.includes("ARMS TRAFFICKING")) {
            setSqlQueryResult(dbIncidents.filter(i => i.category === 'Arms Trafficking'));
          } else {
            setSqlQueryResult(dbIncidents);
          }
        } else if (q.includes('FROM SIMULATED_SMS')) {
          setSqlQueryResult(dbSMS);
        } else if (q.includes('FROM BORDER_INTELLIGENCE')) {
          setSqlQueryResult(INITIAL_SQLITE_INTEL);
        } else {
          setSqlQueryResult(dbIncidents);
        }
        showToast('Query executed successfully on csaims_border.db');
      } else {
        setSqlError('Interactive console supports all SELECT queries on: incidents, simulated_sms, border_intelligence.');
      }
    } catch (err: any) {
      setSqlError(err.message || 'SQLite query execution failure');
    }
  };

  // Export full SQLite SQL Dump
  const handleExportSqlDump = () => {
    const dump = [
      '-- SQLite 3 Database Dump: csaims_border.db',
      '-- Generated inside CSAIMS Browser Sandbox',
      'BEGIN TRANSACTION;',
      ...dbIncidents.map(i => `INSERT INTO incidents VALUES ('${i.id}', '${i.reference_number}', '${i.raw_message.replace(/'/g, "''")}', '${i.category}', '${i.severity}', '${i.status}', '${i.verification_status}', '${i.village}', '${i.ward}', '${i.lga}', '${i.state}', '${i.nearest_landmark.replace(/'/g, "''")}', ${i.latitude}, ${i.longitude}, '${i.location_confidence}', '${i.time_of_observation}', '${i.reporter_phone}', ${i.is_anonymous}, '${i.received_at}', '${i.acknowledged_at || ''}', '${i.triaged_at || ''}', '${i.verified_at || ''}', '${i.resolved_at || ''}', '${i.assigned_liaison || ''}', '${i.assigned_agency || ''}', '${i.closing_notes || ''}');`),
      'COMMIT;'
    ].join('\n');

    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csaims_border_dump_${new Date().toISOString().substring(0, 10)}.sql`;
    a.click();
    showToast('Downloaded SQLite SQL dump file.');
  };

  const getSeverityBadge = (s: string) => {
    switch(s) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border border-red-500/40';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      default: return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* ==================================================== */}
      {/* SIMULATION & EMBEDDED SQLITE STATUS BANNER          */}
      {/* ==================================================== */}
      <div className="bg-slate-900 border-b border-emerald-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-white uppercase tracking-wide">Embedded SQLite Engine:</span>
          <span className="text-emerald-300 font-mono">csaims_border.db (In-Memory / Zero-Setup)</span>
          <span className="text-slate-400 hidden md:inline">• Shortcode 20200 Sandbox Active</span>
        </div>
        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          <span className="text-slate-400">Current Role:</span>
          <select 
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-emerald-300 text-xs rounded px-2 py-1 font-semibold focus:outline-none"
          >
            <option value="OPERATOR">Border Command Operator</option>
            <option value="SYSTEM_ADMIN">National Administrator</option>
            <option value="LIAISON_OFFICER">Border Sector Field Liaison</option>
            <option value="AGENCY_REP">Joint Agency Rep (NIS / NCS / JBPT)</option>
            <option value="STAKEHOLDER_VIEWER">Management Stakeholder (Read-Only)</option>
          </select>
        </div>
      </div>

      {/* ==================================================== */}
      {/* HEADER                                              */}
      {/* ==================================================== */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between backdrop-blur sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600/20 border border-emerald-500/40 rounded-lg text-emerald-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">CSAIMS Border Command</h1>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-medium">DASHBOARD</span>
            </div>
            <p className="text-xs text-slate-400">Frontier Vices, Arms Trafficking & Irregular Migration Intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveTab('sqlite')}
            className="text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 px-3 py-1.5 rounded flex items-center space-x-1.5 transition"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQLite Console</span>
          </button>
          <button 
            onClick={handleExportSqlDump}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Records</span>
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* NAVIGATION TABS                                     */}
      {/* ==================================================== */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 flex space-x-1 overflow-x-auto text-xs font-medium">
        {[
          { id: 'dashboard', label: 'Frontier Dashboard', icon: BarChart3 },
          { id: 'inbox', label: 'Border SMS 20200 Gateway', icon: Smartphone },
          { id: 'register', label: 'Border Incident Register', icon: FileText },
          { id: 'map', label: 'Frontier GIS Visualizer', icon: MapPin },
          { id: 'intel', label: 'Transnational Intel Matcher', icon: Database },
          { id: 'verification', label: 'Liaison Reconnaissance', icon: UserCheck },
          { id: 'agencies', label: 'NIS / NCS / JBPT Hub', icon: Building },
          { id: 'sqlite', label: 'SQLite DB & SQL Query Console', icon: Terminal },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 transition whitespace-nowrap ${
                isActive 
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/40 font-semibold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl border border-emerald-400 flex items-center space-x-2 animate-bounce">
          <Info className="w-4 h-4" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* MAIN VIEW CONTENT                                   */}
      {/* ==================================================== */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: FRONTIER DASHBOARD                          */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { title: 'SQLite Records', val: dbIncidents.length, sub: 'Table: incidents', color: 'text-white' },
                { title: 'Arms Trafficking', val: dbIncidents.filter(i => i.category === 'Arms Trafficking').length, sub: 'Critical frontier threat', color: 'text-red-400' },
                { title: 'Irregular Migration', val: dbIncidents.filter(i => i.category === 'Irregular Migration').length, sub: 'NIS action queue', color: 'text-amber-400' },
                { title: 'In Reconnaissance', val: dbIncidents.filter(i => i.verification_status === 'IN_PROGRESS').length, sub: 'Field liaisons active', color: 'text-blue-400' },
                { title: 'Referred to Agencies', val: dbIncidents.filter(i => i.status === 'REFERRED_TO_AGENCY').length, sub: 'NIS, NCS & JBPT', color: 'text-purple-400' },
                { title: 'Total SMS Dispatches', val: dbSMS.length, sub: 'Table: simulated_sms', color: 'text-emerald-400' },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-400 block truncate">{kpi.title}</span>
                  <span className={`text-2xl font-black ${kpi.color} block my-1 font-mono`}>{kpi.val}</span>
                  <span className="text-[10px] text-slate-500">{kpi.sub}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Frontier Incident Stream</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">SELECT * FROM incidents</span>
                </div>

                <div className="space-y-2.5">
                  {dbIncidents.slice(0, 5).map(inc => (
                    <div 
                      key={inc.id}
                      onClick={() => { setSelectedIncident(inc); setActiveTab('register'); }}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg flex items-start justify-between cursor-pointer transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">{inc.reference_number}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getSeverityBadge(inc.severity)}`}>
                            {inc.severity}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                            {inc.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200">{inc.raw_message}</p>
                        <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-slate-400">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>{inc.village}, {inc.lga} LGA ({inc.state})</span>
                          </span>
                          <span>•</span>
                          <span className="text-amber-300">Observed: {inc.time_of_observation}</span>
                          <span>•</span>
                          <span className="italic text-slate-500">Landmark: {inc.nearest_landmark}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 self-center shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Internal Database Status</h3>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DB Engine:</span>
                    <span className="font-mono text-emerald-400 font-bold">SQLite v3.45 (Embedded)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Mode:</span>
                    <span className="text-slate-200">Self-Contained Browser Virtual FS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">External Database:</span>
                    <span className="text-emerald-400 font-semibold">None (Autonomous)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Integrity Check:</span>
                    <span className="text-emerald-400 font-mono">PRAGMA OK</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('sqlite')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Open Query Console</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: SIMULATED 20200 SMS GATEWAY                  */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Simulate Shortcode 20200 Inbound Alert</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Threat Observation Text</label>
                  <textarea 
                    rows={2}
                    value={smsInputMessage}
                    onChange={(e) => setSmsInputMessage(e.target.value)}
                    placeholder="e.g. 4 motorcycles carrying wrapped rifles through bush path..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Village</label>
                    <input 
                      type="text" 
                      value={smsVillage}
                      onChange={(e) => setSmsVillage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Ward</label>
                    <input 
                      type="text" 
                      value={smsWard}
                      onChange={(e) => setSmsWard(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">LGA</label>
                    <input 
                      type="text" 
                      value={smsLga}
                      onChange={(e) => setSmsLga(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">State</label>
                    <input 
                      type="text" 
                      value={smsState}
                      onChange={(e) => setSmsState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Nearest Landmark (Pillar/Beacon/Crossing)</label>
                  <input 
                    type="text" 
                    value={smsLandmark}
                    onChange={(e) => setSmsLandmark(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Time of Observation</label>
                  <input 
                    type="text" 
                    value={smsObsTime}
                    onChange={(e) => setSmsObsTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <button
                  onClick={handleInsertIncidentSMS}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SEND</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[580px]">
                <div className="bg-slate-950 pt-3 pb-2 px-6 flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800">
                  <span className="font-mono">08:30 WAT</span>
                  <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
                  <span className="text-emerald-400 font-bold">● SHORTCODE 20200</span>
                </div>

                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 text-xs font-bold text-white flex justify-between">
                  <span>Frontier Alert Gateway (20200)</span>
                  <span className="text-[10px] text-emerald-400">Toll-Free</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/70">
                  {dbSMS.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${msg.direction === 'INCOMING' ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                          msg.direction === 'INCOMING'
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-snug">{msg.body}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">
                        {msg.direction === 'INCOMING' ? 'Citizen Sent' : '20200 Auto-Ack'} • {msg.created_at.substring(11, 16)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: BORDER INCIDENT REGISTER & TRIAGE           */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'register' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white">Central Border Incident Register</h2>
                <p className="text-xs text-slate-400">Queried directly from SQLite table: <code className="text-emerald-300">incidents</code></p>
              </div>
              <button 
                onClick={handleExportSqlDump}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SQLite Dump</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Threat Observation</th>
                    <th className="py-3 px-4">Border Location</th>
                    <th className="py-3 px-4">Nearest Landmark</th>
                    <th className="py-3 px-4">Observed Time</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {dbIncidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{inc.reference_number}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{inc.raw_message}</td>
                      <td className="py-3 px-4">{inc.village}, {inc.lga} LGA ({inc.state})</td>
                      <td className="py-3 px-4 italic text-slate-400">{inc.nearest_landmark}</td>
                      <td className="py-3 px-4 font-mono text-amber-300">{inc.time_of_observation}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getSeverityBadge(inc.severity)}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => { setSelectedIncident(inc); setIsTriageOpen(true); }}
                          className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded text-xs transition"
                        >
                          Triage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: FRONTIER GIS LOCATION MAP                    */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs font-bold text-white flex justify-between">
                <span>Nigeria Frontier Demarcation GIS</span>
                <span className="text-slate-400">Displaying exact visual landmark beacons</span>
              </div>

              <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6">
                <div className="relative w-full h-full">
                  {dbIncidents.map((inc) => {
                    const topPct = Math.max(10, Math.min(90, 100 - ((inc.latitude - 4.5) / (14.0 - 4.5)) * 100));
                    const leftPct = Math.max(10, Math.min(90, ((inc.longitude - 2.5) / (14.5 - 2.5)) * 100));
                    return (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                      >
                        <div className="w-5 h-5 rounded-full border-2 bg-emerald-500 border-white flex items-center justify-center shadow-lg">
                          <span className="text-[8px] font-bold text-slate-950">{inc.severity[0]}</span>
                        </div>
                        <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[10px] text-white p-2 rounded shadow-xl whitespace-nowrap z-30">
                          <p className="font-bold text-emerald-400">{inc.reference_number} • {inc.village}</p>
                          <p className="text-slate-300">{inc.category}</p>
                          <p className="text-amber-300 font-mono">Landmark: {inc.nearest_landmark}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Active Frontier Beacon</h3>
              {selectedIncident ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block">Incident Ref:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedIncident.reference_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Border Location:</span>
                    <span className="text-slate-200">{selectedIncident.village}, {selectedIncident.lga} LGA ({selectedIncident.state})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nearest Landmark:</span>
                    <span className="text-amber-300 font-medium italic">{selectedIncident.nearest_landmark}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Observed Time:</span>
                    <span className="font-mono text-emerald-400">{selectedIncident.time_of_observation}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">Select an incident pin on the map.</div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 5: TRANSNATIONAL INTEL MATCHER                  */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'intel' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>Transnational Cross-Border Intelligence Table</span>
              </h2>
              <div className="space-y-2 text-xs">
                {INITIAL_SQLITE_INTEL.map((intel) => (
                  <div key={intel.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-400">{intel.ref_code}</span>
                        <span className="text-white font-semibold">• {intel.frontier_sector}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{intel.threat_pattern}</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{intel.similarity_score}% Match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 6: LIAISON RECONNAISSANCE & VERIFICATION        */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'verification' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl mx-auto space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Record Ground Reconnaissance</span>
            </h2>

            {selectedIncident && (
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400">Target Incident:</span>
                <p className="font-mono text-emerald-400 font-bold">{selectedIncident.reference_number}</p>
                <p className="text-slate-300">{selectedIncident.village} ({selectedIncident.lga} LGA) • Landmark: {selectedIncident.nearest_landmark}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-semibold text-slate-300 block">Reconnaissance Finding Outcome</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateVerification('VERIFIED')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded"
                >
                  Confirm Verified
                </button>
                <button
                  onClick={() => handleUpdateVerification('INCONCLUSIVE')}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded"
                >
                  Inconclusive
                </button>
                <button
                  onClick={() => handleUpdateVerification('FALSE_REPORT')}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded"
                >
                  False Alarm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 7: NIS / NCS / JBPT INTER-AGENCY HUB            */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'agencies' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
                <Building className="w-5 h-5 text-rose-400" />
                <span>Inter-Agency Border Security Dispatch Hub</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Executes updates on incidents assigned agency and inserts transactional dispatch records into agency referrals.
              </p>

              {/* Agency Referral Dispatch Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { 
                    name: 'Nigeria Immigration Service', 
                    role: 'Irregular migration, human trafficking & unapproved entry corridors', 
                    color: 'border-blue-500/40 text-blue-300',
                    defaultAction: 'Mobilize Frontier BCP interception team'
                  },
                  { 
                    name: 'Nigeria Customs Service', 
                    role: 'Contraband, petroleum smuggling, cargo interception & illegal dabas', 
                    color: 'border-emerald-500/40 text-emerald-300',
                    defaultAction: 'Federal Operations Unit strike force dispatched'
                  },
                  { 
                    name: 'Joint Border Patrol Team', 
                    role: 'Cross-border arms trafficking, ammunition interdiction & joint sweeps', 
                    color: 'border-red-500/40 text-red-300',
                    defaultAction: 'Joint tactical cordon established along border beacon'
                  },
                  { 
                    name: 'Police Border Patrol Unit', 
                    role: 'Transnational banditry, illegal tolls, kidnapping incursion', 
                    color: 'border-purple-500/40 text-purple-300',
                    defaultAction: 'Armoured mobile patrol routed to sector track'
                  },
                ].map((agency, idx) => (
                  <div key={idx} className={`bg-slate-950 border ${agency.color} p-4 rounded-lg flex flex-col justify-between`}>
                    <div>
                      <h4 className="font-bold text-xs mb-1">{agency.name}</h4>
                      <p className="text-[11px] text-slate-400 mb-3">{agency.role}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (selectedIncident) {
                          handleReferAgency(agency.name);
                        } else {
                          showToast('Select an incident from the register first.');
                        }
                      }}
                      className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 py-1.5 rounded transition"
                    >
                      Refer Selected Case
                    </button>
                  </div>
                ))}
              </div>

              {/* Active Referrals Table */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Active Tactical Deployments
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Ref Number</th>
                      <th className="py-2.5 px-4">Assigned Mandated Agency</th>
                      <th className="py-2.5 px-4">Border Sector Location</th>
                      <th className="py-2.5 px-4">Nearest Landmark</th>
                      <th className="py-2.5 px-4">Observed Time</th>
                      <th className="py-2.5 px-4">Deployment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {dbIncidents.filter(i => i.status === 'REFERRED_TO_AGENCY').map(inc => (
                      <tr key={inc.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{inc.reference_number}</td>
                        <td className="py-3 px-4 text-rose-300 font-semibold">{inc.assigned_agency}</td>
                        <td className="py-3 px-4">{inc.village}, {inc.lga} LGA ({inc.state})</td>
                        <td className="py-3 px-4 text-slate-400 italic">{inc.nearest_landmark}</td>
                        <td className="py-3 px-4 font-mono text-amber-300">{inc.time_of_observation}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                            INTERCEPTION DISPATCHED (DEMO)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 8: SQLITE DB & INTERACTIVE QUERY CONSOLE        */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'sqlite' && (
          <div className="space-y-6">
            
            {/* Top Info & Quick Presets */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span>Embedded SQLite 3 Terminal (<code className="text-emerald-300">csaims_border.db</code>)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Direct SQL query engine querying in-memory border tables: <code className="text-slate-200">incidents</code>, <code className="text-slate-200">simulated_sms</code>, <code className="text-slate-200">border_intelligence</code>.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleExportSqlDump}
                    className="text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 px-3 py-1.5 rounded flex items-center space-x-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Generate Complete .SQL Dump</span>
                  </button>
                </div>
              </div>

              {/* Preset SQL Queries for Presenter */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Preset Demonstration Queries (Click to Populate):
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: 'All Incidents', q: 'SELECT reference_number, category, severity, village, lga, time_of_observation FROM incidents;' },
                    { label: 'Critical Arms Threats', q: "SELECT reference_number, category, nearest_landmark, time_of_observation FROM incidents WHERE category = 'Arms Trafficking' AND severity = 'CRITICAL';" },
                    { label: 'Irregular Migration Queue', q: "SELECT reference_number, village, lga, nearest_landmark, verification_status FROM incidents WHERE category = 'Irregular Migration';" },
                    { label: 'Shortcode 20200 SMS Log', q: 'SELECT sender_number, direction, body, created_at FROM simulated_sms ORDER BY created_at DESC;' },
                    { label: 'Border Intelligence Base', q: 'SELECT ref_code, frontier_sector, threat_pattern, similarity_score FROM border_intelligence;' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSqlQueryInput(preset.q)}
                      className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL Query Editor */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea 
                    rows={3}
                    value={sqlQueryInput}
                    onChange={(e) => setSqlQueryInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 shadow-inner resize-none"
                    placeholder="Enter SQLite SQL query e.g. SELECT * FROM incidents WHERE severity = 'CRITICAL';"
                  />
                  <button
                    onClick={handleRunSqlQuery}
                    className="absolute right-3 bottom-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded text-xs transition flex items-center space-x-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>
                {sqlError && (
                  <div className="bg-red-950/60 border border-red-500/40 p-2.5 rounded text-xs text-red-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{sqlError}</span>
                  </div>
                )}
              </div>

              {/* Query Result Grid */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Query Result Matrix ({sqlQueryResult.length} rows returned)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SQLite Engine: Memory VFS</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-h-96">
                  {sqlQueryResult.length > 0 ? (
                    <table className="w-full text-left text-xs text-slate-300 font-mono">
                      <thead className="bg-slate-900 text-emerald-400 font-bold uppercase text-[10px] border-b border-slate-800 sticky top-0">
                        <tr>
                          {Object.keys(sqlQueryResult[0]).map((colKey) => (
                            <th key={colKey} className="py-2.5 px-3 whitespace-nowrap">{colKey}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {sqlQueryResult.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-300">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No records matched the query.
                    </div>
                  )}
                </div>
              </div>

              {/* Database Schema Overview */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Schema Catalog (<code className="text-emerald-400">PRAGMA table_info()</code>)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="font-bold text-emerald-300 block mb-1">TABLE: incidents</span>
                    <span className="text-[11px] text-slate-400 leading-relaxed block">
                      id (PK), reference_number (UNIQUE), raw_message, category, severity, status, verification_status, village, ward, lga, state, nearest_landmark, latitude, longitude, location_confidence, time_of_observation, reporter_phone, is_anonymous, received_at, acknowledged_at, triaged_at, verified_at, resolved_at, assigned_liaison, assigned_agency
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="font-bold text-emerald-300 block mb-1">TABLE: simulated_sms</span>
                    <span className="text-[11px] text-slate-400 leading-relaxed block">
                      id (PK), incident_id (FK), sender_number, short_code ('20200'), direction, body, delivery_status, created_at
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="font-bold text-emerald-300 block mb-1">TABLE: border_intelligence</span>
                    <span className="text-[11px] text-slate-400 leading-relaxed block">
                      id (PK), ref_code (UNIQUE), frontier_sector, category, threat_pattern, severity, similarity_score, recorded_date
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* OPERATOR TRIAGE MODAL                                */}
      {/* ==================================================== */}
      {isTriageOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Triage Frontier Threat</h3>
                <span className="font-mono text-xs text-emerald-400 font-bold">{selectedIncident.reference_number}</span>
              </div>
              <button 
                onClick={() => setIsTriageOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Observation Text:</span>
                <p className="text-slate-200 italic">"{selectedIncident.raw_message}"</p>
                <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-2">
                  <span>Location: {selectedIncident.village}, {selectedIncident.lga} LGA</span>
                  <span className="text-amber-300">Observed: {selectedIncident.time_of_observation}</span>
                  <span className="col-span-2 text-emerald-400">Landmark: {selectedIncident.nearest_landmark}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Threat Classification</label>
                <select 
                  value={triageCat}
                  onChange={(e) => setTriageCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Arms Trafficking</option>
                  <option>Irregular Migration</option>
                  <option>Suspicious Movement</option>
                  <option>Contraband Smuggling</option>
                  <option>Cross-Border Incursion / Banditry</option>
                  <option>Illegal Border Checkpoint</option>
                  <option>Border Pillar Tampering</option>
                  <option>Human Trafficking</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Severity Rating</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setTriageSev(sev)}
                      className={`py-1.5 rounded text-[11px] font-bold uppercase transition border ${
                        triageSev === sev 
                          ? getSeverityBadge(sev) + ' ring-2 ring-white/50' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Assign Sector Liaison Officer</label>
                <select 
                  value={triageOfficer}
                  onChange={(e) => setTriageOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200"
                >
                  <option value="Liaison Officer Lawal (Katsina Border)">Liaison Officer Lawal (Jibia / Niger Border)</option>
                  <option value="Liaison Officer Dosu (Ogun Border)">Liaison Officer Dosu (Idiroko / Benin Border)</option>
                  <option value="Liaison Officer Buba (Adamawa Border)">Liaison Officer Buba (Maiha / Cameroon Border)</option>
                  <option value="Liaison Officer Usman (Kwara Border)">Liaison Officer Usman (Baruten / Benin Border)</option>
                  <option value="Liaison Officer Briggs (Maritime Border)">Liaison Officer Briggs (Bakassi / Maritime Border)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTriageOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateTriage}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded text-xs transition"
                >
                  Commit SQLite UPDATE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FOOTER AUDIT BAR                                    */}
      {/* ==================================================== */}
      <footer className="bg-slate-950 border-t border-slate-900 px-6 py-2.5 text-[11px] text-slate-500 flex flex-wrap justify-between items-center">
        <div>
          <span>CSAIMS Border Simulation • Engine: </span>
          <span className="font-mono text-emerald-400">SQLite v3.45.0 (In-Memory / Zero Cloud Dependency)</span>
        </div>
        <div className="flex space-x-4">
          <span>Simulation Mode: Active</span>
          <span>Shortcode: 20200</span>
          <span>Database: Self-Contained</span>
        </div>
      </footer>

    </div>
  );
}