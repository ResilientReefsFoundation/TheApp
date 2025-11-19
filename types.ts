

export interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

export type BleachingLevel = 'None' | 'Mild' | 'Medium' | 'Strong';

export interface HealthReport {
  id: string;
  date: string;
  healthPercentage: number; // 0-100
  notes: string;
  bleaching: BleachingLevel;
}

export interface GrowthReport {
  id: string;
  date: string;
  surfaceAreaM2: number; // in square meters
  volumeM3: number; // in cubic meters
}

export interface Site {
  id: string;
  name: string;
  photoUrl: string;
  isArchived?: boolean;
}

export interface CollectionZone {
  id: string;
  name: string;
  siteId: string;
  latitude?: number;
  longitude?: number;
  isArchived?: boolean;
}

export interface Anchor {
  id:string;
  name: string;
  siteId: string;
  latitude?: number;
  longitude?: number;
  isDeepwater?: boolean;
  depth?: number;
  isArchived?: boolean;
}

export interface Tree {
  id: string;
  number: number;
  anchorId: string;
  currentDepth: number; // in meters, e.g., 8, 10, 12...
  normalDepth: number; // in meters
  lastMovedDate?: string; // ISO string
  isArchived?: boolean;
}

export interface Float {
  id: string;
  name: string;
  treeId: string;
}

export interface TemperatureLogger {
  id: string;
  siteId: string;
  anchorId: string;
  depth: number;
}

export interface MaintenanceLog {
  id: string;
  timestamp: string;
  siteId: string;
  treeId: string;
  branchId?: string; // Optional: for branch-specific tasks
  target: 'Tree' | 'Branch'; // To distinguish the maintenance type
  tasks: string[];
  notes?: string;
}

export type Page = 'details' | 'addEditItems' | 'rules' | 'healthReports' | 'growthReports' | 'backupRestore' | 'reports' | 'speciesId' | 'archive' | 'notesToDo' | 'monitoring' | 'trees' | 'modelComparison' | 'sites' | 'anchors' | 'collectionZones' | 'branches' | 'environmental' | 'dashboard' | 'experiments' | 'treeShadeExperiment' | 'ropeOnRubbleExperiment' | 'squareRopeFrameExperiment' | 'cubeRopeFrameExperiment' | 'trends' | 'floatManagement';
export type AddEditSection = 'Sites' | 'Collection Zones' | 'Anchors' | 'Trees' | 'Branches' | 'Floats' | 'Rules';

export type RuleTarget = 'Site' | 'Collection Zone' | 'Anchor' | 'Tree' | 'Branch' | 'Float';
export type CheckType = 'Health Report' | 'Scan' | 'Check';

export interface Rule {
  id: string;
  target: RuleTarget;
  intervalMonths: number;
  checkType: CheckType;
}

export interface Species {
  id: string;
  genus: string;
  species: string;
  photos: Photo[];
  notes: string;
  externalLink?: string;
}

export type LogType = 'general' | 'movement' | 'maintenance' | 'monitoring';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  message: string;
  type: LogType;
}

export interface ToDoItem {
    id: string;
    text: string;
}

export interface VoiceNote {
    id: string;
    audioUrl: string;
    duration: number; // in seconds
}

export type ReminderStatus = 'overdue' | 'due';

export interface Reminder {
  branchId: string;
  branchFragmentId: string;
  site: string;
  tree: number;
  face: 1 | 2 | 3 | 4;
  position: number;
  message: string;
  dueDate: string;
  status: ReminderStatus;
}

export interface ScheduleItem {
  tree: Tree;
  fromDepth: number;
  toDepth: number;
}

export interface ExperimentReport {
  id: string;
  date: string;
  notes: string;
  controlTreeHealth: number; // Average health
  shadedTreeHealth: number; // Average health
  controlTreeBleachingCount: number;
  shadedTreeBleachingCount: number;
}

export interface TreeShadeExperiment {
  isActive: boolean;
  controlTreeId: string;
  shadedTreeId: string;
  shadeLevel: 30 | 50;
  startDate: string;
  reports: ExperimentReport[];
}

export interface ObservationReport {
  id: string;
  date: string;
  notes: string;
}

export interface LongTermStudy {
  isActive: boolean;
  startDate: string;
  reports: ObservationReport[];
}

export interface CoralBranch {
  id:string;
  fragmentId: string;
  genus: string;
  species: string;
  dateAdded: string; // ISO string format
  anchor: string;
  tree: number;
  face: 1 | 2 | 3 | 4;
  position: number;
  collectionZone: string;
  site: string;
  photos: Photo[];
  healthReports: HealthReport[];
  growthReports: GrowthReport[];
  isHeatTolerant?: boolean;
  isArchived?: boolean;
}

// --- Authentication Types ---
export type UserStatus = 'pending_verification' | 'pending_approval' | 'approved';

export interface User {
  id: string;
  email: string;
  password_hash: string; // In a real app, never store plain text passwords
  status: UserStatus;
}