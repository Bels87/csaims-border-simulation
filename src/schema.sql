-- ============================================================================
-- CSAIMS BORDER THREAT SIMULATION: SQLITE 3 RELATIONAL SCHEMA
-- Database: csaims_border.db (Embedded / In-Memory / Self-Contained)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS & OPERATIONAL ROLES
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SYSTEM_ADMIN', 'OPERATOR', 'LIAISON_OFFICER', 'AGENCY_REP', 'STAKEHOLDER_VIEWER', 'COMMUNITY_REPORTER')),
    agency_affiliation TEXT,
    phone_masked TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. CENTRAL BORDER INCIDENT REGISTER
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    raw_message TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN (
        'Arms Trafficking', 
        'Irregular Migration', 
        'Suspicious Movement', 
        'Contraband Smuggling', 
        'Cross-Border Incursion / Banditry', 
        'Illegal Border Checkpoint', 
        'Border Pillar Tampering', 
        'Human Trafficking'
    )),
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'ACKNOWLEDGED', 'TRIAGED', 'UNDER_INVESTIGATION', 'REFERRED_TO_AGENCY', 'RESOLVED', 'CLOSED')),
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'UNVERIFIED', 'INCONCLUSIVE', 'FALSE_REPORT')),
    
    -- Granular Border Location Model
    village TEXT NOT NULL,
    ward TEXT NOT NULL,
    lga TEXT NOT NULL,
    state TEXT NOT NULL,
    nearest_landmark TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_confidence TEXT NOT NULL DEFAULT 'Reported Landmark',
    
    -- Temporal Observation by Citizen
    time_of_observation TEXT NOT NULL,
    
    -- Reporter Details
    reporter_phone TEXT NOT NULL,
    is_anonymous INTEGER NOT NULL DEFAULT 0 CHECK(is_anonymous IN (0, 1)),
    
    -- Operational Timestamps
    received_at TEXT DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TEXT,
    triaged_at TEXT,
    verified_at TEXT,
    resolved_at TEXT,
    
    -- Field & Agency Assignments
    assigned_liaison TEXT,
    assigned_agency TEXT,
    closing_notes TEXT
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_lga_state ON incidents(lga, state);

