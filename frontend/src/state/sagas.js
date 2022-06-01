import { all } from "redux-saga/effects";
import { watchCollectionsApp } from "./redux/collections";

export default function* rootSagas() {
  yield all([watchCollectionsApp()]);
}
