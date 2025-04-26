import {
  faCalculator, faFlask, faAtom, faSquareRootVariable
} from "@fortawesome/free-solid-svg-icons";

// Skills data moved from page.jsx to improve modularization
export const SKILLS_DATA = {
  categories: [
    { id: "maths", name: "Maths", count: 1, icon: faCalculator },
    { id: "chemistry", name: "Chemistry", count: 0, icon: faFlask },
    { id: "physics", name: "Physics", count: 0, icon: faAtom },
    { id: "further_maths", name: "Further Maths", count: 0, icon: faSquareRootVariable }
  ],
  examBoards: [
    { id: "edexcel", name: "Edexcel", count: 1 }
  ],
  skills: [
    {
      id: 1,
      number: "1.",
      title: "Matrix Operations",
      description: "Learn about matrix addition, subtraction, multiplication, and finding determinants. Master the concepts of matrix transformations and their applications in solving systems of linear equations.",
      status: "locked",
      category: "maths",
      examBoard: ["Edexcel"],
      topics: [
        "Matrix Addition and Subtraction",
        "Matrix Multiplication",
        "Finding Determinants",
        "Matrix Transformations",
        "Solving Systems of Linear Equations"
      ],
      prerequisites: [],
      difficulty: "intermediate"
    }
  ]
}; 