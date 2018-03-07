import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import store from '../../utils/store.js';

class Login extends Component {
  
  constructor(props){
    super(props)
    this.state = {
      email: process.env.REACT_APP_DEMO_EMAIL,
      password: process.env.REACT_APP_DEMO_PASSWORD,
    }
    this.login = this.login.bind(this)
  }

  changeInput = e => {
    let { name, value } = e.target
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  login(e){
    e.preventDefault()

    let email = this.state.email
    let password = this.state.password

    api.login(email, password)
      .then(([user, token]) => store.login(user, token))
      .then(api.fetch('friends'))
      .then(() => {
        store.toastr('success', 'Welcome', 'Successfully logged in!')
        store.status.loaded = true 
      }) 
  }

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8 col-sm-10">
            <div className="card-group mb-0 bg-white">

              <div className="card-block text-center bb-1">
                <Link to="/"><img src="/img/logo.png" className="logo" alt="Logo"/></Link>
              </div>
              <form onSubmit={this.login} className="card-block">
                <h1 className="float-left pb-1">Login</h1>
                
                <h5 className="float-right pt-1">
                  <Link to="/auth/register">Register</Link>
                </h5>

                <div className="input-group mb-1">
                  <span className="input-group-addon"><i className="icon-user"></i></span>
                  <input type="text" className="form-control" placeholder="Email" 
                    value={this.state.email} onChange={this.changeInput} name="email" />
                </div>
                <div className="input-group mb-2">
                  <span className="input-group-addon"><i className="icon-lock"></i></span>
                  <input type="password" className="form-control" placeholder="Password" 
                    value={this.state.password} onChange={this.changeInput} name="password"/>
                </div>
                <div className="row">
                  <div className="col-6">
                    <Link to="/auth/forgot-password" className="btn btn-link px-0">Forgot password?</Link>
                  </div>
                  <div className="col-6 text-right">
                    <button type="submit" className="btn btn-info px-2">Login</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
