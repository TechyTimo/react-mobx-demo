import React, { Component } from 'react';

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <a href="http://demo.nairobi.io">Demo App</a> &copy; 2017.
        <span className="float-right">Designed by <a href="http://nairobi.io">Nairobi IO</a></span>
      </footer>
    )
  }
}

export default Footer;
