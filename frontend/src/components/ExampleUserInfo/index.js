import useUserId from '../../hooks/userId';

function ExampleUserInfo({ username }) {
  const uid = useUserId(username);
  return (
    <div >
      <p>Username: {username}</p>
      <p>UID: {uid}</p>
    </div>
  );
}

export default ExampleUserInfo;
