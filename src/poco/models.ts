export class Assignment {
  assignmentId: number = 0;
  jobId: number = 0;
  dragonId: number = 0;
  job: Job = new Job();
  startDateUnix: number = 0;
  endDateUnix: number | null = null;
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

export class DragonValidationFailures {
  givenName: string = '';
  weightInKg: string = '';
  lengthInMeters: string = '';
  fightingSkills: string = '';
}

export class JobValidationFailures {
  jobTitle: string = '';
  numberOfPositions: string = '';
}

export class Job {
  jobId: number = 0;
  jobTitle: string = '';
  employerName: string = '';
  filledPositions: number = 0;
  numberOfPositions: number = 0;
  startDateUnix: number = 0;
  endDateUnix: number = 0;
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

export class HoursWorkedValidationFailures {
  startDateTimeUnix: string = '';
  endDateTimeUnix: string = '';
}

export class HoursWorked {
  hoursWorkedId: number = 0;
  assignmentId: number = 0;
  dragonId: number = 0;
  startDateTimeUnix: number = 0;
  endDateTimeUnix: number = 0;
}