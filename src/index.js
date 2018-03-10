import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import history from './utils/history'

// Containers
import Dashboard from './containers/Dashboard/'
import Simple from './containers/Simple/'

// data source
import store from './utils/store.js';
import api from './utils/api.js';


store.history = history
store.setPrototypes()


// remember the designated route in case they have to log in first
if(!window.location.pathname.includes('/auth')){
  store.redirectTo = window.location.pathname
}

let refresh = api.cookies.getItem('demo_app_refresh')

if(refresh){

  let user = api.decodeToken(refresh),
      token = api.createToken(user)

  api.saveToken(token)
  api.keepRefreshingToken()
  
  store.login()
  .then(api.fakeFetch.bind(null, 'friends')) // replace with api.fetch
  .then(() => {
    store.status.loaded = true 
  })
  .catch(error => {
    console.log(error)
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
