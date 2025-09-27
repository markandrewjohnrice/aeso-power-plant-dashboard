# AESO Power Plant Dashboard

A real-time monitoring dashboard for power plant operations, built with React and FastAPI.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-green)
![Recharts](https://img.shields.io/badge/Recharts-2.10.0-orange)

## 🚀 Features

- **Real-time Monitoring**: Live updates every 30 seconds
- **6 Power Plant Strips**: Each showing current generation, capacity, efficiency, and dispatch metrics
- **Interactive Charts**: Mini charts for each plant with detailed views on selection
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Time Series Data**: 12-point historical data for trend analysis

## 📁 Project Structure

```
aeso-power-plant-dashboard/
├── backend/
│   ├── api_server.py          # FastAPI server with power plant data endpoints
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Component styles
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Node dependencies
│   └── .env                 # Environment variables
├── .gitignore
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install fastapi uvicorn
```

3. Start the FastAPI server:
```bash
python api_server.py
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Root endpoint: `http://localhost:8000/`
- Strips data: `http://localhost:8000/api/strips`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The dashboard will open at `http://localhost:3000`

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and available endpoints |
| `/api/strips` | GET | Time series data for all 6 power plants |
| `/api/strip/{plant_name}/details` | GET | Dispatch details for specific plant |
| `/docs` | GET | Interactive API documentation |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

### Power Plants Configuration

The dashboard monitors 6 power plants:
- `powerplant1` - Max Capacity: 600 MW
- `powerplant2` - Max Capacity: 800 MW
- `powerplant3` - Max Capacity: 450 MW
- `powerplant4` - Max Capacity: 700 MW
- `powerplant5` - Max Capacity: 1000 MW
- `powerplant6` - Max Capacity: 400 MW

## 🚦 Running in Production

### Build the React app:
```bash
cd frontend
npm run build
```

### Run FastAPI with production server:
```bash
cd backend
pip install gunicorn
gunicorn api_server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📈 Dashboard Features

- **Top Pane**: 6-8 plant strips showing:
  - Plant name and online status
  - Current generation (MW)
  - Total capacity (MW)
  - Operating efficiency (%)
  - Dispatch target (MW)
  - Capacity utilization (%)
  - Mini trend chart

- **Bottom Pane**: Detailed view of selected plant:
  - Comprehensive metrics grid
  - Large area chart with multiple data series
  - Generation vs Dispatch comparison
  - Upper/Lower operational limits

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with React and Recharts for visualization
- FastAPI for high-performance backend
- Inspired by AESO (Alberta Electric System Operator) operations

## 📞 Contact

Project Link: [https://github.com/markandrewjohnrice/aeso-power-plant-dashboard](https://github.com/markandrewjohnrice/aeso-power-plant-dashboard)