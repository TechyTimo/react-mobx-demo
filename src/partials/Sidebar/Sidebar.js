import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { observer } from "mobx-react"
import store from '../../utils/store.js';
import api from '../../utils/api.js';

@observer
class Sidebar extends Component {

  linkTo(pathName, icon, title) {
    return (
      <NavLink exact to={pathName} className="nav-link" activeClassName="active" onClick={this.closeAside}>
        <i className={icon}></i> {title}
      </NavLink>
      )
  }

  render() {
    
    return (

      <div className="sidebar">
        <nav className="sidebar-nav">
          <ul className="nav">
            <li className="nav-title">
            </li>

            <li className="nav-item">
              { this.linkTo('/profile', 'fa fa-user', 'Profile') }
            </li>
            
            <li className="nav-item">
              { this.linkTo('/friends', 'fa fa-users', 'Friends') }
            </li>

          </ul>
        </nav>
      </div>
    )
  }
}

export default Sidebar;
