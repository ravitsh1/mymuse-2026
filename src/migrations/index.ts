import * as migration_20261024_070442_initial from './20261024_070442_initial';
import * as migration_20261024_113802_project_credit from './20261024_113802_project_credit';
import * as migration_20261024_134505_home_word_image from './20261024_134505_home_word_image';

export const migrations = [
  {
    up: migration_20261024_070442_initial.up,
    down: migration_20261024_070442_initial.down,
    name: '20261024_070442_initial',
  },
  {
    up: migration_20261024_113802_project_credit.up,
    down: migration_20261024_113802_project_credit.down,
    name: '20261024_113802_project_credit',
  },
  {
    up: migration_20261024_134505_home_word_image.up,
    down: migration_20261024_134505_home_word_image.down,
    name: '20261024_134505_home_word_image'
  },
];
