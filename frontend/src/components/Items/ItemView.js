import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ItemSnippet from "./ItemSnippet";
import ItemControls from "./ItemControls";
import { useItemLinkTarget } from "../../hooks/items";

export default function ItemView({ id, showControls }) {
  const dispatch = useDispatch();
  const link_target = useItemLinkTarget(id);

  useEffect(() => {
    dispatch({ type: "FETCH_ITEM", id });
  }, [dispatch, id]);

  if (showControls) {
    return (
      <div className="sm:py-4 border rounded-lg p-4 hover:shadow-lg">
        <ItemSnippet id={id} />
        <ItemControls id={id} />
      </div>
    );
  } else {
    return (
      <div className="sm:py-4 border rounded-lg p-4 hover:shadow-lg">
        <a href={link_target || "#"} target="_blank" rel="noreferrer">
          <ItemSnippet id={id} />
        </a>
      </div>
    );
  }
}
