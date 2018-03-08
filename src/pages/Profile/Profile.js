import React, { Component } from 'react';
import { observe } from "mobx"
import { observer } from "mobx-react"
import store from '../../utils/store.js';
import api from '../../utils/api.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';

@observer
class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      old_password: '',
      password_confirmation: '',
    }

    this.resetUser = this.resetUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }
  
  changeInput = e => {
    let { name, value } = e.target
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  setUser(){
    let { user } = this.props
    this.setState({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    })
  }

  componentDidMount(){
    this.setUser()
  }

  resetUser(e) {
    e.preventDefault()
    this.setUser()
    store.toastr('info', 'Name, email, photo reset!')
  }
  
  updateUser(e) {
    e.preventDefault()
    let data = {      
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
    }
    // update on api
    api.updateUser(data)

  }

  updatePassword(e) {
    e.preventDefault()

    let data = {      
      old_password: this.state.old_password,
      password: this.state.password,
      password_confirmation: this.state.password_confirmation,
    }
    // update on api
    api.updatePassword(data)
      .then(() => {
        this.closeAside()
      })
  }

  render() {

    return (
      <div className="animated fadeIn">
        <h4>Your Profile</h4>
        <br/>
        <div className="row">
          <div className="col-sm-12">
          
            <h6>Account Settings</h6>

            <form action="" method="post" onSubmit={this.updateUser}>
              <div className="form-group">
                <label htmlFor="nf-first-name">First Name</label>
                <input type="text" id="nf-first-name" name="nf-first-name" className="form-control" 
                  placeholder="Name" value={this.state.first_name} onChange={this.changeInput} name="first_name"/>
                <span className="help-block">Enter first name</span>
              </div>
              <div className="form-group">
                <label htmlFor="nf-last-name">Last Name</label>
                <input type="text" id="nf-last-name" name="nf-last-name" className="form-control" 
                  placeholder="Name" value={this.state.last_name} onChange={this.changeInput} name="last_name"/>
                <span className="help-block">Enter last name</span>
              </div>
              <div className="form-group">
                <label htmlFor="nf-email">Email</label>
                <input type="email" id="nf-email" name="nf-email" className="form-control" 
                  placeholder="Email Address" value={this.state.email} onChange={this.changeInput} name="email"/>
                <span className="help-block">Enter your email</span>
              </div>
              <div className="form-group">
                <Button type="submit" color="primary"><i className="fa fa-check"></i> Update</Button>&nbsp;
                <Button type="reset" onClick={this.resetUser} color="secondary" className="float-right"><i className="fa fa-ban"></i> Reset</Button>&nbsp;
              </div>
            </form>

            <h6>Change Password</h6>

            <form action="" method="post">
              <div className="form-group">
                <label htmlFor="old_password">Current Password</label>
                <input type="password" id="old_password" name="old_password" className="form-control" placeholder="Current Password.."
                value={this.state.old_password} onChange={this.changeInput} name="old_password"/>
                <span className="help-block">Enter your old password</span>
              </div>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input type="password" id="password" name="password" className="form-control" placeholder="New Password.."
                value={this.state.password} onChange={this.changeInput} name="password"/>
                <span className="help-block">Enter your new password</span>
              </div>
              <div className="form-group">
                <label htmlFor="password_confirmation">Confirm Password</label>
                <input type="password" id="password_confirmation" name="password_confirmation" className="form-control" placeholder="Confirm New Password.."
                value={this.state.password_confirmation} onChange={this.changeInput} name="password_confirmation"/>
                <span className="help-block">Confirm the new password</span>
              </div>
              <div className="form-group">
                <Button type="submit" onClick={this.updatePassword} color="primary" className="btn-block"><i className="fa fa-check"></i> Update</Button>&nbsp;
              </div>
            </form>
          </div>
        </div>

      </div>

    )
  }
  
}

export default withRouter(Profile);
