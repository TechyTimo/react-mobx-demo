import React, { Component } from 'react';
import { observer } from "mobx-react"
import store from '../../utils/store.js';
import { Link, withRouter } from 'react-router-dom';

@observer
class Post extends Component {
  
  // constructor(props) {
  //   super(props);
  // }
  
  // componentDidMount(){
  // }

  render() {
    return (
      <div className="animated fadeIn">
        <h4>{store.post.title}</h4>
        <br/>
        <div className="row">
          <div className="col-sm-12">
            {store.post.body}
          </div>
        </div>

      </div>

    )
  }
  
}

export default withRouter(Post);
