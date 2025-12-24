"""
Training Script for Schedule ML Models

This script:
1. Loads training data
2. Processes and engineers features
3. Trains multiple models
4. Evaluates and selects best model
5. Saves trained models
"""

import argparse
import json
import os
import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from data_processing import ScheduleDataProcessor, load_and_process_data
from model import StudyTimePredictor, ScheduleOptimizer, compare_models


def train_study_time_predictor(data_path: str, output_dir: str = 'models'):
    """
    Train model to predict study hours needed
    
    Args:
        data_path: Path to training data JSON
        output_dir: Directory to save trained model
    """
    print("=" * 60)
    print("Training Study Time Predictor")
    print("=" * 60)
    
    # Load and process data
    processor = ScheduleDataProcessor()
    data = processor.load_data(data_path)
    result = processor.create_training_examples(data)
    
    X_assignments, y_assignments = result['assignments']
    
    if X_assignments.empty:
        print("No assignment data found. Cannot train study time predictor.")
        return None
    
    print(f"\nLoaded {len(X_assignments)} training examples")
    print(f"Features: {list(X_assignments.columns)}")
    
    # Extract target (hours needed)
    y = y_assignments['hours_needed']
    
    # Compare models
    print("\nComparing models...")
    comparison = compare_models(X_assignments, y)
    print("\nModel Comparison:")
    print(comparison.to_string(index=False))
    
    # Train best model (Random Forest usually performs well)
    print("\n" + "=" * 60)
    print("Training Random Forest model...")
    print("=" * 60)
    
    model = StudyTimePredictor(model_type='random_forest')
    metrics = model.train(X_assignments, y)
    
    print("\nTraining Metrics:")
    print(f"  Train MAE: {metrics['train_mae']:.2f} hours")
    print(f"  Test MAE:  {metrics['test_mae']:.2f} hours")
    print(f"  Train RMSE: {metrics['train_rmse']:.2f} hours")
    print(f"  Test RMSE:  {metrics['test_rmse']:.2f} hours")
    print(f"  Train R²: {metrics['train_r2']:.3f}")
    print(f"  Test R²:  {metrics['test_r2']:.3f}")
    
    # Save model
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'study_time_predictor.pkl')
    model.save(model_path)
    
    print(f"\n✅ Model saved to {model_path}")
    return model


def train_schedule_optimizer(data_path: str, output_dir: str = 'models'):
    """
    Train model to predict optimal study times
    
    Args:
        data_path: Path to training data JSON
        output_dir: Directory to save trained model
    """
    print("\n" + "=" * 60)
    print("Training Schedule Optimizer")
    print("=" * 60)
    
    # Load and process data
    processor = ScheduleDataProcessor()
    data = processor.load_data(data_path)
    
    X, y = processor.prepare_schedule_optimization_data(data)
    
    if X.empty or len(y) == 0:
        print("No schedule optimization data found. Need assignments with study sessions.")
        return None
    
    print(f"\nLoaded {len(X)} training examples")
    print(f"Features: {list(X.columns)}")
    print(f"Target: Optimal study hour (0-23)")
    
    # Convert to DataFrame if needed
    if isinstance(X, np.ndarray):
        X = pd.DataFrame(X)
    
    # Train model
    model = ScheduleOptimizer(model_type='random_forest')
    metrics = model.train(X, pd.Series(y))
    
    print("\nTraining Metrics:")
    print(f"  Train MAE: {metrics['train_mae']:.2f} hours")
    print(f"  Test MAE:  {metrics['test_mae']:.2f} hours")
    print(f"  Train R²: {metrics['train_r2']:.3f}")
    print(f"  Test R²:  {metrics['test_r2']:.3f}")
    
    # Save model
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'schedule_optimizer.pkl')
    model.save(model_path)
    
    print(f"\n✅ Model saved to {model_path}")
    return model


def main():
    parser = argparse.ArgumentParser(description='Train ML models for schedule optimization')
    parser.add_argument(
        '--data',
        type=str,
        default='data/training_data.json',
        help='Path to training data JSON file'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='models',
        help='Output directory for trained models'
    )
    parser.add_argument(
        '--model',
        type=str,
        choices=['time', 'schedule', 'both'],
        default='both',
        help='Which model to train'
    )
    
    args = parser.parse_args()
    
    # Check if data file exists
    if not os.path.exists(args.data):
        print(f"❌ Error: Data file not found: {args.data}")
        print("\nTo generate training data:")
        print("1. Use the React app to create assignments and study sessions")
        print("2. Export data using the export function (to be implemented)")
        print("3. Save as data/training_data.json")
        return
    
    # Train models
    if args.model in ['time', 'both']:
        train_study_time_predictor(args.data, args.output)
    
    if args.model in ['schedule', 'both']:
        train_schedule_optimizer(args.data, args.output)
    
    print("\n" + "=" * 60)
    print("✅ Training complete!")
    print("=" * 60)
    print(f"\nModels saved to: {args.output}/")
    print("\nNext steps:")
    print("1. Evaluate models: python src/evaluate.py")
    print("2. Use models for predictions in React app")
    print("3. Collect more data and retrain for better performance")


if __name__ == '__main__':
    main()

