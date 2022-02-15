import { combineReducers } from "redux";
import UserReducer from './users/reducer';

const reducers = combineReducers({
    UserReducer,
});

export default reducers;
