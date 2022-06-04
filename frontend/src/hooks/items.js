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

function useItemLinkTarget(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.link_target);
}

export { useItemTitle, useItemSnippet, useItemImage, useItemLinkTarget };
