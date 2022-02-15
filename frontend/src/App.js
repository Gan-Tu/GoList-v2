import { Fragment } from 'react';
import ExampleUserInfo from './components/ExampleUserInfo';

function App() {
  return (
   <Fragment>
    <ExampleUserInfo username="tugan" />
    <ExampleUserInfo username="bar" />
    <ExampleUserInfo username="foo" />
   </Fragment>
  );
}

export default App;
