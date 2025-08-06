export interface Player {
  id: string;
  name: string;
  position: Position;
  jerseyNumber: number;
  preferredFoot: 'left' | 'right' | 'both';
  skills: string[];
}

export interface Position {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export interface Formation {
  id: string;
  name: string;
  positions: FormationPosition[];
}

export interface FormationPosition {
  id: string;
  x: number;
  y: number;
  position: Position;
  playerId?: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  date: Date;
  duration: number;
  type: 'training' | 'match';
  activities: Activity[];
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  duration: number;
  description: string;
  category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown';
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  activities: Activity[];
  category: string;
}