// Packages
import React, { Component } from 'react';
import { Switch, Route, withRouter, Link } from 'react-router-dom';
import { observer } from "mobx-react"
import store from '../../utils/store.js';

// Pages
import Profile from '../../pages/Profile/'
import Friends from '../../pages/Friends/'
import Friend from '../../pages/Friend/'
import Post from '../../pages/Post/'

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
              <h2 className="title mb-1 mt-1">{store.title}</h2>
            </div>
            <div className="container-fluid">
              
              <ToastContainer ref={(input) => {store.toast = input}}
                toastMessageFactory={ToastMessageFactory}
                className="toast-top-right" />
              
              <Switch>
                {/* profile */}
                <Route path="/profile" render={()=><Profile name="Profile" user={store.user}/>}/>
                
                <Route exact path="/friends" render={()=><Friends url="friends" name="Friends"/>}/>
                
                <Route exact path="/friend/:slug" render={()=><Friend url="friend" name="Friend"/>}/>

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
