import R from 'ramda';
import { basename, dirname } from 'path';

/**
 * toPascal :: String -> String
 */
export const toPascal = R.converge(R.concat, [
  R.pipe(R.head, R.toUpper),
  R.tail
]);

/**
 * getModelKey :: String -> String
 */
export const getModelKey = R.converge(R.concat, [
  R.pipe(R.head, R.toLower),
  R.tail
]);

/**
 * extractPageName :: String -> String
 */
export const extractNameFromFile = R.pipe(dirname, basename);

/**
 * getActionKey :: String -> String
 */
export const getActionKey = R.pipe(
  R.split(/(?=[A-Z])/),
  R.map(R.toUpper),
  R.join('_')
);
