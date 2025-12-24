"""
ML Model Definitions for Schedule Optimization

This module defines the machine learning models used for:
1. Study Time Prediction: Predicts hours needed for assignments
2. Schedule Optimization: Predicts optimal study times
3. Workload Forecasting: Predicts busy periods
"""

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Optional
import os


class StudyTimePredictor:
    """
    Predicts how many hours are needed to complete an assignment
    
    Input features:
    - Assignment type, priority, days until due, course workload, etc.
    
    Output:
    - Hours needed (float)
    """
    
    def __init__(self, model_type: str = 'random_forest'):
        """
        Initialize model
        
        Args:
            model_type: 'random_forest', 'gradient_boosting', 'linear', 'neural_network'
        """
        self.model_type = model_type
        self.model = self._create_model(model_type)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = None
    
    def _create_model(self, model_type: str):
        """Create model based on type"""
        if model_type == 'random_forest':
            return RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'gradient_boosting':
            return GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
        elif model_type == 'linear':
            return Ridge(alpha=1.0)
        elif model_type == 'neural_network':
            return MLPRegressor(
                hidden_layer_sizes=(100, 50),
                max_iter=500,
                random_state=42,
                early_stopping=True
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Dict:
        """
        Train the model
        
        Returns:
            Dictionary with training metrics
        """
        self.feature_names = X.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Scale features (if needed)
        if self.model_type in ['linear', 'neural_network']:
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
        else:
            X_train_scaled = X_train.values
            X_test_scaled = X_test.values
        
        # Train
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        # Evaluate
        y_pred_train = self.model.predict(X_train_scaled)
        y_pred_test = self.model.predict(X_test_scaled)
        
        metrics = {
            'train_mae': mean_absolute_error(y_train, y_pred_train),
            'test_mae': mean_absolute_error(y_test, y_pred_test),
            'train_rmse': np.sqrt(mean_squared_error(y_train, y_pred_train)),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred_test)),
            'train_r2': r2_score(y_train, y_pred_train),
            'test_r2': r2_score(y_test, y_pred_test),
        }
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predict hours needed"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        if self.model_type in ['linear', 'neural_network']:
            X_scaled = self.scaler.transform(X)
        else:
            X_scaled = X.values
        
        return self.model.predict(X_scaled)
    
    def save(self, filepath: str):
        """Save model to disk"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained,
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str):
        """Load model from disk"""
        model_data = joblib.load(filepath)
        instance = cls(model_data['model_type'])
        instance.model = model_data['model']
        instance.scaler = model_data['scaler']
        instance.model_type = model_data['model_type']
        instance.feature_names = model_data['feature_names']
        instance.is_trained = model_data['is_trained']
        return instance


class ScheduleOptimizer:
    """
    Predicts optimal study times based on assignments and user patterns
    
    Input features:
    - Assignment features + time preferences
    
    Output:
    - Optimal hour of day (0-23) for study session
    """
    
    def __init__(self, model_type: str = 'random_forest'):
        self.model_type = model_type
        self.model = self._create_model(model_type)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = None
    
    def _create_model(self, model_type: str):
        """Create model for time prediction"""
        if model_type == 'random_forest':
            return RandomForestRegressor(
                n_estimators=100,
                max_depth=8,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'gradient_boosting':
            return GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
        else:
            return RandomForestRegressor(n_estimators=100, random_state=42)
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Dict:
        """Train the schedule optimizer"""
        self.feature_names = X.columns.tolist()
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        if self.model_type in ['linear', 'neural_network']:
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
        else:
            X_train_scaled = X_train.values
            X_test_scaled = X_test.values
        
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        y_pred_train = self.model.predict(X_train_scaled)
        y_pred_test = self.model.predict(X_test_scaled)
        
        # Clip predictions to valid hour range (0-23)
        y_pred_train = np.clip(y_pred_train, 0, 23)
        y_pred_test = np.clip(y_pred_test, 0, 23)
        
        metrics = {
            'train_mae': mean_absolute_error(y_train, y_pred_train),
            'test_mae': mean_absolute_error(y_test, y_pred_test),
            'train_rmse': np.sqrt(mean_squared_error(y_train, y_pred_train)),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred_test)),
            'train_r2': r2_score(y_train, y_pred_train),
            'test_r2': r2_score(y_test, y_pred_test),
        }
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predict optimal study hour (0-23)"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        if self.model_type in ['linear', 'neural_network']:
            X_scaled = self.scaler.transform(X)
        else:
            X_scaled = X.values
        
        predictions = self.model.predict(X_scaled)
        # Clip to valid hour range
        return np.clip(predictions, 0, 23)
    
    def save(self, filepath: str):
        """Save model to disk"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained,
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str):
        """Load model from disk"""
        model_data = joblib.load(filepath)
        instance = cls(model_data['model_type'])
        instance.model = model_data['model']
        instance.scaler = model_data['scaler']
        instance.model_type = model_data['model_type']
        instance.feature_names = model_data['feature_names']
        instance.is_trained = model_data['is_trained']
        return instance


def compare_models(X: pd.DataFrame, y: pd.Series) -> pd.DataFrame:
    """
    Compare different model types and return performance metrics
    
    Returns:
        DataFrame with model comparison results
    """
    models = {
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'Linear Regression': Ridge(alpha=1.0),
    }
    
    results = []
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    for name, model in models.items():
        # Train
        if name in ['Linear Regression']:
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        
        # Evaluate
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results.append({
            'Model': name,
            'MAE': mae,
            'RMSE': rmse,
            'R²': r2
        })
    
    return pd.DataFrame(results)

