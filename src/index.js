import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import history from './history'

// Containers
import Dashboard from './containers/Dashboard/'
import Simple from './containers/Simple/'

// data source
import store from './store.js';
import api from './api.js';
import axios from 'axios'


store.history = history
store.setPrototypes()


// remember the designated route in case they have to log in first
if(!window.location.pathname.includes('/auth')){
  store.redirectTo = window.location.pathname
}

// check if a token exists
if(api.token){
  
  // set token header 
  api.axios.defaults.headers.common['Authorization'] = `Bearer ${api.token}`

  store.loadUser()
    .then(user => {
      store.login(user, api.token)
      .then(api.fetch('friends'))
      .then(() => {
        store.status.loaded = true 
      })
    })

} 

function LoggedIn ({component: Component, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => store.auth === true
        ? <Component {...props} />
        : <Redirect to={{pathname: '/auth/login', state: {from: props.location}}} />}
    />
  )
  
}

function Guest ({component: Component, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => store.auth === false
        ? <Component {...props} />
        : <Redirect to={{pathname: store.redirectTo, state: {from: props.location}}} />}
    />
  )
}


ReactDOM.render(
  <BrowserRouter>

    <Switch>

      <Route exact path="/" render={()=><Redirect to="/profile"/>}/>
    	
    	<Route path="/pages" component={Simple}/>
  		
  		<Guest path='/auth' component={Simple} />

  		<LoggedIn path='/:path' component={Dashboard} />

    </Switch>

  </BrowserRouter>, document.getElementById('root')
);
