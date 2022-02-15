const initialState = {
    users: new Map(),
};

export default function reducer(state = initialState, action) {
    let newUsers = state.users;
    newUsers.set(action.username, action.user);
    switch (action.type) {
        case "FETCH_USER_SUCCESS":
            return { ...state, users: newUsers};
        default:
            return { ...state };
    }
}
