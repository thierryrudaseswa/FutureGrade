export interface TermScores {
    term1: number;
    term2: number;
    term3: number;
}

export interface SubjectTermScores {
    [key: string]: TermScores;
    mathematics: TermScores;
    physics: TermScores;
    chemistry: TermScores;
    biology: TermScores;
    english: TermScores;
}

export interface Attendance {
    [key: string]: number;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
}

export interface PredictionInput {
    subject_term_scores: SubjectTermScores;
    attendance: Attendance;
    assignment_completion_rate: number;
}

export interface PredictionResponse {
    predicted_score: number;
    input_data: {
        subject_term_scores: SubjectTermScores;
        attendance: Attendance;
        assignment_completion_rate: number;
    };
} 