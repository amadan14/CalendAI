# ML Service - Schedule Optimization

This directory contains the machine learning models for intelligent schedule generation and optimization.

## Overview

The ML service trains models to:
- Predict optimal study times based on user patterns
- Estimate study hours needed for assignments
- Generate personalized schedules
- Learn from user behavior and feedback

## Structure

```
ml-service/
├── data/              # Training data (JSON/CSV)
├── models/            # Trained model files (.pkl, .joblib)
├── notebooks/         # Jupyter notebooks for exploration
├── src/
│   ├── data_processing.py    # Data cleaning and feature engineering
│   ├── model.py              # Model definitions
│   ├── train.py              # Training script
│   └── evaluate.py           # Model evaluation
├── requirements.txt
└── README.md
```

## Quick Start

**Easiest way** - Use the setup script:
```bash
cd ml-service
./RUN_TRAINING.sh
```

**Manual setup**:

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Export data from React app (see instructions below) or use sample data

4. Train model:
```bash
python src/train.py --data data/sample_training_data.json
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.
See [EXPECTED_RESULTS.md](./EXPECTED_RESULTS.md) for performance expectations.

## Data Collection

### Exporting Data from React App

1. **Go to Assignments tab** in the React app
2. **Click "Export for ML"** button
3. **Save the JSON file** to `ml-service/data/training_data.json`

The exported data includes:
- All assignments with due dates, priorities, courses
- All courses with schedules
- All study sessions with times and durations

### Data Processing

The ML service processes this data to:
- Extract features (time patterns, assignment types, etc.)
- Create training examples
- Generate labels (optimal schedules, hours needed)

## Model Types

1. **Schedule Optimizer**: Predicts optimal study times
2. **Time Estimator**: Predicts hours needed for assignments
3. **Workload Predictor**: Forecasts busy periods

## Training

### Quick Start

1. **Export data** from React app (see Data Collection above)
2. **Place JSON file** in `ml-service/data/training_data.json`
3. **Run training**:
```bash
cd ml-service
python src/train.py --data data/training_data.json --output models/
```

### Training Options

Train specific models:
```bash
# Train only study time predictor
python src/train.py --model time --data data/training_data.json

# Train only schedule optimizer
python src/train.py --model schedule --data data/training_data.json

# Train both (default)
python src/train.py --model both --data data/training_data.json
```

### What Gets Trained

1. **Study Time Predictor**: Predicts hours needed for assignments
   - Input: Assignment features (type, priority, days until due, etc.)
   - Output: Hours needed (float)
   - Model: Random Forest Regressor

2. **Schedule Optimizer**: Predicts optimal study times
   - Input: Assignment + time features
   - Output: Optimal hour of day (0-23)
   - Model: Random Forest Regressor

## Evaluation

Evaluate trained models:
```bash
# Evaluate study time predictor
python src/evaluate.py --model models/study_time_predictor.pkl --data data/training_data.json

# Evaluate schedule optimizer
python src/evaluate.py --model models/schedule_optimizer.pkl --data data/training_data.json
```

## Model Files

After training, you'll have:
- `models/study_time_predictor.pkl` - Predicts hours needed
- `models/schedule_optimizer.pkl` - Predicts optimal study times

These can be loaded and used for predictions (integration with React app coming soon).

## Next Steps

1. **Collect more data**: The more assignments and study sessions you have, the better the model
2. **Retrain periodically**: As you add more data, retrain to improve accuracy
3. **Experiment**: Try different model types, features, or hyperparameters
4. **Integrate**: Connect trained models to React app via API (future work)

