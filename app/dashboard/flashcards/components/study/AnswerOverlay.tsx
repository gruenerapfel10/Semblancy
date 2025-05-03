import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerOverlayProps {
  answerStatus: 'correct' | 'incorrect' | null;
}

const AnswerOverlay: React.FC<AnswerOverlayProps> = ({ answerStatus }) => {
  if (!answerStatus) return null;
  
  return (
    <div className={`absolute right-2 top-2 rounded-full p-2 
      ${answerStatus === 'correct' 
        ? 'bg-green-100 text-green-500' 
        : 'bg-red-100 text-red-500'
      }`}
    >
      {answerStatus === 'correct' 
        ? <CheckCircle className="h-6 w-6" /> 
        : <XCircle className="h-6 w-6" />
      }
    </div>
  );
};

export default AnswerOverlay; 