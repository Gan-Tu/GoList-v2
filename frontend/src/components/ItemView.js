import { Fragment, useEffect } from "react";
import {
  useItemTitle,
  useItemSnippet,
  useItemImage,
  useItemStatus,
} from "../hooks/items";
import { useDispatch } from "react-redux";

function ItemView({ id }) {
  const title = useItemTitle(id);
  const snippet = useItemSnippet(id);
  const image = useItemImage(id);
  const status = useItemStatus(id);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: "FETCH_ITEM", id });
  }, [id]);

  return (
    <Fragment>
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            {title}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
            {snippet}
          </p>
        </div>
        <div className="flex-shrink-0 m-2">
          <img
            className="w-12 h-12 rounded"
            src={image}
            alt={`Image for item ${id}`}
          />
        </div>
      </div>
      <span className="inline-flex items-center text-xs font-normal text-gray-600">
        {status}
      </span>
    </Fragment>
  );
}

export default ItemView;
