export class Level {
  constructor(
    public id: string,
    public label: string,
    public details: {
      skills: string[];
      textTypes: string[];
      questionTypes: string[];
      examStructure: {
        parts: {
          name: string;
          description: string;
          duration: number;
          questions: number;
        }[];
        totalDuration: number;
        totalQuestions: number;
      };
    }
  ) {}
}