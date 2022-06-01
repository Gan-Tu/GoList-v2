const initialState = {
  data: new Map(),
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_COLLECTION_SUCCESS":
      let newData = state.data;
      newData.set(action.id, action.data);
      console.log(newData);
      return { ...state, data: newData };
    case "FETCH_COLLECTION_FAILED":
      console.log("failed");
      return state;
    default:
      return { ...state };
  }
}
