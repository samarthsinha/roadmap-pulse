// ─── Core domain types for the Engineering Operating System ───

export type Role = "em" | "pm" | "lead" | "engineer";
export type Confidence = "high" | "medium" | "low";
export type TrackStatus = "planning" | "active" | "blocked" | "complete";
export type ExecutionStatus = "on-track" | "at-risk" | "blocked";
export type DoraRating = "elite" | "high" | "medium" | "low";
export type Trend = "up" | "down" | "flat";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertCategory =
  | "capacity"
  | "risk"
  | "blocker"
  | "confidence"
  | "health"
  | "deadline";

export interface SkillLevel {
  skill: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface SkillRequirement {
  skill: string;
  minLevel: 1 | 2 | 3 | 4 | 5;
  headcount: number;
}

export interface Person {
  id: string;
  name: string;
  role: Role;
  team: string;
  skills: SkillLevel[];
  capacityPoints: number;
  allocatedPoints: number;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  status: TrackStatus;
  quarter: string;
  targetDate: string;
  ownerId: string;
  leadId: string;
  pmId: string;
  effortPoints: number;
  skillsRequired: SkillRequirement[];
  tags: string[];
}

export interface WeeklyUpdate {
  id: string;
  trackId: string;
  weekOf: string;
  progressPercent: number;
  confidence: Confidence;
  status: ExecutionStatus;
  accomplishments: string[];
  nextSteps: string[];
  blockers: string[];
  asks: string[];
  emNotes: string;
  pmNotes: string;
  leadNotes: string;
  updatedAt: string;
}

export interface MetricValue {
  value: number;
  unit: string;
  trend: Trend;
  previousValue?: number;
  rating?: DoraRating;
}

export interface DoraMetrics {
  period: string;
  deploymentFrequency: MetricValue;
  leadTimeForChanges: MetricValue;
  changeFailureRate: MetricValue;
  meanTimeToRestore: MetricValue;
}

export interface SpaceMetrics {
  period: string;
  satisfaction: MetricValue;
  performance: MetricValue;
  activity: MetricValue;
  collaboration: MetricValue;
  efficiency: MetricValue;
}

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  trackId?: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface WeeklySummary {
  weekOf: string;
  generatedAt: string;
  headline: string;
  trackSummaries: {
    trackId: string;
    trackName: string;
    status: ExecutionStatus;
    progressPercent: number;
    confidence: Confidence;
    highlight: string;
  }[];
  openAsks: { trackId: string; trackName: string; ask: string }[];
  blockers: { trackId: string; trackName: string; blocker: string }[];
  capacityUtilization: number;
  healthSnapshot: {
    doraOverall: DoraRating;
    spaceOverall: number;
  };
  alertCount: number;
}

export interface CapacitySnapshot {
  personId: string;
  personName: string;
  team: string;
  capacity: number;
  allocated: number;
  utilization: number;
  skills: string[];
}

export interface TrackPlanningView {
  track: Track;
  owner: Person;
  lead: Person;
  pm: Person;
  skillCoverage: {
    skill: string;
    required: number;
    available: number;
    gap: number;
  }[];
  capacityGap: number;
}

export interface LeadershipTrackRollup {
  track: Track;
  latestUpdate: WeeklyUpdate | null;
  owner: Person;
  openAsks: string[];
  openBlockers: string[];
}
