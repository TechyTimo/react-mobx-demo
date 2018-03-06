// Packages
import React, { Component } from 'react';
import { Switch, Route, withRouter, Link } from 'react-router-dom';
import { observer } from "mobx-react"
import store from '../../store.js';

// Pages
import Profile from '../../pages/Profile/'
import Friends from '../../pages/Friends/'

// Container
import Simple from '../../containers/Simple/'

// Partials
import Header from '../../partials/Header/';
import Sidebar from '../../partials/Sidebar/';
import Footer from '../../partials/Footer/';
import Confirm from '../../partials/Confirm/';

import { ToastContainer } from 'react-toastr';
const ReactToastr = require("react-toastr");
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);


@observer
class Dashboard extends Component {

  constructor(props) {
    super(props)
    store.history = props.history
  };

  render() {
    return (
      <div className="app">
        
        <Header />
        <div className="app-body">
          <Sidebar {...this.props} />
          <div className="main" >

            <div className="container-fluid">
              <h2 className="title mb-1">{store.title}</h2>
            </div>
            <div className="container-fluid">
              
              <ToastContainer ref={(input) => {store.toast = input;}}
                toastMessageFactory={ToastMessageFactory}
                className="toast-top-right" />
              
              <Switch>
                {/* profile */}
                <Route path="/profile" render={()=><Profile name="Profile"/>}/>

                <Route exact path="/friends" render={()=><Friends url="friends" name="Friends"/>}/>

                <Route path="/:path" component={Simple}/>
                
              </Switch>

            </div>
          </div>
        </div>
        <Footer />
        <Confirm />
      </div>
    );
  }
}

export default withRouter(Dashboard);
