import { Link, useParams } from "react-router-dom";
import { useCollectionItems } from "../hooks/collections";
import { useEffect } from "react";
import ItemView from "./ItemView";
import { useDispatch } from "react-redux";

function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const items = useCollectionItems(id);

  useEffect(() => {
    dispatch({ type: "FETCH_COLLECTION", id });
  }, [id]);

  return (
    <div className="p-4 max-w-xl bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid text-center space-y-2 mb-6">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Web &amp; Mobile Industry
        </h5>
        <span className="space-x-4">
          <Link
            to="/"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
          >
            Home
          </Link>
          <Link
            to={`/${id}`}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
          >
            Edit List
          </Link>
        </span>
      </div>
      <div className="flow-root">
        <ul role="list" className="space-y-4">
          {items
            ? items.map((id) => (
                <li
                  key={`item=${id}`}
                  className="py-3 sm:py-4 border rounded-lg p-4 hover:shadow-md"
                >
                  <ItemView id={id} />
                </li>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
}

export default CollectionView;
