import logging
import pickle
import numpy as np
import re
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLModelHandler:
    def __init__(self):
        self.rf_model = None
        self.ann_model = None
        self.preprocessor = None
        self.models_loaded = False
        self.load_models()
    
    def load_models(self):
        """Load the trained ML models and preprocessor"""
        try:
            # Check if model files exist
            rf_path = 'ml_models/rf_model.pkl'
            ann_path = 'ml_models/ann_model.h5'
            preprocess_path = 'ml_models/preprocess.pkl'
            
            if not all(os.path.exists(path) for path in [rf_path, ann_path, preprocess_path]):
                logger.warning("Some ML model files are missing. Using mock predictions for testing.")
                self.models_loaded = False
                return
            
            # Load Random Forest model
            with open(rf_path, 'rb') as f:
                self.rf_model = pickle.load(f)
            logger.info("Random Forest model loaded successfully")
            
            # Load ANN model
            try:
                from tensorflow import keras
                self.ann_model = keras.models.load_model(ann_path)
                logger.info("ANN model loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load ANN model: {e}")
                self.ann_model = None
            
            # Load preprocessor
            with open(preprocess_path, 'rb') as f:
                self.preprocessor = pickle.load(f)
            logger.info("Preprocessor loaded successfully")
            
            self.models_loaded = True
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.models_loaded = False
    
    def extract_food_parameters(self, text):
        """Extract food parameters from user input text"""
        text = text.lower()
        
        # Food type patterns (extended with Indian dishes, but not restricted to this list)
        food_types = {
            'pizza': ['pizza', 'pizzas'],
            'burger': ['burger', 'burgers', 'hamburger'],
            'sandwich': ['sandwich', 'sandwiches'],
            'salad': ['salad', 'salads'],
            'pasta': ['pasta', 'spaghetti', 'noodles', 'chowmein'],
            'rice': ['rice', 'fried rice', 'pulao', 'biryani'],
            'soup': ['soup', 'soups'],
            'chicken': ['chicken', 'fried chicken', 'tikka'],
            'fish': ['fish', 'salmon', 'tuna'],
            'vegetables': ['vegetables', 'veggies', 'carrots', 'broccoli'],
            # Indian dishes (examples; matcher will also accept arbitrary names via fallback)
            'rajma': ['rajma'],
            'dal': ['dal', 'daal'],
            'paneer': ['paneer', 'paneer butter masala', 'shahi paneer', 'kadhai paneer'],
            'rasgulla': ['rasgulla', 'rosogolla'],
            'gulab jamun': ['gulab jamun'],
            'jalebi': ['jalebi'],
            'kheer': ['kheer', 'payasam'],
            'poha': ['poha'],
            'upma': ['upma'],
            'pakora': ['pakora', 'bhaji'],
            'dosa': ['dosa'],
            'idli': ['idli'],
            'chole': ['chole', 'chana masala'],
            'paratha': ['paratha', 'aloo paratha'],
            'roti': ['roti', 'chapati']
        }
        
        # Packaging patterns
        packaging_types = {
            'plastic': ['plastic', 'plastic container', 'plastic bag'],
            'paper': ['paper', 'paper bag', 'paper box'],
            'aluminum': ['aluminum', 'aluminum foil', 'tin foil'],
            'glass': ['glass', 'glass container'],
            'cardboard': ['cardboard', 'cardboard box']
        }
        
        # Extract food type
        detected_food_type = None
        for food_type, keywords in food_types.items():
            if any(keyword in text for keyword in keywords):
                detected_food_type = food_type
                break
        
        # Fallback: accept arbitrary dish names by extracting noun phrase from query
        if not detected_food_type:
            # Try to capture between verbs and context words
            # e.g., "how long will rajma chawal in plastic packaging last at 25c"
            dish_match = re.search(r"how\s+long\s+(?:will|does)\s+(.+?)\s+(?:in|at|with|last|stay|remain)", text)
            if dish_match:
                candidate = dish_match.group(1).strip()
                # remove articles
                candidate = re.sub(r"\b(the|a|an)\b\s+", "", candidate)
                # keep letters, spaces
                candidate = re.sub(r"[^a-z\s]", "", candidate).strip()
                if candidate:
                    detected_food_type = candidate
            
            # Another fallback: words before "in <packaging>" if present
            if not detected_food_type:
                before_in = re.split(r"\s+in\s+", text)
                if len(before_in) > 1:
                    left_segment = before_in[0]
                    # remove common lead-in phrases
                    left_segment = re.sub(r"how\s+long\s+(will|does)\s+", "", left_segment).strip()
                    left_segment = re.sub(r"how\s+much\s+time\s+for\s+", "", left_segment).strip()
                    candidate = re.sub(r"[^a-z\s]", "", left_segment).strip()
                    # limit to 3 words to keep it concise
                    candidate = " ".join(candidate.split()[-3:])
                    if candidate:
                        detected_food_type = candidate
            
            # Last resort: first 2-3 words of the sentence after removing stopwords
            if not detected_food_type:
                cleaned = re.sub(r"[^a-z\s]", "", text)
                words = [w for w in cleaned.split() if w not in {"how", "long", "will", "does", "at", "with", "time", "last"}]
                if words:
                    detected_food_type = " ".join(words[:3])
        
        # Extract packaging
        detected_packaging = None
        for packaging, keywords in packaging_types.items():
            if any(keyword in text for keyword in keywords):
                detected_packaging = packaging
                break
        
        # Extract temperature (support: 28C, 28 C, 28 deg C, 28°F, etc.)
        temp_match = re.search(r'(-?\d+(?:\.\d+)?)\s*(?:degrees?\s*)?(c|f|celsius|fahrenheit|°c|°f|degc|degf)', text, flags=re.IGNORECASE)
        temperature = None
        if temp_match:
            temp_value = float(temp_match.group(1))
            temp_unit = temp_match.group(2).lower()
            if temp_unit in {'f', 'fahrenheit', '°f', 'degf'}:
                # Convert to Celsius
                temperature = (temp_value - 32) * 5/9
            else:
                temperature = temp_value
        
        # Extract humidity (look for numbers followed by humidity units)
        humidity_match = re.search(r'(\d+)\s*(percent|%|humidity)', text)
        humidity = None
        if humidity_match:
            humidity = float(humidity_match.group(1))
        
        return {
            'food_type': detected_food_type,
            'packaging': detected_packaging,
            'temperature': temperature,
            'humidity': humidity
        }
    
    def predict_consumption_time(self, food_type, packaging, temperature, humidity):
        """Predict food consumption time using both models or mock data"""
        try:
            if self.models_loaded and self.rf_model and self.preprocessor:
                # Use actual models
                input_data = np.array([[food_type, packaging, temperature, humidity]])
                processed_data = self.preprocessor.transform(input_data)
                rf_prediction = self.rf_model.predict(processed_data)[0]
                
                if self.ann_model:
                    ann_prediction = self.ann_model.predict(processed_data)[0][0]
                else:
                    ann_prediction = rf_prediction
                
                final_prediction = (rf_prediction + ann_prediction) / 2
                
                return {
                    'rf_prediction': round(rf_prediction, 2),
                    'ann_prediction': round(ann_prediction, 2),
                    'final_prediction': round(final_prediction, 2),
                    'model_type': 'actual'
                }
            else:
                # Use mock predictions for testing
                return self.get_mock_prediction(food_type, packaging, temperature, humidity)
                
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return self.get_mock_prediction(food_type, packaging, temperature, humidity)
    
    def get_mock_prediction(self, food_type, packaging, temperature, humidity):
        """Generate mock predictions for testing when models are not available"""
        # Base consumption times (in hours) for different food types
        base_times = {
            'pizza': 24,
            'burger': 12,
            'sandwich': 8,
            'salad': 6,
            'pasta': 18,
            'rice': 12,
            'soup': 48,
            'chicken': 24,
            'fish': 12,
            'vegetables': 72
        }
        
        # Packaging multipliers
        packaging_multipliers = {
            'plastic': 1.0,
            'paper': 0.7,
            'aluminum': 1.5,
            'glass': 1.3,
            'cardboard': 0.8
        }
        
        # Get base time
        base_time = base_times.get(food_type, 24)
        
        # Apply packaging multiplier
        packaging_mult = packaging_multipliers.get(packaging, 1.0)
        
        # Apply temperature effect (higher temp = shorter shelf life)
        temp_factor = 1.0
        if temperature is not None:
            if temperature > 25:
                temp_factor = 0.5  # Hotter = shorter life
            elif temperature < 5:
                temp_factor = 2.0  # Colder = longer life
        
        # Apply humidity effect
        humidity_factor = 1.0
        if humidity is not None:
            if humidity > 70:
                humidity_factor = 0.7  # High humidity = shorter life
            elif humidity < 30:
                humidity_factor = 1.2  # Low humidity = longer life
        
        # Calculate final prediction
        final_prediction = base_time * packaging_mult * temp_factor * humidity_factor
        
        # Add some randomness for realistic mock data
        import random
        rf_prediction = final_prediction * (0.9 + random.random() * 0.2)
        ann_prediction = final_prediction * (0.85 + random.random() * 0.3)
        
        return {
            'rf_prediction': round(rf_prediction, 2),
            'ann_prediction': round(ann_prediction, 2),
            'final_prediction': round(final_prediction, 2),
            'model_type': 'mock'
        }
    
    def is_food_consumption_query(self, text):
        """Check if the user query is about food consumption time"""
        food_keywords = [
            'food', 'consumption', 'time', 'how long', 'duration',
            'eat', 'eating', 'fresh', 'spoilage', 'expiry',
            'temperature', 'humidity', 'packaging', 'storage'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in food_keywords)
    
    def get_food_consumption_response(self, text):
        """Generate response for food consumption time queries"""
        # Extract parameters from text
        params = self.extract_food_parameters(text)
        
        # Check if we have enough parameters
        missing_params = []
        if not params['food_type']:
            missing_params.append('food type')
        if not params['packaging']:
            missing_params.append('packaging type')
        if params['temperature'] is None:
            missing_params.append('temperature')
        if params['humidity'] is None:
            missing_params.append('humidity')
        
        if missing_params:
            return f"I can help predict food consumption time! Please provide the following information: {', '.join(missing_params)}. For example: 'How long will pizza in plastic packaging last at 25°C with 60% humidity?'"
        
        # Make prediction
        prediction = self.predict_consumption_time(
            params['food_type'],
            params['packaging'],
            params['temperature'],
            params['humidity']
        )
        
        if prediction:
            # Return minimal output as requested: only "consume within X hours"
            try:
                hours_value = int(round(float(prediction['final_prediction'])))
            except Exception:
                hours_value = int(round(24))
            return f"consume within {hours_value} hours"
        else:
            return "Sorry, I couldn't process your food consumption query. Please try again with different parameters."

# Global instance
ml_handler = None

def initialize_ml_handler():
    """Initialize the ML model handler"""
    global ml_handler
    try:
        ml_handler = MLModelHandler()
        return ml_handler.models_loaded
    except Exception as e:
        logger.error(f"Failed to initialize ML handler: {e}")
        return False

def get_ml_response(text):
    """Get response from ML model for food consumption queries"""
    global ml_handler
    if ml_handler is None:
        return "ML models are not available. Please check the model files."
    
    return ml_handler.get_food_consumption_response(text)

def is_food_query(text):
    """Check if the query is related to food consumption"""
    global ml_handler
    if ml_handler is None:
        return False
    
    return ml_handler.is_food_consumption_query(text)
