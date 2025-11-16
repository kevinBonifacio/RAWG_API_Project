// src/App.jsx
import React from 'react';
import GameDashboard from './components/Dashboard'; // <--- Import it!
import './App.css'; // Global styles

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>My Game Data App</h1>
            </header>

            {/* The component is rendered here using JSX tags.
        If you later add routing (e.g., React Router), this is where the router would sit.
      */}
            <main>
                <GameDashboard />
            </main>

            <footer>
                <p>&copy; 2025 Data Project</p>
            </footer>
        </div>
    );
}

export default App;