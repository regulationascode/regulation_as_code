export const scenarioRoles = [
  { key: 'legal', label: 'Legal', measured: true },
  { key: 'compliance', label: 'Compliance', measured: true },
  { key: 'operations', label: 'Reporting / operations', measured: true },
  { key: 'engineering', label: 'Engineering', measured: true },
  { key: 'review', label: 'Review / release', measured: false },
] as const;

export type ScenarioRole = (typeof scenarioRoles)[number]['key'];
export type ScenarioValues = {
  workItems: string;
  setup: string;
  maintenance: string;
  hardSavings: string;
  low: string;
  planning: string;
  high: string;
} & Record<`hours_${ScenarioRole}` | `rate_${ScenarioRole}`, string>;

export type MeasuredRole = {
  baselinePerItem: number;
  pilotPerItem: number;
};

export type MeasuredInput = {
  comparableWorkItems: number;
  roles: Partial<Record<ScenarioRole, MeasuredRole>>;
};

export type ScenarioResult = {
  annualBaselineHours: number;
  annualBaselineLaborValue: number;
  annualHardDollarSavings: number;
  annualMaintenanceCost: number;
  setupCost: number;
  cases: Record<'low' | 'planning' | 'high', { releasedHours: number; capacityValue: number; annualEconomicValue: number; firstYearEconomicValue: number }>;
  annualCashImpact: number;
  firstYearCashImpact: number;
  paybackYears: number | null;
};

export type MeasuredResult = {
  roles: { role: ScenarioRole; hoursReleased: number; capacityValue: number }[];
  observedCapacityValue: number;
  cashImpact: number;
  economicValue: number;
};

export function parseNonnegative(value: string, max?: number): number | null {
  if (value.trim() === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (max !== undefined && number > max)) return null;
  return number;
}

export function calculateScenario(values: ScenarioValues): ScenarioResult | null {
  const workItems = parseNonnegative(values.workItems);
  const setup = parseNonnegative(values.setup);
  const maintenance = parseNonnegative(values.maintenance);
  const hardSavings = parseNonnegative(values.hardSavings);
  const low = parseNonnegative(values.low, 100);
  const planning = parseNonnegative(values.planning, 100);
  const high = parseNonnegative(values.high, 100);
  if ([workItems, setup, maintenance, hardSavings, low, planning, high].some(value => value === null) ||
      workItems === 0 || !Number.isInteger(workItems) || low! > planning! || planning! > high!) return null;
  const roleInputs = scenarioRoles.map(({ key }) => ({
    hours: parseNonnegative(values[`hours_${key}`]),
    rate: parseNonnegative(values[`rate_${key}`]),
  }));
  if (roleInputs.some(role => role.hours === null || role.rate === null)) return null;
  const annualBaselineHours = roleInputs.reduce((sum, role) => sum + role.hours! * workItems!, 0);
  const annualBaselineLaborValue = roleInputs.reduce((sum, role) => sum + role.hours! * role.rate! * workItems!, 0);
  const capacity = (reduction: number) => roleInputs.reduce((sum, role) => sum + role.hours! * role.rate! * workItems! * reduction / 100, 0);
  const released = (reduction: number) => roleInputs.reduce((sum, role) => sum + role.hours! * workItems! * reduction / 100, 0);
  const cases = {
    low: { releasedHours: released(low!), capacityValue: capacity(low!), annualEconomicValue: capacity(low!) + hardSavings! - maintenance!, firstYearEconomicValue: capacity(low!) + hardSavings! - maintenance! - setup! },
    planning: { releasedHours: released(planning!), capacityValue: capacity(planning!), annualEconomicValue: capacity(planning!) + hardSavings! - maintenance!, firstYearEconomicValue: capacity(planning!) + hardSavings! - maintenance! - setup! },
    high: { releasedHours: released(high!), capacityValue: capacity(high!), annualEconomicValue: capacity(high!) + hardSavings! - maintenance!, firstYearEconomicValue: capacity(high!) + hardSavings! - maintenance! - setup! },
  };
  const cashMargin = hardSavings! - maintenance!;
  const result: ScenarioResult = {
    annualBaselineHours,
    annualBaselineLaborValue,
    annualHardDollarSavings: hardSavings!,
    annualMaintenanceCost: maintenance!,
    setupCost: setup!,
    cases,
    annualCashImpact: cashMargin,
    firstYearCashImpact: cashMargin - setup!,
    paybackYears: cashMargin > 0 ? setup! / cashMargin : null,
  };
  const calculatedValues = [
    result.annualBaselineHours, result.annualBaselineLaborValue, result.annualHardDollarSavings,
    result.annualMaintenanceCost, result.setupCost, result.annualCashImpact, result.firstYearCashImpact,
    ...Object.values(result.cases).flatMap(item => [item.releasedHours, item.capacityValue, item.annualEconomicValue, item.firstYearEconomicValue]),
  ];
  return calculatedValues.every(Number.isFinite) && (result.paybackYears === null || Number.isFinite(result.paybackYears)) ? result : null;
}

export function calculateMeasured(
  input: MeasuredInput,
  rates: Partial<Record<ScenarioRole, number>>,
  hardSavings: number,
  implementationCost: number,
  maintenanceCost: number,
): MeasuredResult | null {
  if (!Number.isInteger(input.comparableWorkItems) || input.comparableWorkItems <= 0) return null;
  if ([hardSavings, implementationCost, maintenanceCost].some(value => !Number.isFinite(value) || value < 0)) return null;
  const roles = scenarioRoles.filter(({ key }) => input.roles[key] !== undefined);
  if (!roles.length || roles.some(({ key }) => {
    const rate = rates[key];
    const observation = input.roles[key];
    return typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0 ||
      !observation || !Number.isFinite(observation.baselinePerItem) || observation.baselinePerItem < 0 ||
      !Number.isFinite(observation.pilotPerItem) || observation.pilotPerItem < 0;
  })) return null;
  const results = roles.map(({ key }) => {
    const observation = input.roles[key]!;
    const hoursReleased = (observation.baselinePerItem - observation.pilotPerItem) * input.comparableWorkItems;
    return { role: key, hoursReleased, capacityValue: hoursReleased * rates[key]! };
  });
  const observedCapacityValue = results.reduce((sum, role) => sum + role.capacityValue, 0);
  const cashImpact = hardSavings - implementationCost - maintenanceCost;
  const economicValue = observedCapacityValue + cashImpact;
  return [...results.flatMap(role => [role.hoursReleased, role.capacityValue]), observedCapacityValue, cashImpact, economicValue].every(Number.isFinite)
    ? { roles: results, observedCapacityValue, cashImpact, economicValue }
    : null;
}
