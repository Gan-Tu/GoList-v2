import { useSelector } from "react-redux";

function useCollection(id) {
  return useSelector((store) => store.CollectionsReducer.data.get(id));
}

function useCollectionItems(id) {
  return useSelector(
    (store) => store.CollectionsReducer.data.get(id)?.item_ids
  );
}

export { useCollection, useCollectionItems };
