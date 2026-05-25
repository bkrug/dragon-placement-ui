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