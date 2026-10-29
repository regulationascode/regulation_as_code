export type TimingBranch = 'facility' | 'off-sd' | 'off-non-sd';
export type ReportTiming = 'on-time' | 'late';

export const DEMO_EXECUTION_DATE = '2026-11-04';
export const DEMO_BRANCH_DAYS: Record<TimingBranch, number> = {
  facility: 1,
  'off-sd': 1,
  'off-non-sd': 2,
};

export type DemoTimingResult = {
  deadline: string;
  reportDate: string;
  timingPass: boolean;
};

// Prototype calendar helper: skips weekends only, not legal or market holidays.
export function addWeekdays(startDate: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new RangeError('startDate must use YYYY-MM-DD format.');
  }
  if (!Number.isSafeInteger(days) || days < 0) {
    throw new RangeError('days must be a non-negative integer.');
  }

  const date = new Date(`${startDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== startDate) {
    throw new RangeError('startDate must be a valid calendar date.');
  }

  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) remaining--;
  }
  return date.toISOString().slice(0, 10);
}

export function evaluateDemoTiming(branch: TimingBranch, reportTiming: ReportTiming): DemoTimingResult {
  const businessDays = DEMO_BRANCH_DAYS[branch];
  if (businessDays === undefined) throw new RangeError(`Unsupported demo branch: ${branch}`);
  if (reportTiming !== 'on-time' && reportTiming !== 'late') {
    throw new RangeError(`Unsupported report timing: ${reportTiming}`);
  }

  const deadline = addWeekdays(DEMO_EXECUTION_DATE, businessDays);
  const reportDate = addWeekdays(DEMO_EXECUTION_DATE, businessDays + (reportTiming === 'late' ? 1 : 0));
  return { deadline, reportDate, timingPass: reportDate <= deadline };
}
