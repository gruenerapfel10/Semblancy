import { Skill, Module, Submodule } from '../types';
import { MultipleChoiceQuestionSchema, CalculationQuestionSchema } from '../types'; // Import Zod schemas

// Define submodules explicitly
const eulersFormulaSubmodule: Submodule = {
  id: 'eulers_formula_sub',
  title: "Euler's Formula Basics",
  order: 1,
  questionSchema: MultipleChoiceQuestionSchema,
  generationPrompt: "Generate a single multiple-choice question testing basic understanding of Euler's formula (e^(iθ) = cos(θ) + i·sin(θ)). Provide exactly 3 options."
};

const eulersIdentitySubmodule: Submodule = {
  id: 'eulers_identity_sub',
  title: "Euler's Identity (e^iπ)",
  order: 2,
  questionSchema: MultipleChoiceQuestionSchema,
  generationPrompt: "Generate a single multiple-choice question asking for the value of e^(iπ) or a related concept derived from Euler's formula. Ensure intermediate difficulty. Provide 3 options."
};

const convertingSubmodule: Submodule = {
  id: 'converting_sub',
  title: "Cartesian to Exponential",
  order: 1,
  questionSchema: CalculationQuestionSchema,
  generationPrompt: "Generate a single calculation question requiring conversion of a complex number from Cartesian form (like 1+i, -√3+i, 2-2i, -4) to exponential form (re^(iθ)). Use π for pi in the answer. Provide the expected answer format clearly."
};

const multiplicationRuleSubmodule: Submodule = {
  id: 'multiplication_rule_sub',
  title: "Multiplication Rule",
  order: 1,
  questionSchema: MultipleChoiceQuestionSchema,
  generationPrompt: "Generate a single multiple-choice conceptual question about the rule for multiplying complex numbers in exponential form (z₁·z₂ = (r₁r₂)e^(i(θ₁+θ₂))). Ensure intermediate difficulty and provide 3 options."
};

const divisionRuleSubmodule: Submodule = {
  id: 'division_rule_sub',
  title: "Division Rule",
  order: 1,
  questionSchema: MultipleChoiceQuestionSchema,
  generationPrompt: "Generate a single multiple-choice conceptual question about the rule for dividing complex numbers in exponential form (z₁/z₂ = (r₁/r₂)e^(i(θ₁-θ₂))). Ensure intermediate difficulty and provide 3 options."
};

// Define Modules containing these Submodules
const eulersModule: Module = {
    id: 'eulers_formula_module',
    title: "Euler's Formula & Identity",
    description: "Understand and apply Euler's formula and identity.",
    order: 1,
    submodules: [eulersFormulaSubmodule, eulersIdentitySubmodule]
};

const conversionModule: Module = {
    id: 'conversion_module',
    title: "Converting Forms",
    description: "Convert complex numbers between Cartesian and exponential forms.",
    order: 2,
    submodules: [convertingSubmodule]
};

const operationsModule: Module = {
    id: 'operations_module',
    title: "Operations in Exponential Form",
    description: "Multiply and divide complex numbers in exponential form.",
    order: 3,
    submodules: [multiplicationRuleSubmodule, divisionRuleSubmodule]
};

// Update Skill to use the new Modules
const exponentialFormSkill: Skill = {
  id: "exponential_form",
  number: "2.",
  title: "Exponential Form of Complex Numbers",
  description: "Master the exponential form of complex numbers, including Euler's formula, operations, and conversions.",
  category: "maths",
  examBoard: ["edexcel", "aqa"],
  topics: [
    "Euler's Formula",
    "Converting Forms",
    "Multiplication",
    "Division"
  ],
  difficulty: "advanced",
  status: "available",
  prerequisites: ["matrix_operations"],
  modules: [
    eulersModule,
    conversionModule,
    operationsModule
  ]
};

export default exponentialFormSkill; 