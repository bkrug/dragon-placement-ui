import { Assignment, DisplayAssignment, DisplayDragon, DisplayJob, Dragon, Job } from '../poco/models';

export const mapJobToDisplayJob = (source: Job) => {
  const startDate = new Date(getUnixSeconds(source.startDate) * 1000);
  const endDate = new Date(getUnixSeconds(source.endDate) * 1000);
  const openPositions = source.numberOfPositions - source.filledPositions;
  const openDescription =
    openPositions === 0 ? 'Filled'
    : openPositions < 0 ? `${openPositions} of ${source.numberOfPositions} (overfilled)`
    : `${openPositions} of ${source.numberOfPositions}`;
  return {
    jobId: source.jobId,
    jobTitle: source.jobTitle,
    employerName: source.employerName,
    numberOfPositions: source.numberOfPositions,
    openPositions: openPositions,
    openDescription: openDescription,
    startDate: startDate,
    endDate: endDate,
    skillTags: source.skillTags
  } as DisplayJob;
};

export const mapDragonToDisplayDragon = (source: Dragon) => {
  return {
    dragonId: source.dragonId,
    givenName: source.givenName,
    familyName: source.familyName,
    weightInKg: source.weightInKg,
    lengthInMeters: source.lengthInMeters,
    fightingSkills: source.fightingSkills,
    assignments: source.assignments.map(mapAssigmentToDisplayAssignment),
    skillTags: source.skillTags
  } as DisplayDragon
}

export const mapAssigmentToDisplayAssignment = (source: Assignment) => {
  const startDate = new Date(getUnixSeconds(source.startDate) * 1000);
  const endDate = source.endDate == null ? null : new Date(getUnixSeconds(source.endDate) * 1000);
  return {
    assignmentId: source.assignmentId,
    jobId: source.jobId,
    dragonId: source.dragonId,
    startDate: startDate,
    endDate: endDate,
    job: mapJobToDisplayJob(source.job)
  } as DisplayAssignment;
};

const isoDateRegex = /^(?:\d{4})-(?:\d{1,2})-(?:\d{1,2})/

export function getUnixSeconds(sourceDate: string | Date | null | undefined) {
  if (sourceDate instanceof Date) {
    return Math.floor(sourceDate.getTime() / 1000)
  }
  else if (typeof sourceDate === 'string') {
    const matches = sourceDate.match(isoDateRegex);
    if (matches === null || matches.length === 0) {
      return 0;
    }
    else {
      const parts = matches[0].split('-').map(s => parseInt(s, 10));
      return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 1000);
    }
  }
  else {
    return 0;
  }
}

export function getDateFromDateTimeString(dateTimeString: string): string {
  const match = dateTimeString.match(isoDateRegex);
  return match ? match[0] : '';
}

export function getTimeFromDateTimeString(dateTimeString: string): string {
  const match = dateTimeString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : '';
}