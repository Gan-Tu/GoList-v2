import { call, put, takeLatest } from "redux-saga/effects";

function* fetchUser({ uid }) {
    if (uid === 'tugan') {
        yield put({ type: "FETCH_USER_SUCCESS", user: { uid } });
    } else {
        yield put({ type: "FETCH_USER_FAILED", err: `User ${uid} not found` });
    }
}

export function* watchUsersApp() {
    yield takeLatest("FETCH_USER", fetchUser);
}
