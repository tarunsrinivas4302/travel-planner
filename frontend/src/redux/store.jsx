import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';
import { combineReducers } from "redux";
import { travelSuggestionsReducer } from "./travel-suggestions/reducer";



const rootReducers = combineReducers({
    travelSuggestions : travelSuggestionsReducer,
})  

const store = createStore(rootReducers, applyMiddleware({
    thunk, logger
}))

export default store;