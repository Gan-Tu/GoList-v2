import { Link, useParams } from "react-router-dom";
import { useCollectionTitle, useCollectionItems } from "../hooks/collections";
import { useEffect, useState } from "react";
import ItemView from "./ItemView";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";

function EditButton({ editMode }) {
  if (editMode) {
    return <p className="w-6 h-6 text-green-600 font-bold">Done</p>;
  }
  return (
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
  );
}

function BreadCrumb({ title }) {
  return (
    <nav className="flex p-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            Home
          </Link>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
              {title}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}

function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [editMode, toggleEditMode] = useState(false);
  const title = useCollectionTitle(id);
  const items = useCollectionItems(id);

  useEffect(() => {
    dispatch({ type: "FETCH_COLLECTION", id });
  }, [dispatch, id]);

  return (
    <motion.div
      layout
      className="p-5 mt-10 min-w-m bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700"
    >
      <BreadCrumb title={title} />

      <div className="flex justify-between items-center text-center h-15 pl-4 pr-4 pb-4 space-y-2">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {title}
        </h5>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => toggleEditMode(!editMode)}
          className="text-sm font-medium text-black"
        >
          <EditButton editMode={editMode} />
        </motion.button>
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
                <motion.li
                  layout
                  key={`item=${id}`}
                  className="sm:py-4 border rounded-lg p-4 hover:shadow-lg"
                >
                  {/* // change showEditGroup to editMode */}
                  <ItemView id={id} showEditGroup={editMode} />
                </motion.li>
              ))
            : null}
        </ul>
      </div>
    </motion.div>
  );
}

export default CollectionView;
