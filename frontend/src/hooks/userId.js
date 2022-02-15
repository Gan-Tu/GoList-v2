// Return the user id of a given username, or error if any.
import { useSelector, useDispatch } from "react-redux";

function useUserId(username) {
    const dispatch = useDispatch();
    const uid = useSelector((store) => store.UserReducer.user?.uid);
    const err = useSelector((store) => store.UserReducer.err);
    if (!uid && !err) {
        console.log(`User not fonud. Fetching user ${username}`);
        dispatch({ type: "FETCH_USER", uid: username });
    }
    return [uid, err];
}

export default useUserId;