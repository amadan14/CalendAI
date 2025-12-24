#!/usr/bin/env python3
"""
Quick test script to demonstrate model training
This simulates what would happen with the actual training script
"""

import json
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

try:
    from data_processing import ScheduleDataProcessor
    from model import StudyTimePredictor, ScheduleOptimizer, compare_models
    import pandas as pd
    import numpy as np
    
    print("=" * 60)
    print("ML Model Training Test")
    print("=" * 60)
    
    # Load sample data
    data_path = Path(__file__).parent / 'data' / 'sample_training_data.json'
    
    if not data_path.exists():
        print(f"❌ Data file not found: {data_path}")
        print("\nPlease export data from React app or use sample data.")
        sys.exit(1)
    
    print(f"\n✅ Loading data from: {data_path}")
    processor = ScheduleDataProcessor()
    data = processor.load_data(str(data_path))
    
    print(f"\n📊 Data Summary:")
    print(f"  Assignments: {len(data.get('assignments', []))}")
    print(f"  Courses: {len(data.get('courses', []))}")
    print(f"  Study Sessions: {len(data.get('studySessions', []))}")
    
    # Process data
    print("\n🔧 Processing data and extracting features...")
    result = processor.create_training_examples(data)
    
    X_assignments, y_assignments = result['assignments']
    X_sessions, y_sessions = result['sessions']
    
    if X_assignments.empty:
        print("\n⚠️  No assignment data found. Cannot train study time predictor.")
        print("   Add more assignments in the React app and export again.")
    else:
        print(f"\n✅ Created {len(X_assignments)} training examples from assignments")
        print(f"\n📋 Features extracted:")
        for col in X_assignments.columns:
            print(f"  - {col}")
        
        print(f"\n📈 Feature Statistics:")
        print(X_assignments.describe())
        
        print(f"\n🎯 Labels (Hours Needed):")
        print(y_assignments.describe())
        
        # Train model
        print("\n" + "=" * 60)
        print("Training Study Time Predictor Model")
        print("=" * 60)
        
        y = y_assignments['hours_needed']
        
        # Compare models
        print("\n🔍 Comparing different model types...")
        comparison = compare_models(X_assignments, y)
        print("\nModel Comparison Results:")
        print(comparison.to_string(index=False))
        
        # Train best model
        print("\n🚀 Training Random Forest model...")
        model = StudyTimePredictor(model_type='random_forest')
        metrics = model.train(X_assignments, y)
        
        print("\n" + "=" * 60)
        print("Training Results")
        print("=" * 60)
        print(f"\n📊 Performance Metrics:")
        print(f"  Train MAE:  {metrics['train_mae']:.2f} hours")
        print(f"  Test MAE:   {metrics['test_mae']:.2f} hours")
        print(f"  Train RMSE: {metrics['train_rmse']:.2f} hours")
        print(f"  Test RMSE:  {metrics['test_rmse']:.2f} hours")
        print(f"  Train R²:   {metrics['train_r2']:.3f}")
        print(f"  Test R²:    {metrics['test_r2']:.3f}")
        
        # Interpretation
        print("\n" + "=" * 60)
        print("Model Performance Analysis")
        print("=" * 60)
        
        if metrics['test_r2'] > 0.7:
            print("\n✅ Excellent! Model explains >70% of variance")
        elif metrics['test_r2'] > 0.5:
            print("\n✅ Good! Model explains >50% of variance")
        elif metrics['test_r2'] > 0.3:
            print("\n⚠️  Moderate. Model explains >30% of variance")
            print("   Consider: More training data, better features")
        else:
            print("\n⚠️  Low performance. Model needs improvement")
            print("   Consider: More training data, feature engineering")
        
        print(f"\n💡 Interpretation:")
        print(f"  - On average, predictions are off by {metrics['test_mae']:.2f} hours")
        print(f"  - The model explains {metrics['test_r2']*100:.1f}% of the variance")
        
        if metrics['test_mae'] < 1.0:
            print(f"  - ✅ Very accurate! Less than 1 hour error on average")
        elif metrics['test_mae'] < 2.0:
            print(f"  - ✅ Good accuracy! Less than 2 hours error on average")
        else:
            print(f"  - ⚠️  Could be better. Consider more training data")
        
        # Save model
        models_dir = Path(__file__).parent / 'models'
        models_dir.mkdir(exist_ok=True)
        model_path = models_dir / 'study_time_predictor.pkl'
        model.save(str(model_path))
        print(f"\n💾 Model saved to: {model_path}")
        
        # Show some predictions
        print("\n" + "=" * 60)
        print("Sample Predictions")
        print("=" * 60)
        print("\nPredicting hours needed for assignments:")
        predictions = model.predict(X_assignments)
        for i in range(min(5, len(X_assignments))):
            actual = y.iloc[i]
            predicted = predictions[i]
            error = abs(actual - predicted)
            print(f"  Assignment {i+1}:")
            print(f"    Actual:    {actual:.1f} hours")
            print(f"    Predicted: {predicted:.1f} hours")
            print(f"    Error:     {error:.2f} hours")
            print()
    
    # Schedule optimizer
    print("\n" + "=" * 60)
    print("Schedule Optimizer")
    print("=" * 60)
    
    X_schedule, y_schedule = processor.prepare_schedule_optimization_data(data)
    
    if X_schedule.empty or len(y_schedule) == 0:
        print("\n⚠️  No schedule optimization data found.")
        print("   Need assignments with associated study sessions.")
        print("   Create study sessions in the React app and export again.")
    else:
        print(f"\n✅ Created {len(X_schedule)} training examples")
        
        if isinstance(X_schedule, np.ndarray):
            X_schedule = pd.DataFrame(X_schedule)
        
        print("\n🚀 Training Schedule Optimizer...")
        optimizer = ScheduleOptimizer(model_type='random_forest')
        opt_metrics = optimizer.train(X_schedule, pd.Series(y_schedule))
        
        print("\n📊 Performance Metrics:")
        print(f"  Train MAE:  {opt_metrics['train_mae']:.2f} hours")
        print(f"  Test MAE:   {opt_metrics['test_mae']:.2f} hours")
        print(f"  Train R²:   {opt_metrics['train_r2']:.3f}")
        print(f"  Test R²:    {opt_metrics['test_r2']:.3f}")
        
        # Accuracy within 2 hours
        predictions = optimizer.predict(X_schedule)
        within_2_hours = np.mean(np.abs(predictions - np.array(y_schedule)) <= 2) * 100
        print(f"  Accuracy (within 2 hours): {within_2_hours:.1f}%")
        
        # Save optimizer
        opt_path = models_dir / 'schedule_optimizer.pkl'
        optimizer.save(str(opt_path))
        print(f"\n💾 Model saved to: {opt_path}")
        
        print("\n💡 Interpretation:")
        print(f"  - Model predicts optimal study hour with {opt_metrics['test_mae']:.2f} hour average error")
        print(f"  - {within_2_hours:.1f}% of predictions are within 2 hours of actual optimal time")
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print("\n📝 Next Steps:")
    print("  1. Export more data from React app for better accuracy")
    print("  2. Retrain with more data: python src/train.py")
    print("  3. Evaluate models: python src/evaluate.py")
    print("  4. Integrate with React app (coming soon)")
    
except ImportError as e:
    print("❌ Missing dependencies. Please install:")
    print("   pip install numpy pandas scikit-learn matplotlib seaborn joblib")
    print(f"\n   Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

