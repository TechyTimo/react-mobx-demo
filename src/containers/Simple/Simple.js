import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import store from '../../store.js';

// Pages
import Login from '../../pages/Login/'
import Register from '../../pages/Register/'
import ForgotPassword from '../../pages/ForgotPassword/'
import ResetPassword from '../../pages/ResetPassword/'
import Page404 from '../../pages/Page404/'
import Page500 from '../../pages/Page500/'

import { ToastContainer } from 'react-toastr';
const ReactToastr = require("react-toastr");
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

class Simple extends Component {
	
  constructor(props) {
    super(props)
    store.history = props.history
  };

  render() {
    return (
      <div className="app flex-row align-items-center">

      <ToastContainer ref={(input) => {store.toast = input;}}
        toastMessageFactory={ToastMessageFactory}
        className="toast-top-right" />
          
      	<Switch>
    			<Route exact path="/auth" render={()=><Redirect to="/auth/login"/>}/>
    			<Route path="/auth/login" name="Login" component={Login}/>
    			<Route path="/auth/register" name="Register" component={Register}/>
    			<Route path="/auth/forgot-password" name="Forgot Password" component={ForgotPassword}/>
    			<Route path="/auth/verify-email/:token" name="Verify Email" component={Login}/>
    			<Route path="/auth/reset-password/:token" name="Reset Password" component={ResetPassword}/>

    			<Route exact path="/pages" name="Page 404" component={Page404}/>
    			<Route path="/pages/404" name="Page 404" component={Page404}/>
    			<Route path="/pages/500" name="Page 500" component={Page500}/>
    			<Route path="/:path" name="404" component={Page404}/>
    		</Switch>

      </div>
    );
  }
}

export default Simple;
