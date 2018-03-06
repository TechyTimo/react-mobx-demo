import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '../../utils/store.js';
import api from '../../utils/api.js';

class Register extends Component {

  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    }

    this.register = this.register.bind(this);
  }

  changeInput = e => {
    let { name, value } = e.target
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  register(e) {
    e.preventDefault()
    if(this.state.password !== this.state.password_confirmation){
      store.toastr('error', '', 'Your passwords do not match!')
      return;
    }

    let data = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email, 
      password : this.state.password,
      password_confirmation : this.state.password_confirmation,
    }

    api.registerUser(data).then(() => {
      // clear form 
      this.setState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
      })
      
      // redirect
      store.history.push('/auth/login')
    })
  }

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8 col-sm-10">
            <div className="card mx-2">
              <div className="card-block text-center bb-1">
                <Link to="/auth/login"><img src="/img/logo.png" className="logo" alt="Logo"/></Link>
              </div>
              <form onSubmit={this.register} className="card-block p-2">
                
                <h1 className="float-left pb-1">Register</h1>

                <h5 className="float-right pt-1">
                  <Link to="/auth/login">Log In</Link>
                </h5>
                
                <div className="input-group mb-1">
                  <span className="input-group-addon"><i className="icon-user"></i></span>
                  <input type="text" className="form-control" placeholder="First Name" 
                    value={this.state.first_name} onChange={this.changeInput} name="first_name"/>
                </div>
                <div className="input-group mb-1">
                  <span className="input-group-addon"><i className="icon-user"></i></span>
                  <input type="text" className="form-control" placeholder="Last Name" 
                    value={this.state.last_name} onChange={this.changeInput} name="last_name"/>
                </div>

                <div className="input-group mb-1">
                  <span className="input-group-addon">@</span>
                  <input type="text" className="form-control" placeholder="Email" 
                    value={this.state.email} onChange={this.changeInput} name="email"/>
                </div>

                <div className="input-group mb-1">
                  <span className="input-group-addon"><i className="icon-lock"></i></span>
                  <input type="password" className="form-control" placeholder="Password" 
                    value={this.state.password} onChange={this.changeInput} name="password"/>
                </div>

                <div className="input-group mb-2">
                  <span className="input-group-addon"><i className="icon-lock"></i></span>
                  <input type="password" className="form-control" placeholder="Repeat password" 
                    value={this.state.password_confirmation} onChange={this.changeInput} name="password_confirmation"/>
                </div>

                <button type="submit" className="btn btn-block btn-info">Create Account</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
