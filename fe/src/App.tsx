import React from "react";
import "./App.css";
import { Header } from "./components/header/Header";
import Routes from "./routes/Routes";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes></Routes>
    </div>
  );
}

export default App;
