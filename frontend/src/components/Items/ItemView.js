import { useEffect } from "react";
import {
  useItemTitle,
  useItemSnippet,
  useItemImage,
  useItemLinkTarget,
} from "../../hooks/items";
import { useDispatch } from "react-redux";
import ItemSnippet from "./ItemSnippet";
import ItemControls from "./ItemControls";

export default function ItemView({ id, showControls }) {
  const title = useItemTitle(id);
  const snippet = useItemSnippet(id);
  const image = useItemImage(id);
  const link_target = useItemLinkTarget(id);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: "FETCH_ITEM", id });
  }, [dispatch, id]);

  if (showControls) {
    return (
      <>
        <ItemSnippet
          title={title}
          snippet={snippet}
          image={image}
          link_target={link_target}
        />
        <ItemControls id={id} />
      </>
    );
  } else {
    return (
      <a href={link_target || "#"} target="_blank" rel="noreferrer">
        <ItemSnippet
          title={title}
          snippet={snippet}
          image={image}
          link_target={link_target}
        />
      </a>
    );
  }
}
