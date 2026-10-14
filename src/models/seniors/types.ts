export type SeniorRelationship =
  | 'grandfather'
  | 'grandmother'
  | 'father'
  | 'mother'
  | 'relative'
  | 'other';

export type CreateSeniorInput = {
  fullName: string;
  birthYear: number;
  relationship: SeniorRelationship;
  relationshipOther?: string;
  // Local preview URI in the demo session; never treated as a durable uploaded URL.
  avatarUri?: string;
  chronicConditions: string[];
  chronicConditionOther?: string;
  medicalNotes?: string;
  // Demo preference only. It does not configure a recipient or send SOS notifications.
  isPrimarySosContact: boolean;
};

export type Senior = CreateSeniorInput & {
  id: string;
  ownerId: string;
  createdAt: string;
};
