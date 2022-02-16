import { call, put, takeEvery } from "redux-saga/effects";

function* fetchUser({ username }) {
    const resp = yield call(fetch, `http://localhost:8080/users?username=${username}&_limit=1`);
    if (!resp.ok) {
        console.error(resp.statusText);
        return;
    }
    const data = yield resp.json();
    if (!!data && data.length > 0) {
        yield put({ type: "FETCH_USER_SUCCESS", username, user: data[0] });
    } else {
        yield put({ type: "FETCH_USER_FAILED", username });
    }
}

export function* watchUsersApp() {
    yield takeEvery("FETCH_USER", fetchUser);
}
