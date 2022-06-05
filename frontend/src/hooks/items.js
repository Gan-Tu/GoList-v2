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

import { useSelector } from "react-redux";

function useItemTitle(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.title);
}

function useItemSnippet(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.snippet);
}

function useItemImage(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.imageUrl);
}

function useItemLinkTarget(id) {
  return useSelector((store) => store.ItemsReducer.data.get(id)?.linkTarget);
}

export { useItemTitle, useItemSnippet, useItemImage, useItemLinkTarget };
