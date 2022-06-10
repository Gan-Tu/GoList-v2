import React, { Fragment, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App";
import store from "./state/store";
import * as serviceWorker from "./serviceWorker";
import reportWebVitals from "./reportWebVitals";

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
