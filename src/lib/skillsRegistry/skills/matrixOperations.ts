import { Skill, Module, Submodule } from '../types';
import { MultipleChoiceQuestionSchema, CalculationQuestionSchema } from '../types'; // Import Zod schemas

// Define Submodules
const matrixDimensionsSubmodule: Submodule = {
    id: 'matrix_dimensions_sub',
    title: "Matrix Dimensions", order: 1,
    questionSchema: MultipleChoiceQuestionSchema,
    generationPrompt: "Generate a single beginner multiple-choice question asking to identify the dimensions (rows x columns) of a given 2x2, 2x3, or 3x2 matrix. Provide 3 options."
};
const matrixTypesSubmodule: Submodule = {
    id: 'matrix_types_sub',
    title: "Matrix Types", order: 2,
    questionSchema: MultipleChoiceQuestionSchema,
    generationPrompt: "Generate a single beginner multiple-choice question asking to identify a square, row, or column matrix from a set of examples. Provide 3 options."
};

const matrixAddSubCalcSubmodule: Submodule = {
    id: 'matrix_addsub_calc_sub',
    title: "Matrix Add/Subtract Calculation", order: 1,
    questionSchema: CalculationQuestionSchema,
    generationPrompt: "Generate a single intermediate calculation question involving the addition or subtraction of two 2x2 matrices. Provide the answer in matrix format [[a, b], [c, d]]."
};
const matrixAddSubCondSubmodule: Submodule = {
    id: 'matrix_addsub_cond_sub',
    title: "Matrix Add/Subtract Condition", order: 2,
    questionSchema: MultipleChoiceQuestionSchema,
    generationPrompt: "Generate a single beginner multiple-choice question asking about the condition required for matrix addition or subtraction (must have same dimensions). Provide 3 options."
};

const matrixMultCondSubmodule: Submodule = {
    id: 'matrix_mult_cond_sub',
    title: "Matrix Multiplication Condition", order: 1,
    questionSchema: MultipleChoiceQuestionSchema,
    generationPrompt: "Generate a single intermediate multiple-choice question asking for the condition required to multiply matrix A by matrix B (Columns(A) == Rows(B)). Provide 3-4 options."
};
const matrixMultDimSubmodule: Submodule = {
    id: 'matrix_mult_dim_sub',
    title: "Resulting Matrix Dimensions", order: 2,
    questionSchema: MultipleChoiceQuestionSchema,
    generationPrompt: "Generate a single intermediate multiple-choice question asking for the dimensions of the resulting matrix when multiplying an m x n matrix by an n x p matrix. Provide 3-4 options."
};
// Note: Actual matrix multiplication calculation could be another submodule (likely CalculationQuestionSchema)

const matrixDetCalcSubmodule: Submodule = {
    id: 'matrix_det_calc_sub',
    title: "Determinant Calculation (2x2)", order: 1,
    questionSchema: CalculationQuestionSchema,
    generationPrompt: "Generate a single intermediate calculation question asking for the determinant of a given 2x2 matrix. The answer is a single number."
};

// Define Modules containing Submodules
const basicsModule: Module = {
    id: 'matrix_basics_module', title: "Matrix Basics", order: 1,
    description: "Fundamentals: notation, dimensions, types.",
    submodules: [matrixDimensionsSubmodule, matrixTypesSubmodule]
};
const addSubModule: Module = {
    id: 'matrix_addsub_module', title: "Addition & Subtraction", order: 2,
    description: "Add and subtract matrices.",
    submodules: [matrixAddSubCalcSubmodule, matrixAddSubCondSubmodule]
};
const multiplyModule: Module = {
    id: 'matrix_multiply_module', title: "Multiplication", order: 3,
    description: "Rules for matrix multiplication.",
    submodules: [matrixMultCondSubmodule, matrixMultDimSubmodule]
};
const determinantsModule: Module = {
    id: 'matrix_determinants_module', title: "Determinants (2x2)", order: 4,
    description: "Calculate determinants of 2x2 matrices.",
    submodules: [matrixDetCalcSubmodule]
};

// Update Skill
const matrixOperationsSkill: Skill = {
  id: "matrix_operations",
  number: "1.",
  title: "Matrix Operations",
  description: "Learn basic matrix operations: addition, subtraction, multiplication, and determinants.",
  category: "maths",
  examBoard: ["edexcel", "aqa"],
  topics: [
    "Matrix Basics",
    "Addition & Subtraction",
    "Multiplication",
    "Determinants"
  ],
  difficulty: "intermediate",
  status: "available",
  prerequisites: [],
  modules: [
    basicsModule,
    addSubModule,
    multiplyModule,
    determinantsModule
  ]
};

export default matrixOperationsSkill; 