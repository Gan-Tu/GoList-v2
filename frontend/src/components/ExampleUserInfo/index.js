import useUserId from '../../hooks/userId';

function ExampleUserInfo() {
  const [uid, err] = useUserId("tugan");

  return (
    <div >
      <p>UID: {uid}</p>
      <p>Error: {err}</p>
    </div>
  );
}

export default ExampleUserInfo;
