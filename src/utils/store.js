import { computed, observable } from "mobx"
import api from './api.js'

class MainStore {

	@observable api = process.env.REACT_APP_API+'/api'
	@observable auth = false
	@observable status = {loaded: false}
	@observable redirectTo = '/'
	@observable history = {} // for navigation
  	@observable user = {}
  	@observable friends = []
  	@observable posts = []
	@observable title = ''

	loadUser(){
		return new Promise(function(resolve, reject){

			// decode user from token
			let user = api.decodeUserFromToken()

			if(user){
				resolve(user)
			}
			else{
				
				// load the user from localStorage
				user = JSON.parse(localStorage.getItem('demo_app_user'))

				if(user){
					resolve(user)
				}
				else{
					// load user from api - last resort
					user = api.fetchUser().then(user => resolve(user))
				}
			}
		});
	}
	login(user, token){
		return new Promise(function(resolve, reject){
			// update user
			store.user = {...user}

			// set the token header
			api.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
			
			// save the token on the client
			api.cookies.setItem('demo_app_jwt', token, 1)
			
			// declare logged in
			store.auth = true

			// save the user
			localStorage.setItem('demo_app_user', JSON.stringify({...user}))

			// redirect to designated route
			store.history.push(store.redirectTo)
			
			resolve()
		});
	}

	logout() {
	    api.cookies.removeItem('demo_app_jwt')
	    localStorage.removeItem('demo_app_user')
        
        delete api.axios.defaults.headers.common['Authorization']	        

	    store.auth = false
	    store.history.push('/auth/login')

	    store.user = {}
	    store.friends = []
	    store.status.loaded = false
	}

	@observable isURL = (str) => {
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // source name and extension
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?'+ // port
		'(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
		'(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		return pattern.test(str);
	}

	@observable setPrototypes = () => {
		/**
		 * Padding numbers with zeroes
		 **/
		Number.prototype.padLeft = function(size){
		    var s = this+"";
		    while (s.length < (size || 2)) s = "0" + s;
		    return s;
		}
		/**
		 * Converting dates to desired format.
		 **/
		Date.prototype.toMysqlFormat = function() {
		  return this.toISOString().slice(0, 19).replace('T', ' ');
		}
		/**
		 * Find by key value
		 **/
		Array.prototype.where = function(key, value){
			return this.filter(item => item[key] == value)
		}
		/**
		 * Sort by key
		 **/
		Array.prototype.sortBy = function(key){
			return this.sort(function(a, b){
				a = a[key].toLowerCase()
				b = b[key].toLowerCase()
			    if(a < b) return -1;
			    if(a > b) return 1;
			    return 0;
			})
		}
		Array.prototype.contains = function(v) {
		    for(var i = 0; i < this.length; i++) {
		        if(this[i] === v) return true;
		    }
		    return false;
		};

		Array.prototype.unique = function() {
		    var arr = [];
		    for(var i = 0; i < this.length; i++) {
		        if(!arr.includes(this[i])) {
		            arr.push(this[i]);
		        }
		    }
		    return arr; 
		}
		// arr.tagged().where(key, value).sortBy(sort).orderBy(order)
		if (!String.prototype.includes) {
		  String.prototype.includes = function(search, start) {
		    'use strict';
		    if (typeof start !== 'number') {
		      start = 0;
		    }
		    
		    if (start + search.length > this.length) {
		      return false;
		    } else {
		      return this.indexOf(search, start) !== -1;
		    }
		  };
		}
	}

	@observable toast = {}

	@observable toastr = (type, title, body) => {
		this.toast[type](
		  body,
		  title, {
		  timeOut: 5000,
		  extendedTimeOut: 10000
		});
	}

	@observable validateEmail = (email) => {
		let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	// confirm modal
	@observable confirmTitle = 'Confirm'
	@observable confirmText = 'Are you sure you want to confirm this?'
	@observable confirmCallback = () => { return false }
	@observable confirmOpen = false
	
	// sharing modal
	@observable shareOpen = false
	@observable sharing = {}

}
let store = new MainStore

if(process.env.NODE_ENV === 'development'){
	window.store = store // expose for testing
}

export default store
