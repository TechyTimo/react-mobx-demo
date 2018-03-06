import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '../../store.js';
import axios from 'axios';


class ForgotPassword extends Component {
   constructor(props){
    super(props)
    this.state = {
      email: '',
    }
    this.reset = this.reset.bind(this)
  }
  changeInput = e => {
    let { name, value } = e.target
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  reset(e){
    e.preventDefault()
    let data = {
      email: this.state.email,
      password: this.state.password,
    };

    axios.post(store.api + '/password/email', data).then(response => {
      if(!response.data.success){
        store.toastr('error', '', response.data.message)
        return;
      };
      this.props.history.push('/api/login')
      store.toastr('success', 'Successfully requested!', 'Check your email for a reset link')
    })
    
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
              <form onSubmit={this.reset} className="card-block">
                <h2>Forgot Password</h2>
                <p className="text-muted pt-1 float-left pt-h">Enter your email below</p>
                <div className="input-group mb-1 pb-1">
                  <span className="input-group-addon">@</span>
                  <input type="text" className="form-control" placeholder="email" 
                    value={this.state.email} onChange={this.changeInput} name="email"/>
                </div>
                <div>
                  <Link to="/auth/login" className="float-left btn btn-link px-0">Login</Link>
                  <button type="submit" className="float-right btn btn-primary px-2">Request Reset Link</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ForgotPassword;