-- 3. SIMULATED 2-WAY SHORTCODE SMS LOGS (20200)
CREATE TABLE IF NOT EXISTS simulated_sms (
    id TEXT PRIMARY KEY,
    incident_id TEXT,
    sender_number TEXT NOT NULL,
    short_code TEXT NOT NULL DEFAULT '20200',
    direction TEXT NOT NULL CHECK(direction IN ('INCOMING', 'OUTGOING_ACK', 'OUTGOING_FEEDBACK')),
    body TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'DELIVERED_DEMO',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- 4. SECTOR LIAISON RECONNAISSANCE & VERIFICATION REPORTS
CREATE TABLE IF NOT EXISTS verification_reports (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    liaison_name TEXT NOT NULL,
    status_outcome TEXT NOT NULL CHECK(status_outcome IN ('VERIFIED', 'INCONCLUSIVE', 'FALSE_REPORT')),
    recon_method TEXT NOT NULL,
    findings_summary TEXT NOT NULL,
    simulated_attachment TEXT,
    verified_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- 5. TRANSNATIONAL BORDER INTELLIGENCE RECORDS
CREATE TABLE IF NOT EXISTS border_intelligence (
    id TEXT PRIMARY KEY,
    ref_code TEXT NOT NULL UNIQUE,
    frontier_sector TEXT NOT NULL,
    category TEXT NOT NULL,
    threat_pattern TEXT NOT NULL,
    severity TEXT NOT NULL,
    similarity_score INTEGER NOT NULL,
    recorded_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. INTER-AGENCY REFERRAL LOGS (NIS, NCS, JBPT, POLICE)
CREATE TABLE IF NOT EXISTS agency_referrals (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    action_note TEXT NOT NULL,
    dispatch_status TEXT NOT NULL DEFAULT 'DISPATCHED_DEMO',
    referred_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- 7. IMMUTABLE SECURITY AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    incident_ref TEXT,
    action_type TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA: 20 NIGERIAN BORDER INCIDENTS WITH EXACT FRONTIER LANDMARKS
-- ============================================================================

INSERT OR REPLACE INTO incidents (
    id, reference_number, raw_message, category, severity, status, verification_status,
    village, ward, lga, state, nearest_landmark, latitude, longitude,
    time_of_observation, reporter_phone, is_anonymous, received_at, acknowledged_at, triaged_at, assigned_liaison, assigned_agency
) VALUES 
('bdr-01', 'CSAIMS-2026-BDR-00001', '4 motorbikes carrying wrapped sack parcels shaped like disassembled rifles bypassing customs gate via bush track.', 'Arms Trafficking', 'CRITICAL', 'TRIAGED', 'IN_PROGRESS', 'Magama', 'Jibia Ward A', 'Jibia', 'Katsina', '400m West of International Border Pillar 14', 13.0950, 7.2210, '2026-10-21 21:15 WAT', '+234-803-***-8812', 0, '2026-10-21 21:18:20', '2026-10-21 21:18:45', '2026-10-21 21:25:00', 'Liaison Officer Lawal (Katsina Border)', 'Joint Border Patrol Team (JBPT Demo)'),
('bdr-02', 'CSAIMS-2026-BDR-00002', 'Covered canvas truck offloading 28 undocumented foreign nationals into hidden staging orchard.', 'Irregular Migration', 'HIGH', 'REFERRED_TO_AGENCY', 'VERIFIED', 'Ajegunle', 'Idiroko Ward', 'Ipokia', 'Ogun', 'Behind abandoned cocoa warehouse, Old Customs Outpost', 6.6340, 2.7420, '2026-10-21 23:40 WAT', '+234-802-***-4419', 0, '2026-10-21 23:44:10', '2026-10-21 23:44:35', '2026-10-21 23:55:00', 'Liaison Officer Dosu (Ogun Border)', 'Nigeria Immigration Service (NIS Demo)'),
('bdr-03', 'CSAIMS-2026-BDR-00003', 'Night convoy of 8 utility vehicles operating without headlights through dry riverbed crossing into Nigeria.', 'Suspicious Movement', 'HIGH', 'UNDER_INVESTIGATION', 'IN_PROGRESS', 'Sahuda', 'Konkol Ward', 'Maiha', 'Adamawa', 'Seasonal River Crossing, 1.2km from Cameroon Boundary', 9.9920, 13.2100, '2026-10-22 02:20 WAT', '+234-706-***-1100', 1, '2026-10-22 02:24:50', '2026-10-22 02:25:15', '2026-10-22 02:40:00', 'Liaison Officer Buba (Adamawa Border)', NULL),
('bdr-04', 'CSAIMS-2026-BDR-00004', 'Wooden longboats ferrying modified drums of petroleum products across maritime creek into foreign waters.', 'Contraband Smuggling', 'MEDIUM', 'REFERRED_TO_AGENCY', 'VERIFIED', 'Ikang', 'Ikang Central Ward', 'Bakassi', 'Cross River', 'Unofficial Mangrove Jetty behind Fish Market', 4.7710, 8.5320, '2026-10-21 19:30 WAT', '+234-814-***-9012', 0, '2026-10-21 19:35:00', '2026-10-21 19:35:30', '2026-10-21 19:50:00', 'Liaison Officer Briggs (Maritime Border)', 'Nigeria Customs Service (NCS Demo)'),
('bdr-05', 'CSAIMS-2026-BDR-00005', 'Unauthorised armed men mounting makeshift timber barrier collecting extortion tolls from cross-border traders.', 'Illegal Border Checkpoint', 'HIGH', 'TRIAGED', 'IN_PROGRESS', 'Chikanda', 'Yashikira Ward', 'Baruten', 'Kwara', '500m before Nigerian Border Control Post Arch', 9.4210, 3.0110, '2026-10-22 05:45 WAT', '+234-809-***-2234', 0, '2026-10-22 05:50:10', '2026-10-22 05:50:35', '2026-10-22 06:05:00', 'Liaison Officer Usman (Kwara Border)', NULL),
('bdr-06', 'CSAIMS-2026-BDR-00006', 'Group of 14 foreign nationals guided on foot through thick bush tracks avoiding biometric screening.', 'Irregular Migration', 'MEDIUM', 'ACKNOWLEDGED', 'PENDING', 'Pashi', 'Seme-Krake Ward', 'Badagry', 'Lagos', 'Unofficial footpath beside Seme Coconut Plantation', 6.3810, 2.7150, '2026-10-22 06:10 WAT', '+234-903-***-5511', 1, '2026-10-22 06:12:00', '2026-10-22 06:12:28', NULL, NULL, NULL),
('bdr-07', 'CSAIMS-2026-BDR-00007', 'Armed raiders on camels and horses crossing northern frontier into grazing reserve corridor.', 'Cross-Border Incursion / Banditry', 'CRITICAL', 'REFERRED_TO_AGENCY', 'VERIFIED', 'Gidan Akwai', 'Kalmalo Ward', 'Illela', 'Sokoto', 'Dry Valley Depression near Border Beacon 27', 13.7250, 5.3010, '2026-10-21 22:50 WAT', '+234-703-***-7722', 0, '2026-10-21 22:53:00', '2026-10-21 22:53:25', '2026-10-21 23:00:00', 'Liaison Officer Lawal (Katsina Border)', 'Police Border Patrol Unit (Demo)'),
('bdr-08', 'CSAIMS-2026-BDR-00008', 'Concealed metal crates offloaded from pirogue canoe into pickup truck under cover of darkness.', 'Arms Trafficking', 'CRITICAL', 'CLOSED', 'VERIFIED', 'Banki Waterpoint', 'Banki Ward', 'Bama', 'Borno', 'Banki Customs Secondary Crossing Point', 11.2510, 14.1480, '2026-10-22 01:10 WAT', '+234-802-***-9901', 0, '2026-10-22 01:14:00', '2026-10-22 01:14:25', '2026-10-22 01:20:00', 'Liaison Officer Buba (Adamawa Border)', 'Joint Border Patrol Team (JBPT Demo)'),
('bdr-09', 'CSAIMS-2026-BDR-00009', 'Concrete boundary beacon found dug out and shifted 15 meters inwards into Nigerian agricultural land.', 'Border Pillar Tampering', 'MEDIUM', 'RESOLVED', 'VERIFIED', 'Ilara', 'Ilara Ward', 'Imeko-Afon', 'Ogun', 'International Boundary Pillar 42', 7.4120, 2.7840, '2026-10-21 16:00 WAT', '+234-805-***-3344', 0, '2026-10-21 16:15:00', '2026-10-21 16:15:45', '2026-10-21 16:30:00', 'Liaison Officer Dosu (Ogun Border)', NULL),
('bdr-10', 'CSAIMS-2026-BDR-00010', 'Armed foreign irregular elements establishing temporary bivouac campsite near boundary ridge.', 'Suspicious Movement', 'HIGH', 'UNDER_INVESTIGATION', 'IN_PROGRESS', 'Sorau', 'Mubi North Ward', 'Mubi North', 'Adamawa', 'Hilltop Forest Footpath near Cameroon border ridge', 10.2710, 13.3100, '2026-10-21 17:45 WAT', '+234-818-***-1122', 1, '2026-10-21 17:50:00', '2026-10-21 17:50:35', '2026-10-21 18:05:00', 'Liaison Officer Buba (Adamawa Border)', NULL);

-- Seed Initial Intelligence Profiles
INSERT OR REPLACE INTO border_intelligence (id, ref_code, frontier_sector, category, threat_pattern, severity, similarity_score, recorded_date) VALUES
('intel-01', 'INTEL-BDR-NW-08', 'Jibia / Magama Sector (Katsina - Niger Frontier)', 'Arms Trafficking', 'Recurring high-speed motorbike convoys using Pillar 12-16 bypass corridors', 'CRITICAL', 93, '2026-10-12'),
('intel-02', 'INTEL-BDR-SW-04', 'Idiroko / Ajegunle Sector (Ogun - Benin Frontier)', 'Irregular Migration', 'Abandoned cocoa warehouses used as staging depots for undocumented travelers', 'HIGH', 89, '2026-10-08'),
('intel-03', 'INTEL-BDR-NE-14', 'Banki / Bama Sector (Borno - Cameroon Frontier)', 'Arms Trafficking', 'Night pirogues ferrying military munitions across El-Beid tributaries', 'CRITICAL', 91, '2026-09-29'),
('intel-04', 'INTEL-BDR-SS-02', 'Bakassi / Ikang Maritime Channel (Cross River)', 'Contraband Smuggling', 'Twin-engine modified timber boats carrying petroleum products into foreign waters', 'MEDIUM', 86, '2026-09-19');