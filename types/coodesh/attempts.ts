export interface ResultsRow {
  id: string;
  participationId: string;
  assessmentName: string;
  participant: string;
  email: string;
  assessmentStatus: string;
  assessmentScore: number;
  assessmentStartedAt: string;
  assessmentFinishedAt: string;
  assessmentDurationMinutes: number;
  link: string;
  challenge: string;
  challengeType: string;
  challengeScore: number;
  challengeStatus: string;
  challengeSubmittedAt: number;
  challengeDurationMinutes: number;
  challengeLink: string;
  likertPlatformExperience: string;
  likertLevelMatching: string;
  feedbackPlatformExperience: string;
  feedbackLevelMatching: string;
  settingsWeight: string;
  settingsVideo: string;
  feedback: string;
}

export interface IntegrityRow {
  timestamp: string;
  participationId: string;
  assessmentName: string;
  participant: string;
  email: string;
  challenge: string;
  challengeType: string;
  eventType: string;
  deviceType: string;
  operatingSystem: string;
  browser: string;
  browserVersion: string;
  hash: string;
  hasCamera: string;
  ipAddress: string;
  location: string;
  country: string;
  question?: string;
  answer?: string;
  suspect?: string;
  oS?: string;
  created?: string;
}

export interface ActionPlanRow {
  id: string;
  participationId: string;
  assessmentName: string;
  participant: string;
  email: string;
  assessmentStatus: string;
  assessmentScore: number;
  assessmentStartedAt: string;
  assessmentFinishedAt: string;
  assessmentDurationMinutes: number;
  link: string;
  challenge: string;
  question: string;
  challengeType: string;
  challengeScore: number;
  challengeStatus: string;
  challengeSubmittedAt: string;
  challengeDurationMinutes: number;
  challengeLink: string;
  actionPlan: string;
  actionPlanText: string;
}

export interface ParticipantData {
  email: string;
  name: string;
  results: ResultsRow[];
  integrityEvents: IntegrityRow[];
  actionPlans: ActionPlanRow[];
}
