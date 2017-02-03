import React, { Component } from 'react';
import NavBar from './NavBar';
import Card from './Card';
import '../../css/styles.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="app-header">
          <h1 className="uk-heading-divider uk-text-center">UNO-Shareboard</h1>
          <NavBar />
        </div>
        <div className="app-body uk-container">
          <div className="uk-child-width-1-3@m uk-grid-match" data-uk-grid>
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
          </div>
        </div>
      </div>
    );
  }
}

export default App;