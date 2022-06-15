import { LEVELS } from '../constants';

function getLevel(reputation) {
  return LEVELS.findIndex(step => reputation < step);
}

function getReputationToNextLevel(reputation) {
  const nextLevel = getLevel(reputation) + 1;
  return LEVELS[nextLevel] - reputation;
}

export { getLevel, getReputationToNextLevel };
