export type Constructor<T> = {
  new (...args: any[]): T;
};

// Test panel results

export type TestResultsTabStatus = {
  is_open: boolean;
  is_disabled: boolean;
  count: number;
};

export enum TestResultsTabType {
  errors = 0,
  actions = 1,
  variables = 2,
}

export enum RuleDetailsTabsType {
  properties = 0,
  where = 1,
  with = 2,
  actions = 3,
}
