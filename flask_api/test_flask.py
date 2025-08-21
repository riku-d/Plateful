import requests
import json

def test_flask_api():
    try:
        # Test data
        test_data = {
            "Food_Type": "vegetables",
            "Storage_Temp": 25,
            "Humidity": 65,
            "Packaging": "plastic"
        }
        
        # Make request to Flask API
        response = requests.post(
            "http://localhost:4000/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data)
        )
        
        if response.status_code == 200:
            print(f"✅ Flask API working! Response: {response.text}")
            return True
        else:
            print(f"❌ Flask API error: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask API on port 4000")
        return False
    except Exception as e:
        print(f"❌ Error testing Flask API: {e}")
        return False

if __name__ == "__main__":
    test_flask_api()
