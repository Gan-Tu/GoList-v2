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

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function useItemData(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id));
}

function useItemIsLoading(id) {
  return useSelector((store) => store.ItemsReducer.isLoading.get(id));
}

function useItemLinkTarget(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.linkTarget);
}

function useUrlMetadata(url) {
  const [metadata, setMetadata] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => {
    if (url) {
      let controller = new AbortController();
      fetch(`http://localhost:8080/getMetadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      })
        .then((resp) => resp.json())
        .then(setMetadata)
        .catch(setError);
      return () => controller.abort();
    }
  }, [url]);
  return [metadata, error];
}

export { useItemData, useItemIsLoading, useItemLinkTarget, useUrlMetadata };
