import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootReducer from '../reducers'

const Store = preloadedState => createStore(
  rootReducer,
  preloadedState,
  applyMiddleware(thunk, api)
)

export default Store
