"""
Data Processing and Feature Engineering for Schedule ML Model

This module handles:
- Loading and cleaning training data
- Feature extraction from schedules
- Creating training examples
- Data validation
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


class ScheduleDataProcessor:
    """Process schedule data for ML training"""
    
    def __init__(self):
        self.features = []
        self.labels = []
    
    def load_data(self, filepath: str) -> Dict:
        """Load JSON data exported from React app"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        return data
    
    def extract_features_from_assignment(self, assignment: Dict, context: Dict) -> Dict:
        """
        Extract features from an assignment
        
        Features:
        - Assignment type (homework, project, exam, etc.)
        - Course workload (number of assignments in course)
        - Days until due date
        - Priority level (encoded)
        - Day of week due date falls on
        - Time of semester (early/mid/late)
        - Historical completion time (if available)
        """
        due_date = datetime.fromisoformat(assignment['dueDate'].replace('Z', '+00:00'))
        created_date = datetime.fromisoformat(assignment.get('createdAt', assignment['dueDate']).replace('Z', '+00:00'))
        
        # Days until due
        days_until_due = (due_date - datetime.now(due_date.tzinfo)).days
        
        # Assignment type detection
        title_lower = assignment.get('title', '').lower()
        assignment_type = self._detect_assignment_type(title_lower)
        
        # Course workload (how many assignments in this course)
        course_assignments = [a for a in context.get('assignments', []) 
                             if a.get('course') == assignment.get('course')]
        course_workload = len(course_assignments)
        
        # Priority encoding
        priority_map = {'high': 3, 'medium': 2, 'low': 1}
        priority = priority_map.get(assignment.get('priority', 'medium'), 2)
        
        # Day of week (0=Monday, 6=Sunday)
        day_of_week = due_date.weekday()
        
        # Time of semester (normalized 0-1, assuming 16-week semester)
        # This is a placeholder - you'd need actual semester dates
        semester_progress = 0.5  # Default to mid-semester
        
        features = {
            'assignment_type': assignment_type,
            'days_until_due': days_until_due,
            'priority': priority,
            'course_workload': course_workload,
            'day_of_week': day_of_week,
            'semester_progress': semester_progress,
            'has_description': 1 if assignment.get('description') else 0,
            'title_length': len(assignment.get('title', '')),
        }
        
        return features
    
    def extract_features_from_study_session(self, session: Dict, context: Dict) -> Dict:
        """
        Extract features from a study session
        
        Features:
        - Time of day (hour)
        - Day of week
        - Duration
        - Assignment type being studied
        - Course
        """
        start_time_str = session['startTime']
        # Handle timezone formats: Z, +00:00, or already parsed
        if start_time_str.endswith('Z'):
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        elif '+' in start_time_str or start_time_str.count('-') > 2:
            # Already has timezone info, but might have double timezone
            if '+00:00+00:00' in start_time_str:
                start_time_str = start_time_str.replace('+00:00+00:00', '+00:00')
            start_time = datetime.fromisoformat(start_time_str)
        else:
            # No timezone, assume UTC
            start_time = datetime.fromisoformat(start_time_str + '+00:00')
        
        duration = session.get('duration', 120)  # minutes
        hour_of_day = start_time.hour
        day_of_week = start_time.weekday()
        
        # Assignment type from title
        title_lower = session.get('assignmentTitle', '').lower()
        assignment_type = self._detect_assignment_type(title_lower)
        
        features = {
            'hour_of_day': hour_of_day,
            'day_of_week': day_of_week,
            'duration_minutes': duration,
            'assignment_type': assignment_type,
            'is_weekend': 1 if day_of_week >= 5 else 0,
            'is_morning': 1 if 6 <= hour_of_day < 12 else 0,
            'is_afternoon': 1 if 12 <= hour_of_day < 18 else 0,
            'is_evening': 1 if hour_of_day >= 18 else 0,
        }
        
        return features
    
    def _detect_assignment_type(self, title: str) -> int:
        """Detect assignment type from title (0=homework, 1=project, 2=exam, 3=other)"""
        title_lower = title.lower()
        if any(word in title_lower for word in ['exam', 'test', 'midterm', 'final', 'quiz']):
            return 2
        elif any(word in title_lower for word in ['project', 'presentation', 'paper']):
            return 1
        elif any(word in title_lower for word in ['homework', 'hw', 'assignment', 'lab']):
            return 0
        else:
            return 3
    
    def create_training_examples(self, data: Dict) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Create training examples from schedule data
        
        Returns:
        - X: Feature matrix
        - y: Labels (optimal study times, hours needed, etc.)
        """
        assignments = data.get('assignments', [])
        study_sessions = data.get('studySessions', [])
        courses = data.get('courses', [])
        
        context = {
            'assignments': assignments,
            'studySessions': study_sessions,
            'courses': courses,
        }
        
        # Extract features from assignments
        assignment_features = []
        assignment_labels = []
        
        for assignment in assignments:
            features = self.extract_features_from_assignment(assignment, context)
            assignment_features.append(features)
            
            # Create labels: use actual completion time if available, otherwise estimate
            hours_needed = self._estimate_hours_needed(assignment, features)
            assignment_labels.append({'hours_needed': hours_needed})
            
            # Add session completion pattern if available
            if assignment.get('isCompleted') or assignment.get('completed'):
                # Try to get pattern from completion patterns in data
                completion_patterns = data.get('completionPatterns', [])
                pattern = next((p for p in completion_patterns 
                               if p.get('assignmentType') == features.get('assignment_type') and
                                  p.get('course') == assignment.get('course')), None)
                if pattern:
                    assignment_labels[-1]['sessions_needed'] = pattern.get('sessionsNeeded', 0)
                    assignment_labels[-1]['avg_session_duration'] = pattern.get('avgSessionDuration', 0) / 60  # Convert to hours
        
        # Extract features from study sessions
        session_features = []
        session_labels = []
        
        for session in study_sessions:
            features = self.extract_features_from_study_session(session, context)
            session_features.append(features)
            
            # Label: was this an effective time? (placeholder - would need user feedback)
            # For now, assume all sessions are effective
            session_labels.append({'is_effective': 1})
        
        # Convert to DataFrames
        if assignment_features:
            X_assignments = pd.DataFrame(assignment_features)
            y_assignments = pd.DataFrame(assignment_labels)
        else:
            X_assignments = pd.DataFrame()
            y_assignments = pd.DataFrame()
        
        if session_features:
            X_sessions = pd.DataFrame(session_features)
            y_sessions = pd.DataFrame(session_labels)
        else:
            X_sessions = pd.DataFrame()
            y_sessions = pd.DataFrame()
        
        return {
            'assignments': (X_assignments, y_assignments),
            'sessions': (X_sessions, y_sessions)
        }
    
    def _estimate_hours_needed(self, assignment: Dict, features: Dict) -> float:
        """
        Estimate hours needed for assignment
        Uses actual completion data if available, otherwise falls back to heuristic
        """
        # If assignment is completed and has actual time data, use that
        if assignment.get('isCompleted') or assignment.get('completed'):
            actual_time = assignment.get('actualTimeSpentMinutes') or assignment.get('actualTimeSpent')
            if actual_time:
                return round(actual_time / 60, 1)  # Convert minutes to hours
        
        # Fall back to heuristic if no actual data
        base_hours = {
            0: 2.0,   # homework
            1: 8.0,   # project
            2: 5.0,   # exam
            3: 3.0,   # other
        }
        
        hours = base_hours.get(features['assignment_type'], 3.0)
        
        # Adjust based on priority
        if features['priority'] == 3:  # high
            hours *= 1.2
        elif features['priority'] == 1:  # low
            hours *= 0.8
        
        # Adjust based on days until due (more time = more work expected)
        if features['days_until_due'] > 14:
            hours *= 1.3
        elif features['days_until_due'] < 3:
            hours *= 0.7  # Less time = simpler task
        
        return round(hours, 1)
    
    def prepare_schedule_optimization_data(self, data: Dict) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for schedule optimization model
        
        Creates examples of: given assignments, what's the optimal schedule?
        """
        assignments = data.get('assignments', [])
        study_sessions = data.get('studySessions', [])
        courses = data.get('courses', [])
        
        context = {
            'assignments': assignments,
            'studySessions': study_sessions,
            'courses': courses,
        }
        
        # Create training examples: assignment + optimal study time
        examples = []
        labels = []
        
        for assignment in assignments:
            if assignment.get('dueDate'):
                features = self.extract_features_from_assignment(assignment, context)
                
                # Find associated study sessions
                assignment_sessions = [
                    s for s in study_sessions 
                    if s.get('assignmentTitle') == assignment.get('title') or
                       assignment.get('title') in s.get('assignmentTitle', '')
                ]
                
                if assignment_sessions:
                    # Use actual study session times as labels
                    for session in assignment_sessions:
                        session_features = self.extract_features_from_study_session(session, context)
                        
                        # Combine assignment and session features
                        combined_features = {**features, **session_features}
                        examples.append(combined_features)
                        
                        # Label: hour of day (0-23) for optimal study time
                        start_time_str = session['startTime']
                        if start_time_str.endswith('Z'):
                            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                        elif '+' in start_time_str:
                            if '+00:00+00:00' in start_time_str:
                                start_time_str = start_time_str.replace('+00:00+00:00', '+00:00')
                            start_time = datetime.fromisoformat(start_time_str)
                        else:
                            start_time = datetime.fromisoformat(start_time_str + '+00:00')
                        labels.append(start_time.hour)
        
        if not examples:
            return np.array([]), np.array([])
        
        X = pd.DataFrame(examples)
        y = np.array(labels)
        
        return X, y


def load_and_process_data(filepath: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Convenience function to load and process data
    
    Returns:
    - X: Feature matrix
    - y: Labels
    """
    processor = ScheduleDataProcessor()
    data = processor.load_data(filepath)
    result = processor.create_training_examples(data)
    
    # Combine assignment and session data
    X_assignments, y_assignments = result['assignments']
    X_sessions, y_sessions = result['sessions']
    
    # For now, focus on assignment prediction
    if not X_assignments.empty:
        return X_assignments, y_assignments
    else:
        return X_sessions, y_sessions


if __name__ == '__main__':
    # Example usage
    processor = ScheduleDataProcessor()
    
    # Load sample data
    try:
        data = processor.load_data('../data/training_data.json')
        result = processor.create_training_examples(data)
        
        X_assignments, y_assignments = result['assignments']
        print("Assignment Features Shape:", X_assignments.shape)
        print("Assignment Labels Shape:", y_assignments.shape)
        print("\nFeatures:")
        print(X_assignments.head())
        print("\nLabels:")
        print(y_assignments.head())
        
    except FileNotFoundError:
        print("No training data found. Export data from React app first.")
        print("See README.md for instructions.")

