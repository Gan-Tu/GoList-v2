const initialState = {
    users: new Map(),
    invalidUsernames: new Set(),
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "FETCH_USER_SUCCESS":
            let newUsers = state.users;
            newUsers.set(action.username, action.user);
            return { ...state, users: newUsers };
        case "FETCH_USER_FAILED":
            let newInvalidUsernames = state.invalidUsernames;
            newInvalidUsernames.add(action.username);
            return { ...state, invalidUsernames: newInvalidUsernames };
        default:
            return { ...state };
    }
}
