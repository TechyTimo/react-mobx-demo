import { computed, observable } from "mobx"
import api from './api.js'

const NAMESPACE = process.env.REACT_APP_NAMESPACE

class MainStore {

	@observable auth = false
	@observable status = {loaded: false}
	@observable redirectTo = '/'
	@observable history = {} // for navigation
  	@observable friends = []
  	@observable friend = {}
  	@observable posts = []
  	@observable post = {}
	@observable title = ''

	@computed get user(){
		// decode user from token
		let user = api.decodeToken()

		if(user){
			return user
		}
		else{
			
			// load the user from localStorage
			user = JSON.parse(localStorage.getItem(NAMESPACE+'user'))

			if(user){
				return user
			}
			else{
				// load user from api - last resort
				return api.fetchUser()
			}
		}
	}

	login(){
		return new Promise(function(resolve, reject){

			let token = api.cookies.getItem(NAMESPACE+'token')

			// set the token header
			api.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
			
			// declare logged in
			store.auth = true

			// save the user
			localStorage.setItem(NAMESPACE+'user', JSON.stringify({...store.user}))

			// redirect to designated route
			store.history.push(store.redirectTo)
			
			resolve()
		});
	}

	logout() {
		return new Promise(function(resolve, reject){
		    api.cookies.removeItem(NAMESPACE+'token')
		    api.cookies.removeItem(NAMESPACE+'refresh')
		    localStorage.removeItem(NAMESPACE+'user')

		    clearInterval(api.refreshingToken)
	        
	        delete api.axios.defaults.headers.common['Authorization']	        

		    store.auth = false
		    store.history.push('/auth/login')

		    store.friends = []
		    store.status.loaded = false
	    });
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
		// arr.tagged().where(key, value).sortBy(sort).orderBy(order)

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
		}

		String.prototype.isURL = function(){
			var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // source name and extension
			'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?'+ // port
			'(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
			'(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
			'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
			return pattern.test(this);
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
	@observable confirmCallback = () => false
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
