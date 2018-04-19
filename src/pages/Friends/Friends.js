import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { computed } from "mobx"
import { observer } from "mobx-react"
import store from '../../utils/store.js';
import api from '../../utils/api.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';

@observer
class Friends extends Component {

  constructor(props) {
    super(props)

    this.state = {
      modal: false,
      modalTitle: '',
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      search: '',
      activeTab: '0',
      submitting: false,
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
    let friends = store.friends.filter(user => {
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
    let obj = {}
    obj[name] = value;
    this.setState(obj);
  }

  newUser() {
    // clear the form
    this.setState({
      modalTitle: 'Invite New User',
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      submitting: false,
    });
    this.toggleModal()
  }

  saveUser() {

    this.setState({submitting: true})

    // create the user object
    let data = {
      id: this.state.id,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email, 
      active : this.state.active == 'Active',
    }
    
    if(this.state.id){ 
      // updating an existing user
      api.fakeEditUser(data).then(() => { // @todo - api.editUser
        this.toggleModal()
      })
    }
    else{
      // register the user on the api
      data.id = Date.now()
      data.image = '/img/avatars/empty.jpg'
      data.created_at = (new Date()).toMysqlFormat()
      api.fakeInviteUser(data).then(() => { // @todo - api.inviteUser
        this.toggleModal()
      })
    }

  }

  showEditForm ({ id, first_name, last_name, email }) {
    // populate form
    this.setState({
      modalTitle: 'Edit User', 
      id, 
      first_name, 
      last_name, 
      email,
      submitting: false,
    })
    // show modal
    this.toggleModal()
  }

  confirmDelete(user) {
    store.confirmTitle = 'Delete User'
    store.confirmText = `Are you sure you want to delete ${user.first_name + ' ' + user.last_name}?`
    store.confirmCallback = this.deleteUser.bind(this, user)
    store.confirmOpen = true
  }
 
  deleteUser(user){
    api.fakeDeleteUser(user).then(() => { // @todo - api.deleteUser()
      store.confirmOpen = false
      store.toastr('success', `Successfully removed!`, `${user.first_name + ' ' + user.last_name} was deleted!`)
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

  disabledSubmit() {
    // console.log('change observed')
    return !this.state.first_name 
      || !this.state.last_name 
      || !store.validateEmail(this.state.email) 
      || this.state.submitting
  }

  render() {

    const { presentDate } = store

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
                  <span className="fa fa-filter"></span> Filter Friends ({store.friends.length})
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
                    <span htmlFor="sort" className="col-sm-2 pl-1">Filter: </span>
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
                  <div className="form-group col-sm-3 p-0 pr-1">
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
                  <Link 
                    to={'/friend/'+user.slug} className="title" 
                    onClick={api.fakeFetchUser.bind(this, user.slug)}>
                    {user.first_name + ' ' + user.last_name}</Link>
                    <span className="float-right text-info">
                      <a href="javascript:;">
                        <i className="fa fa-remove" onClick={ this.confirmDelete.bind(this, user) } ></i>
                      </a>
                      <a href="javascript:;">
                        <i className="fa fa-pencil" onClick={ this.showEditForm.bind(this, user) }></i>
                      </a>
                    </span>
                </div>
                
                <div className="my-h">
                  <div className="col-sm-4 inline-block">
                    <img src={user.image || store.tempImage} className="img-avatar" alt="Image"/>
                  </div>
                  <div className="col-sm-8 float-right">
                    <p className="mb-h"><b>Email:</b> {user.email} {!!user.email_verified && <span className="fa fa-check"></span>}</p>
                    <p className="mb-h"><b>Joined:</b> {user.created_at} </p>
                  </div>
                  <br/>
                </div>
              </div>
            </div>
          ))}
          {store.friends.length > 0 || (
            <div className="col-sm-12">
              <br/>
              <h5>Invite your first connection here</h5>
            </div>
          )}
          {store.friends.length > 0 && this.getFriends().length === 0 && (
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
            <Button className="float-right" color="primary" onClick={this.saveUser} 
              disabled={this.disabledSubmit()}>{this.state.id ? 'Edit User' : 'Send Invitation'}</Button>
          </ModalFooter>
        </Modal>

      </div>

    )
  }
}

export default Friends;
