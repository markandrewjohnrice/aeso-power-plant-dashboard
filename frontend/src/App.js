import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import './App.css';

// Use relative URLs to leverage the proxy in package.json
const USE_PROXY = true; // Set to false to use direct URL
const API_BASE_URL = USE_PROXY ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8000');
const REFRESH_INTERVAL = 30000; // 30 seconds

function App() {
  const [plantsData, setPlantsData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch data from APIs
  const fetchData = async () => {
    try {
      console.log('Fetching from:', API_BASE_URL || 'proxy');
      // Get the strips data (all plants)
      const stripsRes = await axios.get(`${API_BASE_URL}/api/strips`);

      // Transform the strips data into the format we need
      const stripsData = stripsRes.data.data || [];
      
      // Group data by plant
      const plantMap = {};
      stripsData.forEach(point => {
        if (!plantMap[point.plant]) {
          plantMap[point.plant] = {
            plantid: point.plant,
            plantname: point.plant.charAt(0).toUpperCase() + point.plant.slice(1).replace('plant', ' Plant '),
            status: 'Online',
            totalnetgeneration: point.totalnetgeneration,
            capacity: point.max_capability,
            efficiency: 85 + Math.random() * 10, // Simulated efficiency
            dispatch: point.dispatch,
            capacityfactor: (point.totalnetgeneration / point.max_capability * 100),
            upperlimit: point.upperlimit,
            lowerlimit: point.lowerlimit,
            planttype: 'Combined Cycle',
            hourlydata: []
          };
        }
        // Add to hourly data for mini chart
        plantMap[point.plant].hourlydata.push({
          hour: point.time.split(' ')[1].substring(0, 5), // Get HH:MM
          generation: point.totalnetgeneration,
          upperlimit: point.upperlimit,
          lowerlimit: point.lowerlimit
        });
      });

      const plantsArray = Object.values(plantMap);
      setPlantsData(plantsArray);
      
      // For detail data, we'll use the same strips data for now
      // In a real app, you might fetch individual plant details when selected
      setDetailData(stripsData.map(point => ({
        plantid: point.plant,
        timestamp: point.time.split(' ')[1].substring(0, 5),
        totalnetgeneration: point.totalnetgeneration,
        dispatch: point.dispatch,
        upperlimit: point.upperlimit,
        lowerlimit: point.lowerlimit
      })));
      
      setLastUpdate(new Date());
      setLoading(false);
      setError(null);

      // Auto-select first plant if none selected
      if (!selectedPlant && plantsArray.length > 0) {
        setSelectedPlant(plantsArray[0].plantid);
      }
    } catch (err) {
      const errorMsg = err.response 
        ? `${err.response.status}: ${err.response.statusText}` 
        : err.message;
      setError(errorMsg);
      setLoading(false);
      console.error('Error fetching data:', err);
      console.error('Response:', err.response);
    }
  };

  // Initial fetch and setup interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get selected plant details
  const getSelectedPlantDetails = () => {
    if (!selectedPlant) return null;
    const plant = plantsData.find(p => p.plantid === selectedPlant);
    const details = detailData.filter(d => d.plantid === selectedPlant);
    return { plant, details };
  };

  // Format number with units
  const formatValue = (value, decimals = 1) => {
    return Number(value).toFixed(decimals);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {`${entry.name}: ${formatValue(entry.value)} MW`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h3>Connection Error</h3>
          <p>Error: {error}</p>
          <p>Tried to connect to: {API_BASE_URL || 'http://localhost:8000 (via proxy)'}</p>
          <details style={{ marginTop: '15px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>Troubleshooting Steps</summary>
            <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Verify FastAPI is running on port 8000</li>
              <li>Check if you can access: <a href="http://localhost:8000/" target="_blank" rel="noopener noreferrer">http://localhost:8000/</a></li>
              <li>Check if you can access: <a href="http://localhost:8000/api/strips" target="_blank" rel="noopener noreferrer">http://localhost:8000/api/strips</a></li>
              <li>Check the browser console (F12) for detailed errors</li>
            </ol>
          </details>
          <button onClick={fetchData} className="retry-button">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const selectedData = getSelectedPlantDetails();
  const totalGeneration = plantsData.reduce((sum, p) => sum + p.totalnetgeneration, 0);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>⚡ Power Plant Monitoring Dashboard</h1>
        <div className="status-bar">
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <span className="separator">|</span>
          <span>{plantsData.length} plants online</span>
          <span className="separator">|</span>
          <span>Total generation: {formatValue(totalGeneration, 0)} MW</span>
        </div>
      </header>

      <div className="top-pane">
        {plantsData.map((plant) => (
          <div
            key={plant.plantid}
            className={`strip ${selectedPlant === plant.plantid ? 'selected' : ''}`}
            onClick={() => setSelectedPlant(plant.plantid)}
          >
            <div className="strip-header">
              <div className="plant-name">{plant.plantname}</div>
              <div
                className={`plant-status ${
                  plant.status === 'Online' ? 'status-online' : 'status-offline'
                }`}
              >
                {plant.status}
              </div>
            </div>

            <div className="strip-metrics">
              <div className="metric">
                <div className="metric-label">Generation</div>
                <div className="metric-value">{formatValue(plant.totalnetgeneration)} MW</div>
              </div>
              <div className="metric">
                <div className="metric-label">Capacity</div>
                <div className="metric-value">{formatValue(plant.capacity)} MW</div>
              </div>
              <div className="metric">
                <div className="metric-label">Efficiency</div>
                <div className="metric-value">{formatValue(plant.efficiency)}%</div>
              </div>
              <div className="metric">
                <div className="metric-label">Dispatch</div>
                <div className="metric-value">{formatValue(plant.dispatch)} MW</div>
              </div>
              <div className="metric">
                <div className="metric-label">Utilization</div>
                <div className="metric-value">{formatValue(plant.capacityfactor)}%</div>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={plant.hourlydata}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    stroke="#999"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="#999"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="generation"
                    stroke="#667eea"
                    strokeWidth={2}
                    dot={false}
                    name="Generation"
                  />
                  <Line
                    type="monotone"
                    dataKey="upperlimit"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Upper Limit"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerlimit"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Lower Limit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {selectedData && selectedData.plant && (
        <div className="bottom-pane">
          <div className="bottom-header">
            {selectedData.plant.plantname} - Detailed Information
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Current Generation</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.totalnetgeneration)} MW
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Capacity</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.capacity)} MW
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Dispatch Target</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.dispatch)} MW
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Operating Efficiency</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.efficiency)}%
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Capacity Factor</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.capacityfactor)}%
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Upper Limit</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.upperlimit)} MW
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Lower Limit</div>
              <div className="detail-value">
                {formatValue(selectedData.plant.lowerlimit)} MW
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Plant Type</div>
              <div className="detail-value">{selectedData.plant.planttype}</div>
            </div>
          </div>

          <div className="large-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={selectedData.details}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorDispatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 11 }}
                  stroke="#999"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#999"
                  label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalnetgeneration"
                  stroke="#667eea"
                  strokeWidth={2}
                  fill="url(#colorGen)"
                  name="Generation"
                />
                <Area
                  type="monotone"
                  dataKey="dispatch"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorDispatch)"
                  name="Dispatch"
                />
                <Line
                  type="monotone"
                  dataKey="upperlimit"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Upper Limit"
                />
                <Line
                  type="monotone"
                  dataKey="lowerlimit"
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Lower Limit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;