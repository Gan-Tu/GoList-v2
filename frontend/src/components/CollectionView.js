import { Link, useParams } from "react-router-dom";

function CollectionView() {
  let { name } = useParams();
  // return <p>Hi {name || "there"}!</p>;

  return (
    <div className="p-4 max-w-xl bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid text-center space-y-2 mb-6">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Web &amp; Mobile Industry
        </h5>
        <span className="space-x-4">
          <Link
            to="/lists"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
          >
            Home
          </Link>
          <Link
            to="/lists"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
          >
            Edit List
          </Link>
        </span>
      </div>
      <div className="flow-root">
        <ul role="list" className="space-y-4">
          <li className="py-3 sm:py-4 border rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                  New Icon for App
                </p>
                <p class="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
                  Building in trend is difficult enough, especially when you are
                  not well resourced to keep up with the styles all the time.
                </p>
              </div>
              <div class="flex-shrink-0 m-2">
                <img
                  class="w-12 h-12 rounded"
                  src="https://flowbite.com/docs/images/people/profile-picture-1.jpg"
                  alt="Neil image"
                />
              </div>
            </div>
            <span class="inline-flex items-center text-xs font-normal text-gray-600">
              {/* Created by Gan @ August 24, 2021 */}
              http://localhost:3000/lists/demo
            </span>
          </li>
          <li class="py-3 sm:py-4 border rounded-lg p-4 hover:shadow-md">
            <div class="flex items-center space-x-4">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                  Figma is Adobe Killer
                </p>
                <p class="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vel,
                  omnis earum amet sunt tenetur.
                </p>
              </div>
              <div class="flex-shrink-0 m-2">
                <img
                  class="w-12 h-12 rounded"
                  src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
                  alt="Neil image"
                />
              </div>
            </div>
            <span class="inline-flex items-center text-xs font-normal text-gray-600">
              {/* Created by Adam @ Sept 10, 2020 */}
              http://localhost:3000/lists/demo
            </span>
          </li>
          <li class="py-3 sm:py-4 border rounded-lg p-4 hover:shadow-md">
            <div class="flex items-center space-x-4">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                  Reprehenderit, modi incidunt!
                </p>
                <p class="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
                  voluptatum quasi illum corporis repudiandae voluptatem velit
                  quos provident impedit beatae mollitia autem!
                </p>
              </div>
              <div class="flex-shrink-0 m-2">
                <img
                  class="w-12 h-12 rounded"
                  src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
                  alt="Neil image"
                />
              </div>
            </div>
            <span class="inline-flex items-center text-xs font-normal text-gray-600">
              {/* Created by Ben @ Feb 02, 2022 */}
              http://localhost:3000/lists/demo
            </span>
          </li>
          <li className="py-3 sm:py-4 border rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  Consectetur adipiscing elit pellentesque
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
                  Purus non enim praesent elementum facilisis leo. Amet justo
                  donec enim diam vulputate ut pharetra. Id faucibus nisl
                  tincidunt eget nullam non.
                </p>
              </div>
              <div className="flex-shrink-0 m-2">
                <img
                  className="w-12 h-12 rounded"
                  src="https://flowbite.com/docs/images/people/profile-picture-4.jpg"
                  alt="Neil image"
                />
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-normal text-gray-600">
              {/* Created by Jennifer @ December 20, 2021 */}
              http://localhost:3000/lists/demo
            </span>
          </li>
          <li className="py-3 sm:py-4 border rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  Tempus iaculis urna id volutpat
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
                  Adipiscing enim eu turpis egestas pretium aenean pharetra.
                  Imperdiet massa tincidunt nunc pulvinar sapien et ligula.
                </p>
              </div>
              <div className="flex-shrink-0 m-2">
                <img
                  className="w-12 h-12 rounded"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="Neil image"
                />
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-normal text-gray-600">
              {/* Created by Jacob @ May 13, 2019 */}
              http://localhost:3000/lists/demo
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CollectionView;
