export class Assignment {
  assignmentId: number = 0;
  jobId: number = 0;
  dragonId: number = 0;
  job: Job = new Job();
  startDate: string = '';
  endDate: string = '';
}

export class Dragon {
  dragonId: number = 0;
  givenName: string = '';
  familyName: string | null = null;
  weightInKg: number | null = null;
  lengthInMeters: number | null = null;
  fightingSkills: string | null = null;
  assignments: Assignment[] = [];
  skillTags: SkillTag[] = [];
}

export class Job {
  jobId: number = 0;
  jobTitle: string = '';
  employerName: string = '';
  filledPositions: number = 0;
  numberOfPositions: number = 0;
  startDate: string = '';
  endDate: string = '';
  skillTags: SkillTag[] = [];
}

export class DisplayDragon {
  dragonId: number = 0;
  givenName: string = '';
  familyName: string | null = null;
  weightInKg: number = 0;
  lengthInMeters: number = 0;
  fightingSkills: string | null = null;
  assignments: DisplayAssignment[] = [];
  skillTags: SkillTag[] = [];
}

export class DisplayAssignment {
  assignmentId: number = 0;
  jobId: number = 0;
  dragonId: number = 0;
  job: DisplayJob = new DisplayJob();
  startDate: Date = new Date(0);
  endDate: Date | null = null;
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
  skillTags: SkillTag[] = [];
}

export class SkillTag {
  skillTagId: number = 0;
  skillName: string = '';
}

export class HoursWorked {
  hoursWorkedId: number = 0;
  startDateTime: string = '';
  endDateTime: string = '';
  payPeriodId: number = 0;
}

export class PayPeriod {
  payPeriodId: number = 0;
  assignmentId: number = 0;
  dragonId: number = 0;
  startDate: string = '';
  endDate: string = '';
  submissionStatus: string = '';
  hoursWorked: HoursWorked[] = [];
}