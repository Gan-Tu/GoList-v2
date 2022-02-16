import { useUserId } from '../../hooks/users';

function ExampleUserInfo({ username }) {
  const [uid, name] = useUserId(username);
  return (
    <tr key={username}>
      <td>{username ? username : 'N/A'}</td>
      <td>{username ? name : 'N/A'}</td>
      <td>{username ? uid : 'N/A'}</td>
    </tr>
  );
}

export default ExampleUserInfo;
