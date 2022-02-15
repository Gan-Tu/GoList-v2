import { call, put, takeLatest } from "redux-saga/effects";

function* fetchUser({ username }) {
    if (username === 'tugan') {
        yield put({ type: "FETCH_USER_SUCCESS", username, user: { uid: 12345 } });
    } else if (username === 'foo') {
        yield put({ type: "FETCH_USER_SUCCESS", username, user: { uid: 67890 } });
    }
}

export function* watchUsersApp() {
    yield takeLatest("FETCH_USER", fetchUser);
}
