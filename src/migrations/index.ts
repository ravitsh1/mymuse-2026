import * as migration_20261024_070442_initial from './20261024_070442_initial';
import * as migration_20261024_113802_project_credit from './20261024_113802_project_credit';
import * as migration_20261024_134505_home_word_image from './20261024_134505_home_word_image';
import * as migration_20261024_142607_home_texts from './20261024_142607_home_texts';
import * as migration_20261024_144054_home_texts_no_accessibility from './20261024_144054_home_texts_no_accessibility';
import * as migration_20261024_151500_project_texts from './20261024_151500_project_texts';
import * as migration_20261024_184818_legal_pages_cookie_notice from './20261024_184818_legal_pages_cookie_notice';
import * as migration_20261024_185623_project_accent_brand from './20261024_185623_project_accent_brand';
import * as migration_20261024_190500_project_accent_brand_rest from './20261024_190500_project_accent_brand_rest';
import * as migration_20261024_193000_recanati_accent_brand from './20261024_193000_recanati_accent_brand';
import * as migration_20261024_200000_3bears_new_screens from './20261024_200000_3bears_new_screens';
import * as migration_20261024_210000_gderot_new_screens from './20261024_210000_gderot_new_screens';
import * as migration_20261024_213000_gderot_mockup from './20261024_213000_gderot_mockup';
import * as migration_20261024_214000_hero_fit_portrait from './20261024_214000_hero_fit_portrait';
import * as migration_20261024_214500_3bears_mockup from './20261024_214500_3bears_mockup';

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
    name: '20261024_134505_home_word_image',
  },
  {
    up: migration_20261024_142607_home_texts.up,
    down: migration_20261024_142607_home_texts.down,
    name: '20261024_142607_home_texts',
  },
  {
    up: migration_20261024_144054_home_texts_no_accessibility.up,
    down: migration_20261024_144054_home_texts_no_accessibility.down,
    name: '20261024_144054_home_texts_no_accessibility',
  },
  {
    up: migration_20261024_151500_project_texts.up,
    down: migration_20261024_151500_project_texts.down,
    name: '20261024_151500_project_texts',
  },
  {
    up: migration_20261024_184818_legal_pages_cookie_notice.up,
    down: migration_20261024_184818_legal_pages_cookie_notice.down,
    name: '20261024_184818_legal_pages_cookie_notice',
  },
  {
    up: migration_20261024_185623_project_accent_brand.up,
    down: migration_20261024_185623_project_accent_brand.down,
    name: '20261024_185623_project_accent_brand',
  },
  {
    up: migration_20261024_190500_project_accent_brand_rest.up,
    down: migration_20261024_190500_project_accent_brand_rest.down,
    name: '20261024_190500_project_accent_brand_rest',
  },
  {
    up: migration_20261024_193000_recanati_accent_brand.up,
    down: migration_20261024_193000_recanati_accent_brand.down,
    name: '20261024_193000_recanati_accent_brand',
  },
  {
    up: migration_20261024_200000_3bears_new_screens.up,
    down: migration_20261024_200000_3bears_new_screens.down,
    name: '20261024_200000_3bears_new_screens',
  },
  {
    up: migration_20261024_210000_gderot_new_screens.up,
    down: migration_20261024_210000_gderot_new_screens.down,
    name: '20261024_210000_gderot_new_screens',
  },
  {
    up: migration_20261024_213000_gderot_mockup.up,
    down: migration_20261024_213000_gderot_mockup.down,
    name: '20261024_213000_gderot_mockup'
  },
  {
    up: migration_20261024_214000_hero_fit_portrait.up,
    down: migration_20261024_214000_hero_fit_portrait.down,
    name: '20261024_214000_hero_fit_portrait',
  },
  {
    up: migration_20261024_214500_3bears_mockup.up,
    down: migration_20261024_214500_3bears_mockup.down,
    name: '20261024_214500_3bears_mockup',
  },
];
