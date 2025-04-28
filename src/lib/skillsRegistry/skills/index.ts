import { Skill } from '../types';
import exponentialFormSkill from './exponentialForm';
import matrixOperationsSkill from './matrixOperations';

// Check if imports are valid before using them
if (typeof exponentialFormSkill === 'undefined') {
  console.error("CRITICAL: Failed to import exponentialFormSkill from ./exponentialForm");
}
if (typeof matrixOperationsSkill === 'undefined') {
  console.error("CRITICAL: Failed to import matrixOperationsSkill from ./matrixOperations");
}

// Export all skills as an array, filtering out any potentially undefined imports
const allSkills: Skill[] = [
  matrixOperationsSkill,
  exponentialFormSkill
].filter(skill => typeof skill !== 'undefined');

// Add a check after filtering
if (allSkills.length < 2) {
    console.warn("Warning: Not all expected skills were loaded into the registry.", { matrix: !!matrixOperationsSkill, exp: !!exponentialFormSkill });
}

export default allSkills; 