import { computed, observable } from "mobx"
import { TokenSigner, decodeToken } from 'jwt-js'
import cookies from './cookies.js'
import store from './store.js'
import database from './database.js'
import axios from 'axios'

class APIStore {

	@observable base = process.env.REACT_APP_API+'/api'
	@observable axios = axios // expose for testing
	@observable cookies = cookies // expose for testing

	@computed get token() {
		return api.cookies.getItem('demo_app_jwt')
	}

	fetchToken(response) {
		let { authorization } = response.headers
		if(authorization){
			return authorization.substr(7, authorization.length)
		}
		else {
			return false
		}
	}

	login(data){
		return axios.post(api.base + '/login', data).then(response => {
			let { success, message, data } = response.data
			if(!success){
				store.toastr('error', message)
				return Promise.reject();
			}
			// set session
			let token = api.fetchToken(response)

			if(token){
				// inform
				store.toastr('success', message, 'Loading your data...')
				
				return Promise.resolve([data, token])
			}
			else {
				store.toastr('error', 'Failed to authorize...', message)
				// @todo - report bug
				return Promise.reject();
			}
		});
	}

	fakeLogin(data){
		let { email, password } = data
		let user = database.friends.where('email', email)[0] 
		if(!user){
			store.toastr('error', 'Email not registered', 'No user by that email')
			return
		}
		if(user.password !== password){
			store.toastr('error', 'Wrong password', 'Try again')
			return
		}

		return new Promise(function(resolve, reject){
			try{
				let rawPrivateKey = process.env.REACT_APP_KEY,
				    tokenPayload = {
				    	...user,
				    	"issuedAt": Date.now(), 
					},
				    token = new TokenSigner('ES256k', rawPrivateKey).sign(tokenPayload)
				resolve([user, token]);
			}
			catch(error) {
				reject(error)
			}
		});
	}

	decodeUserFromToken() {
		return new Promise(function(resolve, reject){
			try{
				let tokenData = decodeToken(api.token),
					user = tokenData.payload;
				store.user = {...user}
				resolve(store.user);
	    	}
			catch(error) {
				// @todo - report error + token + expiry
				console.log('Failed to decode token')
				store.logout().then(()=>{
					store.toastr('error', 'Welcome back', 'Please log in')
					reject(error)
				})
			}
    	});
    }

	fetchUser() {
		return axios.get(api.base + '/user').then(response => {
		  let { success, message, data } = response.data
		  if(!success){
			store.logout()
			store.toastr('error', '', message)
			return;
		  }
		  if(data){
			let user = data
			Promise.resolve(user);
		  }
		})
	}

	fetch(table){
		return axios.get(store.api + '/' + table).then(response => {
	      let { success, message, data } = response.data
	      if(!success){
			store.toastr('error', '', message)
			return Promise.reject();
	      }
	      if(data){
      		store[table] = data;
	      	return Promise.resolve(store[table]);
	      }
	    })
	}
	
	fakeFetch(table){
		return new Promise(function(resolve, reject){
			store[table] = database[table] // replace with your server call
			resolve(store[table]);
		});
	}
	
	@observable promises = []

	fetchAll() {
	  let tables = ['friends', 'posts', 'comments'] // all necessary tables for first hydration
	  tables.map(table => {
		api.promises.push(api.fetch(table))
	  })
	  return Promise.all(api.promises).then(()=>{ api.status.loaded = true })
	}

	requestPasswordReset(data){
		return axios.post(api.base + '/password/email', data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return;
	      };
	      store.history.push('/api/login')
	      store.toastr('success', 'Successfully requested!', 'Check your email for a reset link')
	    })
	}

	resetPassword(data) {
		return axios.post(store.api + '/set-password', data).then(response => {
	      let { success, message, data } = response.data
	      if(!success){
	        store.toastr('error', message)
	        return;
	      }

	      // inform
	      store.toastr('success', message, 'Logging you in...')
		  
		  // set session
	      let token = api.fetchToken(response)
	      
	      // log in the user
	      store.login(data, token)
	      	.then(()=>{
	      		store.toastr('success', 'Welcome', 'Successfully logged in!')
	      	})
	    })
	}

	inviteUser(data) {
		return axios.post(`${api.base}/users`, data).then(response => {
	      let { success, message, data } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return;
	      }
	      let user = data
	      
	      // add the user account
	      store.friends.push(user)

	      // show toast
	      store.toastr('success', 'Successfully invited user!', `${data.first_name} has been sent an email.`)
	    });
	}

	updateUser(data) {
		return axios.post(`${api.base}/users/${store.user.id}`, data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return;
	      }
	      // update the view
	      store.user.first_name = data.first_name
	      store.user.last_name = data.last_name
	      store.user.email = data.email
	      store.toastr('success', 'Name, email, photo updated!')
	    })
	}

	updatePassword(data) {
		return axios.post(`${api.base}/password`, data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	          store.toastr('error', '', message)
	          return;
	      }
	      store.toastr('success', 'Password updated!')
	    })
	}

	registerUser(data) {
		return axios.post(store.api + '/register', data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return;
	      };
	      
	      // notify
	      store.toastr('success', 'Successfully registered!', `Check ${data.email} for a link.`)

	    })
	}
}
let api = new APIStore

if(process.env.NODE_ENV === 'development'){
	window.api = api // expose for testing
}

export default api
