import deburr from 'lodash.deburr';
import { compose, toUpper } from 'ramda';

export const normalizeString = compose(deburr, toUpper);
