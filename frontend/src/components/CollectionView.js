import { useParams } from "react-router-dom";
import { useCollectionItems } from "../hooks/collections";
import { useEffect, useState } from "react";
import ItemView from "./ItemView";
import { useDispatch } from "react-redux";

function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [editMode, toggleEditMode] = useState(false);
  const items = useCollectionItems(id);

  useEffect(() => {
    dispatch({ type: "FETCH_COLLECTION", id });
  }, [dispatch, id]);

  return (
    <div className="p-5 mt-10 min-w-m bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center text-center h-15 p-4 space-y-2">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Web &amp; Mobile Industry
        </h5>
        <button
          onClick={() => toggleEditMode(!editMode)}
          className="text-sm font-medium text-black"
        >
          {editMode ? (
            <p className="w-6 h-6 text-green-800 font-bold">Done</p>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          )}
        </button>
      </div>
      <div>
        <ul
          className={`grid sm:grid-cols-1 ${
            // Only show 2 column row layout if at least 4 items
            items?.length >= 4 ? "lg:grid-cols-2" : ""
          } gap-4`}
        >
          {items
            ? items.map((id) => (
                <li
                  key={`item=${id}`}
                  className="sm:py-4 border rounded-lg p-4 hover:shadow-md"
                >
                  <ItemView id={id} editMode={editMode} />
                </li>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
}

export default CollectionView;
