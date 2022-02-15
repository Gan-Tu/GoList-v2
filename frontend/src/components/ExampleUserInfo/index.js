import useUserId from '../../hooks/userId';

function ExampleUserInfo({ username }) {
  const [uid, name] = useUserId(username);
  if (!!uid) {
    return (
      <ul >
        <li>Username: {username}</li>
        <li>Name: {name}</li>
        <li>UID: {uid}</li>
      </ul>
    );
  } else {
    return (
      <ul>
        <li>Username `{username}` not found.</li>
      </ul>
    )
  }
}

export default ExampleUserInfo;
