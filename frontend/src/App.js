import './App.css';
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const uid = useSelector((store) => store.UserReducer.user?.uid);
  const err = useSelector((store) => store.UserReducer.err);
  useEffect(() => {
    if (!uid && !err) {
      console.log("Fetching user: tugan");
      dispatch({ type: "FETCH_USER", uid: "tugan" });
    } else if (!!uid) {
      console.log("Found user: tugan");
    }
  }, [dispatch, uid, err]);

  return (
    <div >
      <p>UID: {uid}</p>
      <p>Error: {err}</p>
    </div>
  );
}

export default App;
