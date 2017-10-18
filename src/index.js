import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import ini from 'ini';
import yaml from 'js-yaml';

export default (firstConfigPath, secondConfigPath) => {
  const firstConfig = fs.readFileSync(firstConfigPath, 'utf8');
  const secondConfig = fs.readFileSync(secondConfigPath, 'utf8');
  const format = path.extname(firstConfigPath);
  const parse = {
    '.json': JSON.parse,
    '.yml': yaml.safeLoad,
    '.ini': ini.parse,
  };

  const firstConfigContent = parse[format](firstConfig);
  const secondConfigContent = parse[format](secondConfig);

  const unionKeys = _.union(Object.keys(firstConfigContent), Object.keys(secondConfigContent));
  const totalDiffObj = unionKeys.reduce((acc, key) => {
    if (firstConfigContent[key] === secondConfigContent[key]) {
      return acc.concat(`  ${key}: ${firstConfigContent[key]}`);
    } if (!firstConfigContent[key]) {
      return acc.concat(`+ ${key}: ${secondConfigContent[key]}`);
    } if (!secondConfigContent[key]) {
      return acc.concat(`- ${key}: ${firstConfigContent[key]}`);
    }
    return acc.concat(`+ ${key}: ${secondConfigContent[key]}`, `- ${key}: ${firstConfigContent[key]}`);
  }, []);
  const totalDiffStr = ['{', ...totalDiffObj, '}'].join('\n');

  return totalDiffStr;
};
