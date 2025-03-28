import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import axios from 'axios';
import { SubjectTermScores, Attendance, PredictionInput, PredictionResponse } from './types';

const API_URL = 'http://localhost:8000';

const subjects = ['mathematics', 'physics', 'chemistry', 'biology', 'english'] as const;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

type Subject = typeof subjects[number];
type Day = typeof days[number];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('mathematics');
  const [inputData, setInputData] = useState<PredictionInput>({
    subject_term_scores: subjects.reduce((acc, subject) => ({
      ...acc,
      [subject]: {
        term1: 0,
        term2: 0,
        term3: 0,
      },
    }), {} as SubjectTermScores),
    attendance: days.reduce((acc, day) => ({
      ...acc,
      [day]: 5,
    }), {} as Attendance),
    assignment_completion_rate: 5,
  });
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value as Subject);
  };

  const handleTermScoreChange = (term: 'term1' | 'term2' | 'term3', value: number) => {
    setInputData((prev) => ({
      ...prev,
      subject_term_scores: {
        ...prev.subject_term_scores,
        [selectedSubject]: {
          ...prev.subject_term_scores[selectedSubject],
          [term]: value,
        },
      },
    }));
  };

  const handleAttendanceChange = (day: Day, value: number) => {
    setInputData((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [day]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<PredictionResponse>(
        `${API_URL}/predict`,
        inputData
      );
      setPrediction(response.data);
    } catch (err) {
      setError('Error making prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSubjectScores = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Subject</InputLabel>
        <Select
          value={selectedSubject}
          label="Select Subject"
          onChange={handleSubjectChange}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject} value={subject}>
              {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Term Scores for {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(['term1', 'term2', 'term3'] as const).map((term) => (
              <Box key={term}>
                <Typography gutterBottom>
                  {term.charAt(0).toUpperCase() + term.slice(1)} Score
                </Typography>
                <TextField
                  type="number"
                  value={inputData.subject_term_scores[selectedSubject][term]}
                  onChange={(e) => handleTermScoreChange(term, parseFloat(e.target.value))}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderAttendance = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weekly Attendance (1-10)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {days.map((day) => (
            <Box key={day}>
              <Typography gutterBottom>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Typography>
              <Slider
                value={inputData.attendance[day]}
                onChange={(_, value) => handleAttendanceChange(day as Day, value as number)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderAssignmentCompletion = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Assignment Completion Rate (1-10)
        </Typography>
        <Slider
          value={inputData.assignment_completion_rate}
          onChange={(_, value) =>
            setInputData((prev) => ({
              ...prev,
              assignment_completion_rate: value as number,
            }))
          }
          min={1}
          max={10}
          marks
          valueLabelDisplay="auto"
        />
      </CardContent>
    </Card>
  );

  const renderCharts = () => {
    if (!prediction) return null;

    const subjectData = subjects.map((subject) => ({
      name: subject,
      term1: prediction.input_data.subject_term_scores[subject].term1,
      term2: prediction.input_data.subject_term_scores[subject].term2,
      term3: prediction.input_data.subject_term_scores[subject].term3,
      predicted: prediction.predicted_score,
    }));

    const attendanceData = days.map((day) => ({
      name: day,
      attendance: prediction.input_data.attendance[day],
    }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject Scores by Term
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="term1" fill="#8884d8" name="Term 1" />
                  <Bar dataKey="term2" fill="#82ca9d" name="Term 2" />
                  <Bar dataKey="term3" fill="#ffc658" name="Term 3" />
                  <Bar dataKey="predicted" fill="#ff7300" name="Predicted Score" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Attendance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#8884d8"
                    name="Attendance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        National Exam Score Predictor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Enter Data
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Subjects" />
              <Tab label="Attendance" />
              <Tab label="Assignments" />
            </Tabs>
            <form onSubmit={handleSubmit}>
              {activeTab === 0 && renderSubjectScores()}
              {activeTab === 1 && renderAttendance()}
              {activeTab === 2 && renderAssignmentCompletion()}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 3 }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Predict Score'}
              </Button>
            </form>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Results
            </Typography>
            {prediction ? (
              <>
                <Typography variant="h4" color="primary" gutterBottom>
                  Predicted Score: {prediction.predicted_score.toFixed(1)}
                </Typography>
                {renderCharts()}
              </>
            ) : (
              <Typography color="text.secondary">
                Enter data and click "Predict Score" to see results
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
