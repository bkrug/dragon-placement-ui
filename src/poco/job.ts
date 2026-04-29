export default class Job {
  jobId: number = 0;
  jobTitle: string = '';
  employerName: string = '';
  numberOfPositions: number = 0;
  startDateUnix: number = 0;
  endDateUnix: number = 0;
  startDate: string = '';
  endDate: string = '';
}

export class DisplayJob {
  jobId: number = 0;
  jobTitle: string = '';
  employerName: string = '';
  numberOfPositions: number = 0;
  startDate: Date = new Date(0);
  endDate: Date = new Date(0);
  startDateString: string = '';
  endDateString: string = '';
}

