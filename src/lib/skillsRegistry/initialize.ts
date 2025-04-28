import {
  faCalculator,
  faFlask,
  faAtom,
  faSquareRootVariable
} from "@fortawesome/free-solid-svg-icons";
import SkillRegistry from './registry';
import { RegistryMetadata } from './types';
import allSkills from './skills/index'; // Correct path to the skills index

/**
 * Initialize the registry with default metadata and skills
 */
export function initializeRegistry(): SkillRegistry {
  // Create registry metadata
  const metadata: RegistryMetadata = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    categories: [
      { 
        id: "maths", 
        name: "Maths", 
        icon: faCalculator,
        description: "Mathematics skills covering algebra, calculus, and more",
      },
      { 
        id: "chemistry", 
        name: "Chemistry", 
        icon: faFlask,
        description: "Chemistry skills covering atomic structure, reactions, and more",
      },
      { 
        id: "physics", 
        name: "Physics", 
        icon: faAtom,
        description: "Physics skills covering mechanics, thermodynamics, and more",
      },
      { 
        id: "further_maths", 
        name: "Further Maths", 
        icon: faSquareRootVariable,
        description: "Advanced mathematics for deeper understanding",
      }
    ],
    examBoards: [
      { 
        id: "edexcel", 
        name: "Edexcel", 
        country: "UK", 
        level: "A-Level" 
      },
      { 
        id: "aqa", 
        name: "AQA", 
        country: "UK", 
        level: "A-Level" 
      },
      { 
        id: "ocr", 
        name: "OCR", 
        country: "UK", 
        level: "A-Level" 
      },
      { 
        id: "ib", 
        name: "International Baccalaureate", 
        country: "International", 
        level: "Diploma" 
      }
    ]
  };

  // Create registry instance
  const registry = new SkillRegistry(metadata);

  // Register all skills
  registry.registerSkills(allSkills);

  return registry;
} 