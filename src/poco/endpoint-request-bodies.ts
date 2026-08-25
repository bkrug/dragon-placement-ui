export class DragonCreateEdit {
  givenName: string = '';
  familyName: string | null = null;
  weightInKg: number | null = null;
  lengthInMeters: number | null = null;
  fightingSkills: string | null = null;
  skillTagIds: number[] = [];
}

export class JobCreateEdit {
  jobTitle: string = '';
  employerName: string = '';
  numberOfPositions: number = 0;
  startDate: string = '';
  endDate: string = '';
  skillTagIds: number[] = [];
}

export class ValidPaySpan {
  startDate: string = '';
  endDate: string = '';
}

export class HoursWorkedCreateEdit {
  startDateTime: string = '';
  endDateTime: string = '';
}

export class PayPeriodCreateEdit {
  assignmentId: number = 0;
  startDate: string = '';
  endDate: string = '';
  submissionStatus: string = '';
  hoursWorked: HoursWorkedCreateEdit[] = [];
}

export class HoursWorkedView {
  startDateTime: string = '';
  endDateTime: string = '';
}

export class PayPeriodView {
  assignmentDescription: string = '';
  dragonName: string = '';
  assignmentId: number = 0;
  startDate: string = '';
  endDate: string = '';
  submissionStatus: string = '';
  hoursWorked: HoursWorkedView[] = [];
}

export class WorkRequestCreateEdit {
  name: string = '';
  description: string = '';
  estimatedStartDate: string = '';
  estimatedEndDate: string = '';
  estimatedWorkforceSize: number = 0;
}

export class CreateCustomerAndWorkRequest {
  customerName: string = '';
  workRequestName: string = '';
  description: string = '';
  estimatedStartDate: string = '';
  estimatedEndDate: string = '';
  estimatedWorkforceSize: number = 0;
}