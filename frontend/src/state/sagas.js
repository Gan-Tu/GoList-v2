import { all } from "redux-saga/effects";
import { watchUsersApp } from "./redux/users";

export default function* rootSagas() {
    yield all([watchUsersApp()]);
}


