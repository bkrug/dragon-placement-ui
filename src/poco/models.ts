export class Assignment {
  assignmentId: number = 0;
  jobId: number = 0;
  dragonId: number = 0;
  jobs: Job[] = [];
}

export class Dragon {
  dragonId: number = 0;
  givenName: string = '';
  familyName: string | null = null;
  canBreathFire: boolean = false;
  canTakePassengers: boolean = false;
  weightInKg: number = 0;
  lengthInMeters: number = 0;
  fightingSkills: string | null = null;
  assignments: Assignment[] = [];
}

export class Job {
  jobId: number = 0;
  jobTitle: string = '';
  employerName: string = '';
  filledPositions: number = 0;
  numberOfPositions: number = 0;
  startDateUnix: number = 0;
  endDateUnix: number = 0;
}

export class DisplayJob {
  jobId: number = 0;
  jobTitle: string = '';
  employerName: string = '';
  openPositions: number = 0;
  numberOfPositions: number = 0;
  openDescription: string = '';
  startDate: Date = new Date(0);
  endDate: Date = new Date(0);
}
