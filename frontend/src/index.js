import React, { Fragment, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App";
import store from "./state/store";
import * as serviceWorker from "./serviceWorker";
import reportWebVitals from "./reportWebVitals";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXPy7JK5KrtTB30vwH5IPusE_SmGZVhAw",
  authDomain: "golist-v2.firebaseapp.com",
  projectId: "golist-v2",
  storageBucket: "golist-v2.appspot.com",
  messagingSenderId: "429198896031",
  appId: "1:429198896031:web:eb5c6b33b3fbc512ac6baa",
  measurementId: "G-HLPL8XFWPS"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const Root = () => {
  const abortController = new AbortController();
  useEffect(() => {
    return abortController.abort();
  });

  return (
    <Fragment>
      <Provider store={store}>
        <App />
      </Provider>
    </Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorker.unregister();
