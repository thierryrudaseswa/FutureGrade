import React, { useState } from 'react';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [formData, setFormData] = useState({
    subject_term_scores: {
      mathematics: { term1: '', term2: '', term3: '' },
      english: { term1: '', term2: '', term3: '' },
      science: { term1: '', term2: '', term3: '' },
      history: { term1: '', term2: '', term3: '' },
      geography: { term1: '', term2: '', term3: '' }
    },
    attendance: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    assignment_completion_rate: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };

  const handleSubjectScoreChange = (subject, term, value) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 100) {
      setFormData(prev => ({
        ...prev,
        subject_term_scores: {
          ...prev.subject_term_scores,
          [subject]: {
            ...prev.subject_term_scores[subject],
            [term]: value
          }
        }
      }));
    }
  };

  const handleAttendanceChange = (day, value) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 3) {
      setFormData(prev => ({
        ...prev,
        attendance: {
          ...prev.attendance,
          [day]: value
        }
      }));
    }
  };

  const handleAssignmentCompletionChange = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 100) {
      setFormData(prev => ({
        ...prev,
        assignment_completion_rate: value
      }));
    }
  };

  const validateForm = () => {
    // Validate subject scores
    for (const subject in formData.subject_term_scores) {
      for (const term in formData.subject_term_scores[subject]) {
        const value = parseFloat(formData.subject_term_scores[subject][term]);
        if (isNaN(value) || value < 0 || value > 100) {
          setError(`Please enter valid scores (0-100) for ${subject} ${term}`);
          return false;
        }
      }
    }

    // Validate attendance hours
    for (const day in formData.attendance) {
      const value = parseFloat(formData.attendance[day]);
      if (isNaN(value) || value < 0 || value > 3) {
        setError(`Please enter valid hours (0-3) for ${day}`);
        return false;
      }
    }

    // Validate assignment completion rate
    const completionRate = parseFloat(formData.assignment_completion_rate);
    if (isNaN(completionRate) || completionRate < 0 || completionRate > 100) {
      setError('Please enter a valid assignment completion rate (0-100)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to make prediction');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error making prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <div className="container">
        <div className="header">
          <h1>National Exam Score Predictor</h1>
        </div>
        <form onSubmit={handleSubmit} className="form-container">
          <h2>Subject Scores</h2>
          {Object.entries(formData.subject_term_scores).map(([subject, terms]) => (
            <div key={subject} className="form-group">
              <h3>{subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
              {Object.entries(terms).map(([term, value]) => (
                <div key={term} className="form-group">
                  <label>{term.charAt(0).toUpperCase() + term.slice(1)} Score:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={value}
                    onChange={(e) => handleSubjectScoreChange(subject, term, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          ))}

          <h2>Daily Attendance Hours (0-3)</h2>
          <p className="help-text">
            Attendance Scale:<br/>
            0-1: Poor attendance<br/>
            1-2: Medium attendance<br/>
            2-3: Good attendance<br/>
            3: Excellent attendance
          </p>
          {Object.entries(formData.attendance).map(([day, hours]) => (
            <div key={day} className="form-group">
              <label>{day.charAt(0).toUpperCase() + day.slice(1)} Hours:</label>
              <input
                type="number"
                min="0"
                max="3"
                step="0.1"
                value={hours}
                onChange={(e) => handleAttendanceChange(day, e.target.value)}
                required
              />
            </div>
          ))}

          <div className="form-group">
            <label>Assignment Completion Rate (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.assignment_completion_rate}
              onChange={(e) => handleAssignmentCompletionChange(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Predicting...' : 'Predict Score'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
        
        {result && (
          <div className="result">
            <h2>Predicted National Exam Score</h2>
            <p>{result.predicted_score.toFixed(2)} points</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 