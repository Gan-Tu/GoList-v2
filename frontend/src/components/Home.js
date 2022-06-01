import { Link } from "react-router-dom";

function Home() {
  return (
    <div class="inline-flex rounded-md shadow-sm">
      <Link
        to="lists"
        className="py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-l-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
      >
        All Lists
      </Link>
      <Link
        to="lists/demo"
        className="py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-r-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
      >
        Demo List
      </Link>
    </div>
  );
}

export default Home;
