const initialState = {
  data: new Map(),
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_ITEM_SUCCESS":
      let newData = state.data;
      newData.set(action.id, action.data);
      return { ...state, data: newData };
    case "FETCH_ITEM_FAILED":
      console.log("failed");
      return state;
    default:
      return { ...state };
  }
}
