# ML Training Quick Start Guide

Get started training ML models for schedule optimization in 5 minutes!

## Step 1: Export Data from React App

1. Open your React app
2. Go to the **Assignments** tab
3. Make sure you have some assignments and study sessions
4. Click the **"Export for ML"** button
5. Save the file as `training_data.json`

## Step 2: Set Up Python Environment

```bash
# Navigate to ML service directory
cd ml-service

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Place Training Data

Copy your exported `training_data.json` file to:
```
ml-service/data/training_data.json
```

Or use the sample data:
```
ml-service/data/sample_training_data.json
```

## Step 4: Train Models

```bash
# Train both models (default)
python src/train.py --data data/training_data.json

# Or train specific models
python src/train.py --model time --data data/training_data.json
python src/train.py --model schedule --data data/training_data.json
```

## Step 5: Evaluate Models

```bash
# Evaluate study time predictor
python src/evaluate.py --model models/study_time_predictor.pkl --data data/training_data.json

# Evaluate schedule optimizer
python src/evaluate.py --model models/schedule_optimizer.pkl --data data/training_data.json
```

## What You'll Get

After training, you'll have:
- `models/study_time_predictor.pkl` - Predicts hours needed for assignments
- `models/schedule_optimizer.pkl` - Predicts optimal study times

## Understanding the Output

### Training Metrics

- **MAE (Mean Absolute Error)**: Average prediction error in hours
- **RMSE (Root Mean Squared Error)**: Penalizes larger errors more
- **R² (R-squared)**: How well the model fits (1.0 = perfect, 0.0 = no fit)

### Example Output

```
Training Metrics:
  Train MAE: 0.85 hours
  Test MAE:  1.12 hours
  Train R²: 0.78
  Test R²:  0.72
```

This means:
- On average, predictions are off by ~1 hour
- The model explains ~72% of the variance in test data
- Good performance for a first model!

## Tips for Better Models

1. **More data = better models**: Export data regularly as you use the app
2. **Diverse data**: Include different assignment types, courses, priorities
3. **Retrain periodically**: As you collect more data, retrain for better accuracy
4. **Experiment**: Try different model types in `model.py`

## Troubleshooting

**"No training data found"**
- Make sure `data/training_data.json` exists
- Check the file path is correct

**"No assignment data found"**
- Export data from React app with assignments
- Check JSON file has "assignments" array

**Import errors**
- Make sure you're in the `ml-service` directory
- Check virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`

## Next Steps

- Explore data in Jupyter notebook: `notebooks/01_data_exploration.ipynb`
- Modify features in `data_processing.py`
- Try different models in `model.py`
- Integrate trained models with React app (coming soon!)

