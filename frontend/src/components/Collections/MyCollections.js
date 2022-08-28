// Copyright 2022 Gan Tu
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { fixUrl } from "../Utilities/Helpers";
import CreateCollectionModal from "./CreateCollectionModal";

const people = [
  {
    url: "https://goli.st/demo",
    destination: "/demo",
    name: "Demo"
  },
  {
    url: "https://goli.st/web-mobile",
    destination: "/web-mobile",
    name: "Web & Mobile Industry"
  },
  {
    url: "https://goli.st/iceland",
    destination: "/iceland",
    name: "Iceland Itinerary"
  }
];

export default function MyCollections() {
  if (people.length <= 0) {
    return (
      <div>
        <p>You don't have any lists created yet.</p>
        <div className="grid mt-3 sm:grid-cols-1 lg:grid-cols-1 gap-5">
          <CreateCollectionModal />
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {people.map((data) => (
        <li
          key={data?.url}
          className="col-span-1 bg-white border rounded-lg divide-y divide-gray-200  hover:shadow-lg"
        >
          <a href={data?.destination || fixUrl(data?.url) || "#"}>
            <div className="w-full flex items-center justify-between p-6 space-x-6">
              <div className="flex-1 truncate w-48">
                <div className="flex items-center space-x-3">
                  <h3 className="text-gray-900 text-sm font-medium truncate">
                    {data?.name || "No Name"}
                  </h3>
                </div>
                <p className="mt-1 inline-flex justify-between text-xs font-normal line-clamp-1 text-gray-600 text-ellipsis overflow-hidden">
                  {data?.url}
                </p>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
