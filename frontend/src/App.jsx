// src/App.jsx
import React from 'react';
import GameDashboard from './components/GameDashboard.jsx'; // <--- Import it!
import './App.css'; // Global styles

function App() {
    return (
        <div className="App">
            <header className="App-header"></header>
            <main>
                <GameDashboard/>
            </main>
            <footer className="App-footer"></footer>
        </div>
    );
}

export default App;