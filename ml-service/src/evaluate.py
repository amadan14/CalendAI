"""
Model Evaluation Script

Evaluates trained models on test data and provides detailed metrics
"""

import argparse
import os
import sys
import json
import pandas as pd
import numpy as np
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from data_processing import ScheduleDataProcessor
from model import StudyTimePredictor, ScheduleOptimizer


def evaluate_study_time_predictor(model_path: str, data_path: str):
    """Evaluate study time predictor model"""
    print("=" * 60)
    print("Evaluating Study Time Predictor")
    print("=" * 60)
    
    # Load model
    model = StudyTimePredictor.load(model_path)
    print(f"✅ Loaded model: {model_path}")
    print(f"   Model type: {model.model_type}")
    print(f"   Features: {model.feature_names}")
    
    # Load and process test data
    processor = ScheduleDataProcessor()
    data = processor.load_data(data_path)
    result = processor.create_training_examples(data)
    
    X, y = result['assignments']
    
    if X.empty:
        print("❌ No test data available")
        return
    
    # Make predictions
    predictions = model.predict(X)
    actual = y['hours_needed'].values
    
    # Calculate metrics
    mae = np.mean(np.abs(predictions - actual))
    rmse = np.sqrt(np.mean((predictions - actual) ** 2))
    r2 = 1 - np.sum((actual - predictions) ** 2) / np.sum((actual - np.mean(actual)) ** 2)
    
    print(f"\nTest Set Metrics:")
    print(f"  MAE:  {mae:.2f} hours")
    print(f"  RMSE: {rmse:.2f} hours")
    print(f"  R²:   {r2:.3f}")
    
    # Show some examples
    print(f"\nSample Predictions:")
    print(f"{'Actual':<10} {'Predicted':<10} {'Error':<10}")
    print("-" * 30)
    for i in range(min(10, len(actual))):
        error = abs(actual[i] - predictions[i])
        print(f"{actual[i]:<10.1f} {predictions[i]:<10.1f} {error:<10.2f}")


def evaluate_schedule_optimizer(model_path: str, data_path: str):
    """Evaluate schedule optimizer model"""
    print("\n" + "=" * 60)
    print("Evaluating Schedule Optimizer")
    print("=" * 60)
    
    # Load model
    model = ScheduleOptimizer.load(model_path)
    print(f"✅ Loaded model: {model_path}")
    
    # Load and process test data
    processor = ScheduleDataProcessor()
    data = processor.load_data(data_path)
    
    X, y = processor.prepare_schedule_optimization_data(data)
    
    if X.empty or len(y) == 0:
        print("❌ No test data available")
        return
    
    if isinstance(X, np.ndarray):
        X = pd.DataFrame(X)
    
    # Make predictions
    predictions = model.predict(X)
    actual = np.array(y)
    
    # Calculate metrics
    mae = np.mean(np.abs(predictions - actual))
    rmse = np.sqrt(np.mean((predictions - actual) ** 2))
    
    # Accuracy within 2 hours
    within_2_hours = np.mean(np.abs(predictions - actual) <= 2) * 100
    
    print(f"\nTest Set Metrics:")
    print(f"  MAE: {mae:.2f} hours")
    print(f"  RMSE: {rmse:.2f} hours")
    print(f"  Accuracy (within 2 hours): {within_2_hours:.1f}%")
    
    # Show some examples
    print(f"\nSample Predictions:")
    print(f"{'Actual Hour':<15} {'Predicted Hour':<15} {'Error':<10}")
    print("-" * 40)
    for i in range(min(10, len(actual))):
        error = abs(actual[i] - predictions[i])
        print(f"{int(actual[i]):<15} {int(predictions[i]):<15} {error:<10.1f}")


def main():
    parser = argparse.ArgumentParser(description='Evaluate trained ML models')
    parser.add_argument(
        '--model',
        type=str,
        required=True,
        help='Path to trained model file (.pkl)'
    )
    parser.add_argument(
        '--data',
        type=str,
        default='data/training_data.json',
        help='Path to test data JSON file'
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.model):
        print(f"❌ Error: Model file not found: {args.model}")
        return
    
    if not os.path.exists(args.data):
        print(f"❌ Error: Data file not found: {args.data}")
        return
    
    # Determine model type from filename
    if 'time' in args.model.lower():
        evaluate_study_time_predictor(args.model, args.data)
    elif 'schedule' in args.model.lower() or 'optimizer' in args.model.lower():
        evaluate_schedule_optimizer(args.model, args.data)
    else:
        print("❌ Could not determine model type from filename")
        print("   Filename should contain 'time' or 'schedule'/'optimizer'")


if __name__ == '__main__':
    main()

