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
  startDateUnix: number = 0;
  endDateUnix: number = 0;
  skillTagIds: number[] = [];
}

export class ValidPaySpan {
  startDate: string = '';
  endDate: string = '';
}

export class HoursWorkedCreateEditNew {
  startDateTime: string = '';
  endDateTime: string = '';
}

export class PayPeriodCreateEditNew {
  assignmentId: number = 0;
  dragonId: number = 0;
  startDate: string = '';
  endDate: string = '';
  submissionStatus: string = '';
  hoursWorked: HoursWorkedCreateEditNew[] = [];
}

export class HoursWorkedView {
  startDateTime: string = '';
  endDateTime: string = '';
}

export class PayPeriodView {
  assignmentDescription: string = '';
  dragonName: string = '';
  assignmentId: number = 0;
  dragonId: number = 0;
  startDate: string = '';
  endDate: string = '';
  submissionStatus: string = '';
  hoursWorked: HoursWorkedView[] = [];
}