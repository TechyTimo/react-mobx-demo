import { computed, observable } from "mobx"
import { TokenSigner, decodeToken } from 'jwt-js'
import cookies from './cookies.js'
import store from './store.js'
import database from './database.js'
import axios from 'axios'

export class APIStore {

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

	login(email, password){
		let data = { email, password }
		// replace with your server call...
		let user = database.users.where('email', email)[0] 
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
				reject(error)
			}
    	});
    }

	fetchUser() {
		return new Promise(function(resolve, reject){
			axios.get(api.base + '/user').then(response => {
			  if(!response.data.success){
				  store.logout()
				  store.toastr('error', '', response.data.message)
				  return;
			  }
			  if(response.data.data){
				let user = response.data.data
				resolve(user);
			  }
			})
		});
	}

	fetch(table){
		return new Promise(function(resolve, reject){
			let table = database[table] // replace with your server call
			resolve(table);
		});
	}
	
	@observable promises = []

	fetchAll() {
	  let tables = ['users', 'posts', 'comments'] // all necessary tables for first hydration
	  tables.map(table => {
		api.promises.push(api.fetch(table))
	  })
	  return Promise.all(api.promises).then(()=>{ api.status.loaded = true })
	}


}
let api = window.api = new APIStore

export default api
