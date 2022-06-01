import { call, put, takeEvery } from "redux-saga/effects";

function* fetchCollection({ id }) {
  // const resp = yield call(fetch, `http://localhost:8080/collections?username=${username}&_limit=1`);
  const resp = yield call(fetch, `http://localhost:8080/collections/${id}`);
  if (!resp.ok) {
    console.error(resp.statusText);
    return;
  }
  const data = yield resp.json();
  if (!!data) {
    yield put({ type: "FETCH_COLLECTION_SUCCESS", id, data });
  } else {
    yield put({ type: "FETCH_COLLECTION_FAILED", id });
  }
}

export function* watchCollectionsApp() {
  yield takeEvery("FETCH_COLLECTION", fetchCollection);
}
