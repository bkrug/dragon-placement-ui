import Job from "./job";

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
