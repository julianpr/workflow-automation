import React, { Component } from 'react';
import '../App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from '../component/Home.js';
import Mainmenu from '../component/Mainmenu.js';
import History from '../component/History.js';
import Workflow from '../component/Workflow.js';
class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path='/' component={Home}></Route>
          <Route exact path="/mainmenu" component={Mainmenu}></Route>
          <Route exact path="/history" component={History}></Route>
          <Route exact path="/workflow" component={Workflow}></Route>
        </div>
      </Router>
    );
  }
}

export default App;
