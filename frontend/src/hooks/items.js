import { useSelector } from "react-redux";

function useItemTitle(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.title);
}

function useItemSnippet(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.snippet);
}

function useItemImage(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.image_url);
}

function useItemStatus(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.status);
}

export { useItemTitle, useItemSnippet, useItemImage, useItemStatus };
