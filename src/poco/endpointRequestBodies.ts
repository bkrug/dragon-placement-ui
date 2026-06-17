export class DragonCreateEdit {
  givenName: string = '';
  familyName: string | null = null;
  weightInKg: number | null = null;
  lengthInMeters: number | null = null;
  fightingSkills: string | null = null;
  skillTagIds: number[] = [];
}

export class HoursWorkedCreateEdit {
  assignmentId: number = 0;
  dragonId: number = 0;
  startDateTimeUnix: number = 0;
  endDateTimeUnix: number = 0;
}

export class HoursWorkedWithJob {
  hoursWorkedId: number = 0;
  assignmentId: number = 0;
  dragonId: number = 0;
  startDateTimeUnix: number = 0;
  endDateTimeUnix: number = 0;
  jobTitle: string = '';
  employerName: string | null = null;
}

export class JobCreateEdit {
  jobTitle: string = '';
  employerName: string = '';
  numberOfPositions: number = 0;
  startDateUnix: number = 0;
  endDateUnix: number = 0;
  skillTagIds: number[] = [];
}