import React, { Component } from 'react';
import { observer } from "mobx-react"
import store from '../../utils/store.js';
import api from '../../utils/api.js';
import { Link, withRouter } from 'react-router-dom';

@observer
class Friend extends Component {
  
  // constructor(props) {
  //   super(props);
  // }
  
  componentDidMount(){
    if(!store.friend.id){
      let slug = this.props.match.params.slug
      api.fakeFetchUser(slug)
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        <h4>{store.friend.first_name} {store.friend.last_name}</h4>
        <br/>
        <div className="row">
          <div className="col-sm-12">
            <Link to={'/friends'} className="btn btn-info btn-large">Back</Link>
          </div>
        </div>

      </div>

    )
  }
  
}

export default withRouter(Friend);
