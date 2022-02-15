// Return the user id of a given username, or error if any.
import { useSelector, useDispatch } from "react-redux";

function useUserId(username) {
    const dispatch = useDispatch();
    const uid = useSelector((store) => store.UserReducer.users.get(username)?.uid);
    if (!uid) {
        console.log(`User not fonud. Fetching user ${username}`);
        dispatch({ type: "FETCH_USER", username });
    }
    return uid;
}

export default useUserId;