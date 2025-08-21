

import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_setup import get_gemini_response
from ml_integration import initialize_ml_handler, get_ml_response, is_food_query

# Setup logging for the web app to capture errors and info
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize ML handler on startup
ml_initialized = False
try:
    ml_initialized = initialize_ml_handler()
    if ml_initialized:
        logging.info("ML models initialized successfully")
    else:
        logging.warning("ML models failed to initialize")
except Exception as e:
    logging.error(f"Error initializing ML models: {e}")

@app.route('/')
def index():
    """Serve the React app"""
    return jsonify({
        "message": "Smart AI Chatbot API is running",
        "status": "active",
        "ml_models_loaded": ml_initialized
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages with both Gemini AI and ML model integration"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        logging.info(f"Received chat message: {user_message}")
        
        if not user_message.strip():
            return jsonify({'response': "Please provide a message."})
        
        # Check if it's a food consumption query
        if ml_initialized and is_food_query(user_message):
            logging.info("Processing food consumption query with ML model")
            response = get_ml_response(user_message)
        else:
            logging.info("Processing general query with Gemini AI")
            response = get_gemini_response(user_message)
        
        return jsonify({'response': response})
        
    except Exception as e:
        logging.error(f"Error in chat(): {e}")
        return jsonify({'response': "An error occurred while processing your message."})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "ml_models_loaded": ml_initialized,
        "gemini_available": True
    })

@app.route('/api/food-prediction', methods=['POST'])
def food_prediction():
    """Direct endpoint for food consumption time prediction"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not ml_initialized:
            return jsonify({'error': 'ML models are not available'}), 503
        
        response = get_ml_response(user_message)
        return jsonify({'response': response})
        
    except Exception as e:
        logging.error(f"Error in food_prediction(): {e}")
        return jsonify({'error': 'Failed to process food prediction request'}), 500

#------------- RUN the Flask app -------------
if __name__ == '__main__':
    try:
        logging.info("Starting Flask app...")
        logging.info(f"ML models loaded: {ml_initialized}")
        app.run(debug=True, host='0.0.0.0', port=5001)
    except Exception as e:
        logging.error(f"Error starting Flask app: {e}")
