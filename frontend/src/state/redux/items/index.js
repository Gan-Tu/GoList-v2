import { call, put, takeEvery } from "redux-saga/effects";

function* fetchItem({ id }) {
  const resp = yield call(fetch, `http://localhost:8080/items/${id}`);
  if (!resp.ok) {
    console.error(resp.statusText);
    return;
  }
  const data = yield resp.json();
  if (!!data) {
    yield put({ type: "FETCH_ITEM_SUCCESS", id, data });
  } else {
    yield put({ type: "FETCH_ITEM_FAILED", id });
  }
}

export function* watchItemApp() {
  yield takeEvery("FETCH_ITEM", fetchItem);
}
