import { useSelector } from "react-redux";

function useCollection(id) {
  return useSelector((store) => store.CollectionsReducer.data.get(id));
}

function useCollectionTitle(id) {
  return useSelector((store) => store.CollectionsReducer.data.get(id)?.title);
}

function useCollectionItems(id) {
  return useSelector(
    (store) => store.CollectionsReducer.data.get(id)?.item_ids
  );
}

export { useCollection, useCollectionTitle, useCollectionItems };
