import { combineReducers } from 'redux'
import user from './user'
import api from './api'

export default combineReducers({
  user,
  api
})
