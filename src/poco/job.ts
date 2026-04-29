export default class Job {
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

