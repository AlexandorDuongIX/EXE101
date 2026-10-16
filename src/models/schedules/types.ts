export type ScheduleKind = 'medication' | 'appointment';

type ScheduleRecipient = {
  seniorId: string;
};

export type MedicationScheduleInput = ScheduleRecipient & {
  kind: 'medication';
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
};

export type AppointmentScheduleInput = ScheduleRecipient & {
  kind: 'appointment';
  title: string;
  facility: string;
  doctor?: string;
  date: string;
  time: string;
  notes?: string;
};

export type ScheduleInput = MedicationScheduleInput | AppointmentScheduleInput;

export type CareSchedule = ScheduleInput & {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleSenior = Readonly<{
  id: string;
  ownerId: string;
  fullName: string;
}>;

export interface ScheduleRepository {
  list(): readonly CareSchedule[];
  create(input: ScheduleInput): CareSchedule;
  update(id: string, input: ScheduleInput): CareSchedule;
  remove(id: string): void;
}
