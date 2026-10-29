import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addWeekdays,
  DEMO_EXECUTION_DATE,
  evaluateDemoTiming,
} from '../src/rule-timing.ts';

const branches = [
  { branch: 'facility', deadline: '2026-11-05', lateDate: '2026-11-06' },
  { branch: 'off-sd', deadline: '2026-11-05', lateDate: '2026-11-06' },
  { branch: 'off-non-sd', deadline: '2026-11-06', lateDate: '2026-11-09' },
];

test('demo execution date is the declared synthetic Wednesday', () => {
  assert.equal(DEMO_EXECUTION_DATE, '2026-11-04');
});

for (const { branch, deadline, lateDate } of branches) {
  test(`${branch}: an on-time synthetic report meets its selected deadline`, () => {
    assert.deepEqual(evaluateDemoTiming(branch, 'on-time'), {
      deadline,
      reportDate: deadline,
      timingPass: true,
    });
  });

  test(`${branch}: the next synthetic weekday is after its selected deadline`, () => {
    assert.deepEqual(evaluateDemoTiming(branch, 'late'), {
      deadline,
      reportDate: lateDate,
      timingPass: false,
    });
  });
}

test('weekday-only calendar skips Saturday and Sunday', () => {
  assert.equal(addWeekdays('2026-11-06', 1), '2026-11-09');
});

test('rejects invalid dates and day offsets', () => {
  assert.throws(() => addWeekdays('2026-02-30', 1), RangeError);
  assert.throws(() => addWeekdays('2026-11-04', -1), RangeError);
  assert.throws(() => addWeekdays('2026-11-04', 1.5), RangeError);
});
