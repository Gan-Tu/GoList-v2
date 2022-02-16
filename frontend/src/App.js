import { Table } from '@mantine/core';
import ExampleUserInfo from './components/ExampleUserInfo';
import { TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useState } from 'react';

function App() {
  const [usernames, setUsernames] = useState(['foo']);
  const form = useForm({
    initialValues: { username: [] },
  });

  return (
    <div style={{ margin: "50px" }}>
      <Table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>UID</th>
          </tr>
        </thead>
        <tbody>
          {
            usernames.map((name) => (<ExampleUserInfo key={name} username={name} />))
          }
        </tbody>
      </Table>

      <form onSubmit={form.onSubmit((values) => {
        if (!usernames.includes(values.username)) {
          setUsernames(usernames.concat(values.username));
        }
        form.reset();
      })}>
        <TextInput
          required
          placeholder="New username"
          {...form.getInputProps('username')}
        />
        <Button type="submit" style={{ margin: "10px" }}>Add username</Button>
      </form>
    </div>
  );
}

export default App;
