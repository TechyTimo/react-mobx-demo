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
	
	TOKEN_LIFESPAN = 60*60*24 // seconds => 1 hour
	REFRESH_LIFESPAN = 60*60*24*30 // seconds => 1 month

	fetchTokens(response) {
		let { authorization, refresh } = response.headers

		if(authorization){
			let token = authorization.substr(7, authorization.length)
			return [token, refresh]
		}

		return false
	}

	login(data){
		return axios.post(api.base + '/login', data).then(response => {
			let { success, message, data } = response.data
			if(!success){
				store.toastr('error', message)
				return Promise.reject(message)
			}
			// set session
			let [token, refresh] = api.fetchTokens(response)
			
			// save the token on the client
			api.saveToken(token)
			api.saveRefreshToken(refresh)

			// schedule token refreshing
			api.refreshToken()

			// inform
			store.toastr('success', message, 'Loading your data...')
			
			return Promise.resolve(token)
		})
	}
	saveToken(token){
		api.cookies.setItem('demo_app_token', token, api.TOKEN_LIFESPAN / 60 / 60) // in hours
		api.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
	}
	saveRefreshToken(refresh){
		api.cookies.setItem('demo_app_refresh', refresh, api.REFRESH_LIFESPAN / 60 / 60) // in hours
	}

	fakeLogin(data){
		return new Promise(function(resolve, reject){
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

			let token = api.createToken(user), 
				refresh = api.createToken(user, api.REFRESH_LIFESPAN) // in seconds
	  		
			// save the token on the client
			api.saveToken(token)
			api.saveRefreshToken(refresh)

			// schedule token refreshing
			api.refreshToken()

	  		return resolve(token, refresh)
			// return Promise.all([token, refresh]).then(res=>{ 
			// console.log(res[0], res[1])
			// 	return resolve(token, refresh)
			// })

		});
	}

	createToken(user, expiresIn = api.TOKEN_LIFESPAN){
		try{

			let { first_name, last_name, email, image } = user,
				payload = { 
					user: { first_name, last_name, email, image },
					from: 'frontend',
				},
				key = process.env.REACT_APP_KEY,
				options = { 
					algorithm: 'HS256',
					expiresIn: expiresIn, // in seconds
					notBefore: '0h',
					subject: user.id + ''
				},
				token = jwt.sign(payload, key, options)

			return token
		}
		catch(error) {
			store.toastr('error', error.message)
			return false
		}
	}
	@observable refreshingToken = 0
	refreshToken(){
		api.refreshingToken = setInterval(()=>{
			console.log('refreshing api token...')
			let refresh = api.cookies.getItem('demo_app_refresh')
			if(refresh){
				let user = api.decodeToken(refresh),
				token = api.createToken(user)
				// console.log('token', token.substr(token.length-5, token.length))
				api.saveToken(token)
			}
			else {
				store.logout()
				store.toastr('error', 'Session timed out', 'Please log in')
			}
		}, api.TOKEN_LIFESPAN*1000) // in milliseconds
	}

	decodeToken(token = api.cookies.getItem('demo_app_token')) {
		try{
			let key = process.env.REACT_APP_KEY,
				payload = jwt.verify(token, key),
				user = payload.user

			return user
    	}
		catch(error) {
			// @todo - report error + token + expiry
			console.log('Failed to decode token', token, error.message)
			store.logout()
			store.toastr('error', 'Welcome back', 'Please log in')
			return false
		}
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
	      let [token, refresh] = api.fetchTokens(response)
	      
	      // log in the user
	      store.login()
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

	updateUser(user, data) {
		return axios.post(`${api.base}/users/${user.id}`, data).then(response => {
		  let { success, message } = response.data
	      if(!success){
	        store.toastr('error', '', message)
	        return Promise.reject(message)
	      }
	      // update the view
	      user.first_name = data.first_name
	      user.last_name = data.last_name
	      user.email = data.email
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
