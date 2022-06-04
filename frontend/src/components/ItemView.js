import { Fragment, useEffect } from "react";
import {
  useItemTitle,
  useItemSnippet,
  useItemImage,
  useItemStatus,
} from "../hooks/items";
import { useDispatch } from "react-redux";

function ItemView({ id, editMode }) {
  const title = useItemTitle(id);
  const snippet = useItemSnippet(id);
  const image = useItemImage(id);
  const status = useItemStatus(id);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: "FETCH_ITEM", id });
  }, [dispatch, id]);

  return (
    <Fragment>
      <div className="flex items-center space-x-4 ">
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
      <span className="inline-flex justify-between text-xs font-normal text-gray-600">
        {status}
      </span>
      {editMode ? (
        <div className="pt-2 space-x-4">
          <a
            href="#"
            className="inline-flex items-center text-xs text-blue-500 font-normal hover:underline dark:text-gray-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </a>
          <a
            href="#"
            className="inline-flex items-center text-xs text-blue-500 font-normal hover:underline dark:text-gray-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </a>
        </div>
      ) : null}
    </Fragment>
  );
}

export default ItemView;
