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
