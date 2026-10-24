import * as migration_20261024_070442_initial from './20261024_070442_initial';

export const migrations = [
  {
    up: migration_20261024_070442_initial.up,
    down: migration_20261024_070442_initial.down,
    name: '20261024_070442_initial'
  },
];
