import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { observer } from "mobx-react"
import store from '../../store.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import axios from 'axios';

@observer
class Friends extends Component {

  constructor(props) {
    super(props)

    this.state = {
      modal: false,
      modalTitle: '',
      first_name: '',
      last_name: '',
      email: '',
      team_id: 0,
      list_id: 0,
      search: '',
      activeTab: '0',
      loading: false,
      // filters
      sort: 'first_name',
      descending: 1,
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.search = this.search.bind(this);
    this.newUser = this.newUser.bind(this);
    this.saveUser = this.saveUser.bind(this)
  }
  componentWillMount() {
    store.title = this.props.name
  }
  componentWillReceiveProps(props) {
    store.title = this.props.name
  }
  componentWillUnmount() {
    store.title = ''
  }
  getFriends(){
    let friends = store.users.filter(user => {
      var matchesFilter = new RegExp(this.state.search, "i")
      // except current user 
      if(user.id === store.user.id){
        return
      }
      // if(!this.state.search || matchesFilter.test(JSON.stringify(Object.values(user)))){
      let string = user['first_name'] + ' ' + user['last_name'] + ' ' + user['email']
      if(!this.state.search || matchesFilter.test(string)){
        return user
      }
    })
    // sort friends
    if(this.state.sort){
      friends = friends.sortBy(this.state.sort)
    }
    // order friends
    if(parseInt(this.state.descending)){
      friends = friends.slice(0).reverse()
    }
    else{
      friends = friends.slice(0)
    }
    return friends
  }

  search(e) {
    this.setState({
      search: e.target.value
    });
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  changeInput = e => {
    let { name, value } = e.target
    console.log(name, value)
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  newUser() {
    this.setState({
      modalTitle: 'Invite New User',
      first_name: '',
      last_name: '',
      email: '',
      team_id: 0,
      list_id: 0,
    });
    this.toggleModal()
  }

  saveUser() {

    this.setState({loading: true})

    // create the user object
    let data = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email, 
      active : this.state.active == 'Active',
      team_id: this.state.team_id, 
      list_id: this.state.list_id, 
    }
    
    // register the user on the api
    axios.post(`${store.api}/users`, data).then(response => {
      if(!response.data.success){
        store.toastr('error', '', response.data.message)
        this.setState({loading: false})
        return;
      }
      let user = response.data.data
      
      // add the user account
      store.users.push(user)

      // show toast
      store.toastr('success', 'Successfully invited user!', `${this.state.first_name} has been sent an email.`)
      
      // clear new-user form
      this.setState({
        modalTitle: '',
        first_name: '',
        last_name: '',
        email: '',
        team_id: 0,
        list_id: 0,
        loading: false,
      });

      // hide modal
      this.toggleModal()

    })

  }
  cardClasses(user){
    let classes = 'card'
    if(this.props.id == user.id){
      classes += ' card-orange'
    }
    if(user.roles && user.roles.includes('Admin')){
      classes += ' card-accent-warning'
    }
    return classes;
  }

  render() {

  const { presentDate, validateEmail } = store

    if (!store.status.loaded) {
      return (
        <div className="animated fadeIn">
          <h4>Loading...</h4>
        </div>
      )
    }
    return (
      <div className="animated fadeIn">
        
        <div className="row top">
          <div className="col-sm-12">
          <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggleTab('1'); }}
                >
                  <span className="fa fa-filter"></span> Filter Friends ({store.users.length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={this.newUser}
                >
                  <span className="fa fa-plus-circle"></span> Invite Someone
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ 'd-none': this.state.activeTab === '0' })}
                  onClick={() => { this.toggleTab('0');}}
                >
                 <span className="fa fa-close"></span>
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab} className="mb-1">
              <TabPane tabId="1">
                <form action="" method="post" className="form-inline">
                  <div className="form-group col-sm-6 p-0">
                    <span htmlFor="sort" className="col-sm-2 pl-0">Filter: </span>
                     <input type="text" 
                      className="form-control col-sm-10" id="search" placeholder="Search" 
                      value={this.state.search} onChange={this.search}/>
                  </div>
                  <div className="form-group col-sm-3 p-0">
                    <span htmlFor="sort" className="col-sm-4">Sort By: </span>
                    <select className="form-control col-sm-6" id="sort" value={this.state.sort} onChange={this.changeInput} name="sort">
                      <option value="first_name">Name</option>
                      <option value="created_at">Date Joined</option>
                    </select>
                  </div>
                  <div className="form-group col-sm-3 p-0">
                    <span htmlFor="sort" className="col-sm-4">Order: </span>
                    <select className="form-control col-sm-8" id="descending" value={this.state.descending} onChange={this.changeInput} name="descending">
                      <option value="1">Descending</option>
                      <option value="0">Ascending</option>
                    </select>
                  </div>
                </form>
              </TabPane>
            </TabContent>
          </div>
        </div>

        <div className="row">
          {this.getFriends().map(user => (
            <div className="col-sm-6 col-md-4" key={user.id}>
              <div className={this.cardClasses(user)}>
                <div className="card-header">
                  <Link to={'/friends/'+user.id} className="title" data-tip={user.intro} 
                    data-effect="solid" data-place="bottom">{user.first_name + ' ' + user.last_name}</Link>
                </div>
                
                <div className="my-h">
                  <div className="avatar col-2">
                    <img src={user.image || store.tempImage} className="img-avatar" alt="Image"/>
                  </div>
                  <div className="col-10 float-right">
                    <p className="mb-h"><b>Email:</b> {user.email} {!!user.email_verified && <span className="fa fa-check" data-tip="Verified" data-effect="solid"></span>}</p>
                    <p className="mb-h"><b>Joined:</b> {user.created_at} </p>
                  </div>
                  <br/>
                </div>
              </div>
            </div>
          ))}
          {store.users.length > 0 || (
            <div className="col-sm-12">
              <br/>
              <h5>Invite your first connection here</h5>
            </div>
          )}
          {store.users.length > 0 && this.getFriends().length === 0 && (
            <div className="col-sm-12">
              <br/>
              <h5>No friends match the selection...</h5>
            </div>
          )}

        </div>

        <Modal isOpen={this.state.modal} toggle={this.toggleModal} className="modal-info">
          <ModalHeader toggle={this.toggleModal}>{this.state.modalTitle}</ModalHeader>
          <ModalBody>
            <div className="form-group">
              <input type="text" 
                className="form-control" id="first_name" placeholder="First Name" 
                value={this.state.first_name} onChange={this.changeInput} name="first_name"/>
            </div>
            <div className="form-group">
              <input type="text" 
                className="form-control" id="last_name" placeholder="Last Name" 
                value={this.state.last_name} onChange={this.changeInput} name="last_name"/>
            </div>
            <div className="form-group">
              <input type="text" 
                className="form-control" id="email" placeholder="Email" 
                value={this.state.email} onChange={this.changeInput} name="email"/>
            </div>
            
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
            <Button className="float-right" color="primary" onClick={this.saveUser}  disabled={
              !this.state.first_name 
              || !this.state.last_name 
              || !validateEmail(this.state.email) 
              || (!parseInt(this.state.team_id) && !parseInt(this.state.list_id)) 
              || this.state.loading}>Send Invitation</Button>
          </ModalFooter>
        </Modal>

      </div>

    )
  }
}

export default Friends;
