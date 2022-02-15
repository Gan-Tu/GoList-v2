import React, { Fragment, useEffect } from "react";
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from "react-redux";
import ExampleUserInfo from './components/ExampleUserInfo';
import store from './state/store';
import * as serviceWorker from "./serviceWorker";
import reportWebVitals from './reportWebVitals';

const Root = () => {
  const abortController = new AbortController();
  useEffect(() => {
    return abortController.abort();
  });

  return (
    <Fragment>
      <Provider store={store}>
        <ExampleUserInfo />
      </Provider>
    </Fragment>
  );
};
ReactDOM.render(<Root />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorker.unregister();