import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { observer } from "mobx-react"
import store from '../../utils/store.js';

@observer
class Header extends Component {

  sidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-hidden');
  }

  mobileSidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-mobile-show');
  }

  confirmLogout(){
    store.confirmTitle = 'Log Out'
    store.confirmText = 'Are you sure you want to log out?'
    store.confirmCallback = this.logout
    store.confirmOpen = true
  }
  
  logout(){
    store.confirmOpen = false
    store.logout()
  }

  render() {
    
    return (
      <header className="app-header navbar">
        
        <button className="navbar-toggler mobile-sidebar-toggler hidden-lg-up" onClick={this.mobileSidebarToggle} type="button">
          <span className="fa fa-indent"></span>
        </button>
        
        <Link to={'/'} className="navbar-brand logo"></Link>

        <button className="navbar-toggler mobile-sidebar-toggler hidden-lg-up float-right" type="button">
          <span className="fa fa-dedent"></span>
        </button>

        <ul className="nav navbar-nav hidden-md-down">
          <li className="nav-item">
            <a className="nav-link navbar-toggler sidebar-toggler" onClick={this.sidebarToggle} href="javascript:;">&#9776;</a>
          </li>
        </ul>
        <ul className="nav navbar-nav ml-auto">

          <li className="nav-item hidden-md-down">
            <a className="nav-link" href="javascript:;">
              <img src={ store.user.image || store.tempImage } className="img-avatar" alt=""/>
              <span className="hidden-md-down">{store.user.first_name}</span>
            </a>
          </li>
          <li className="nav-item hidden-md-down">
            <a className="nav-link" onClick={this.confirmLogout.bind(this)} href="javascript:;"><i className="icon-logout"></i></a>
          </li>
        </ul>
      </header>
    )
  }
}

export default Header;
