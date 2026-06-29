export type ValidationFailures = {
  fieldFailures: { [key: string]: string };
  gridRowFailures: { [key: string]: GridRowValidationFailures[] };
}

export type GridRowValidationFailures = ValidationFailures & {
  index: number;
  rowValidationMessage: string;
}

