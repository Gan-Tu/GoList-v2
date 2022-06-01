import { all } from "redux-saga/effects";
import { watchCollectionsApp } from "./redux/collections";
import { watchItemApp } from "./redux/items";

export default function* rootSagas() {
  yield all([watchCollectionsApp(), watchItemApp()]);
}
