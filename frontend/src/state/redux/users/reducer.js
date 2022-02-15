const initialState = {
    user: null,
    err: null,
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "FETCH_USER_SUCCESS":
            return { ...state, user: action.user };
        case "FETCH_USER_FAILED":
            return { ...state, err: action.err };
        default:
            return { ...state };
    }
}
