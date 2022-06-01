import { combineReducers } from "redux";
import CollectionsReducer from "./collections/reducer";
import ItemsReducer from "./items/reducer";

const reducers = combineReducers({
  CollectionsReducer,
  ItemsReducer,
});

export default reducers;
