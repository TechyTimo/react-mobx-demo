import { computed, observable } from "mobx"
import jwt from 'jsonwebtoken'
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
				return Promise.reject(message)
			}
			// set session
			let token = api.fetchToken(response)

			// inform
			store.toastr('success', message, 'Loading your data...')
			
			return Promise.resolve([data, token])
		})
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

				let { first_name, last_name, email, image } = user,
					payload = { 
						user: { first_name, last_name, email, image },
						from: 'frontend',
					},
					key = process.env.REACT_APP_KEY,
					options = { 
						algorithm: 'HS256',
						expiresIn: '1h', 
						notBefore: '0h',
						subject: user.id + ''
					},
					token = jwt.sign(payload, key, options)

				return resolve([user, token])
			}
			catch(error) {
				store.toastr('error', error.message)
			}
		})
	}

	decodeUserFromToken() {
		return new Promise(function(resolve, reject){
			try{
				let key = process.env.REACT_APP_KEY,
					payload = jwt.verify(api.token, key),
					user = payload.user

				// console.log(payload)

				store.user = {...user}
				resolve(store.user)
	    	}
			catch(error) {
				// @todo - report error + token + expiry
				console.log('Failed to decode token', api.token, error.message)
				store.logout().then(()=>{
					store.toastr('error', 'Welcome back', 'Please log in')
					reject(error)
				})
			}
    	})
    }

	fetchUser() {
		return axios.get(api.base + '/user').then(response => {
		  let { success, message, data } = response.data
		  if(!success){
			store.logout()
			store.toastr('error', '', message)
			return Promise.reject(message)
		  }
		  if(data){
			let user = data
			return Promise.resolve(user)
		  }
		})
	}

	fetch(table){
		return axios.get(store.api + '/' + table).then(response => {
			let { success, message, data } = response.data
			if(!success){
				store.toastr('error', '', message)
				return Promise.reject(message)
			}
			store[table] = data
			return Promise.resolve(store[table])
	    })
	}
	
	fakeFetch(table){
		return new Promise(function(resolve, reject){
			store[table] = database[table] 
			resolve(store[table])
		})
	}
	
	@observable promises = []

	fetchAll() {
	  let tables = ['friends', 'posts', 'comments'] // all necessary tables for first hydration
	  tables.map(table => {
		api.promises.push(api.fetch(table))
	  })
	  return Promise.all(api.promises).then(()=>{ api.status.loaded = true })
	}

	fetchFriend(friend_id){
		return axios.get(api.base + '/friends/' + friend_id).then(response => {
			let { success, message, data } = response.data
			if(!success){
				store.toastr('error', '', message)
				return Promise.reject(message)
			}
			store.friend = data
			return Promise.resolve(store.friend)
		})
	}
	
	fakeFetchFriend(slug){
		return new Promise(function(resolve, reject){
			let friend = database.friends.where('slug', slug)[0] 
			store.friend = friend
			resolve(store.friend)
		})
	}
	
	fetchPost(post_id){
		return axios.get(api.base + '/posts/' + post_id).then(response => {
			let { success, message, data } = response.data
			if(!success){
				store.toastr('error', '', message)
				return Promise.reject(message)
			}
			store.post = data
			return Promise.resolve(store.post)
		})
	}
	
	
	requestPasswordReset(data){
		return axios.post(api.base + '/password/email', data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return Promise.reject(message)
	      }
	      store.history.push('/api/login')
	      store.toastr('success', 'Successfully requested!', 'Check your email for a reset link')
	    })
	}

	resetPassword(data) {
		return axios.post(store.api + '/set-password', data).then(response => {
	      let { success, message, data } = response.data
	      if(!success){
	        store.toastr('error', message)
	        return Promise.reject(message)
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
	        return Promise.reject(message)
	      }
	      let user = data
	      
	      // add the user account
	      store.friends.push(user)

	      // show toast
	      store.toastr('success', 'Successfully invited user!', `${data.first_name} has been sent an email.`)
	    })
	}

	updateUser(data) {
		return axios.post(`${api.base}/users/${store.user.id}`, data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return Promise.reject(message)
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
			return Promise.reject(message)
	      }
	      store.toastr('success', 'Password updated!')
	    })
	}

	registerUser(data) {
		return axios.post(store.api + '/register', data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return Promise.reject(message)
	      }
	      
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
