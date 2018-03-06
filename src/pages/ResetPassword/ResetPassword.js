import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '../../utils/store.js';
import api from '../../utils/api.js';

class ResetPassword extends Component {

  constructor(props){
    super(props)
    this.state = {
      email: '',
      password: '',
      password_confirmation: '',
    }
    this.setPassword = this.setPassword.bind(this)
  }

  changeInput = e => {
    let { name, value } = e.target
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  setPassword(e){
    e.preventDefault()
    let data = {
      email: this.state.email,
      token: this.props.match.params.token,
      password: this.state.password,
      password_confirmation: this.state.password_confirmation,
    };

    api.resetPassword(data)
  }

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card-group mb-0 bg-white">
              <div className="card-block text-center bb-1">
                <Link to="/"><img src="/img/logo.png" className="logo" alt="Logo"/></Link>
              </div>
              <form onSubmit={this.setPassword} className="card-block">
                <h2>Reset Password</h2>
                <div className="input-group mt-1 mb-1">
                  <span className="input-group-addon"><i className="icon-envelope"></i></span>
                  <input type="text" name="email" className="form-control" placeholder="Email"
                    value={this.state.email} onChange={this.changeInput} name="email"/>
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-addon"><i className="icon-lock"></i></span>
                  <input type="password" name="password" className="form-control" placeholder="Password"
                    value={this.state.password} onChange={this.changeInput} name="password"/>
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-addon"><i className="icon-lock"></i></span>
                  <input type="password" name="password_confirmation" className="form-control" placeholder="Confirm Password"
                    value={this.state.password_confirmation} onChange={this.changeInput} name="password_confirmation"/>
                </div>
                <div>
                  <Link to="/auth/login" className="btn btn-link px-0">Login</Link>
                  <button type="submit" className="btn btn-primary px-2 float-right">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
