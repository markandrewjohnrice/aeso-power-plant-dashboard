from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any
import uvicorn

app = FastAPI(title="Power Plant Dashboard API")

# Enable CORS for React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fixed configuration for each power plant
PLANT_CONFIGS = {
    "powerplant1": {
        "upperlimit": 500,
        "lowerlimit": 200,
        "dispatch": 400,
        "max_capability": 600,
        "ramp_rate": 50,
        "initial_generation": 350
    },
    "powerplant2": {
        "upperlimit": 750,
        "lowerlimit": 300,
        "dispatch": 600,
        "max_capability": 800,
        "ramp_rate": 75,
        "initial_generation": 500
    },
    "powerplant3": {
        "upperlimit": 400,
        "lowerlimit": 150,
        "dispatch": 300,
        "max_capability": 450,
        "ramp_rate": 40,
        "initial_generation": 275
    },
    "powerplant4": {
        "upperlimit": 600,
        "lowerlimit": 250,
        "dispatch": 500,
        "max_capability": 700,
        "ramp_rate": 60,
        "initial_generation": 425
    },
    "powerplant5": {
        "upperlimit": 900,
        "lowerlimit": 400,
        "dispatch": 750,
        "max_capability": 1000,
        "ramp_rate": 90,
        "initial_generation": 650
    },
    "powerplant6": {
        "upperlimit": 350,
        "lowerlimit": 100,
        "dispatch": 250,
        "max_capability": 400,
        "ramp_rate": 35,
        "initial_generation": 225
    }
}

def generate_plant_timeseries(plant_name: str, base_time: datetime) -> List[Dict[str, Any]]:
    """Generate 12 data points for a plant, one minute apart."""
    config = PLANT_CONFIGS[plant_name]
    data_points = []
    
    # Decide if trending up or down
    trending_up = random.choice([True, False])
    current_generation = config["initial_generation"]
    
    for i in range(12):
        # Calculate time for this data point
        point_time = base_time + timedelta(minutes=i)
        
        # Apply drift to generation
        if trending_up:
            target = config["upperlimit"]
            distance_to_target = target - current_generation
            drift = random.uniform(0, min(15, distance_to_target * 0.1))
            current_generation = min(current_generation + drift, config["upperlimit"])
        else:
            target = config["lowerlimit"]
            distance_to_target = current_generation - target
            drift = random.uniform(0, min(15, distance_to_target * 0.1))
            current_generation = max(current_generation - drift, config["lowerlimit"])
        
        # Add some noise
        current_generation += random.uniform(-5, 5)
        # Ensure we stay within limits
        current_generation = max(config["lowerlimit"], min(config["upperlimit"], current_generation))
        
        data_point = {
            "plant": plant_name,
            "time": point_time.strftime("%Y/%m/%d %H:%M:%S"),
            "upperlimit": config["upperlimit"],
            "lowerlimit": config["lowerlimit"],
            "totalnetgeneration": round(current_generation, 2),
            "dispatch": config["dispatch"],
            "max_capability": config["max_capability"],
            "ramp_rate": config["ramp_rate"]
        }
        data_points.append(data_point)
    
    return data_points

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Power Plant Dashboard API",
        "endpoints": [
            "/api/strips - Get time series data for all 6 power plants",
            "/api/strip/{plant_name}/details - Get dispatch details for a specific plant",
            "/docs - Interactive API documentation"
        ],
        "available_plants": list(PLANT_CONFIGS.keys()),
        "version": "1.0.0"
    }

@app.get("/api/strips")
async def get_strips():
    """Get time series data for all power plants."""
    # Use current time as base, rounded down to nearest minute
    base_time = datetime.now().replace(second=0, microsecond=0)
    base_time = base_time - timedelta(minutes=11)  # Start 11 minutes ago
    
    all_data = []
    
    # Generate data for each plant
    for plant_name in PLANT_CONFIGS.keys():
        plant_data = generate_plant_timeseries(plant_name, base_time)
        all_data.extend(plant_data)
    
    return {
        "data": all_data,
        "plant_count": len(PLANT_CONFIGS),
        "points_per_plant": 12,
        "total_points": len(all_data),
        "timestamp": datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    }

@app.get("/api/strip/{plant_name}/details")
async def get_strip_details(plant_name: str):
    """Get dispatch details for a specific power plant."""
    
    if plant_name not in PLANT_CONFIGS:
        return {
            "error": f"Plant {plant_name} not found",
            "available_plants": list(PLANT_CONFIGS.keys())
        }
    
    # Generate 5 dispatch records
    dispatch_data = []
    base_time = datetime.now().replace(second=0, microsecond=0)
    
    for i in range(5):
        dispatch_time = base_time - timedelta(minutes=i*3)
        
        # Vary dispatch amount around the configured dispatch value
        base_dispatch = PLANT_CONFIGS[plant_name]["dispatch"]
        dispatch_variation = random.uniform(-50, 50)
        dispatch_amount = max(100, base_dispatch + dispatch_variation)
        
        dispatch_record = {
            "plant": plant_name,
            "dispatchtime": dispatch_time.strftime("%Y/%m/%d %H:%M:%S"),
            "dispatch_amount": round(dispatch_amount, 2)
        }
        dispatch_data.append(dispatch_record)
    
    return {
        "plant": plant_name,
        "dispatch_records": dispatch_data,
        "record_count": len(dispatch_data),
        "timestamp": datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    }

if __name__ == "__main__":
    print("\n" + "="*50)
    print("Starting Power Plant API Server")
    print("="*50)
    print(f"Python version: {__import__('sys').version}")
    print(f"Server starting at: http://localhost:8000")
    print(f"API documentation: http://localhost:8000/docs")
    print(f"Test endpoint: http://localhost:8000/")
    print("="*50 + "\n")
    
    # Run without reload to avoid the warning
    uvicorn.run(app, host="0.0.0.0", port=8000)