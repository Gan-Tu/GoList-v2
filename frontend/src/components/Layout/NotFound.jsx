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

// Heroicons' broken-link glyph; not among the shared re-exports in SvgIcons.
import { LinkSlashIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Button from "../Utilities/Button";
import StatusMessage from "../Utilities/StatusMessage";
import { useDocumentTitle } from "../../hooks/session";
import { prefetchMyListsProps } from "./prefetch";

/**
 * A real destination for a missing collection.
 *
 * Previously a bad short URL showed an indefinite "Loading..." spinner, then a
 * toast, then bounced to the home page on a timer — so the address bar lied
 * about where you were and there was nothing to read or act on.
 */
export default function NotFound({
  title = "This page doesn’t exist",
  message = "The link may be mistyped, or the collection may have been deleted."
}) {
  useDocumentTitle("Not found · GoList");

  return (
    <StatusMessage
      icon={LinkSlashIcon}
      eyebrow="404"
      title={title}
      actions={
        <>
          <Button as={Link} to="/" variant="primary" size="lg">
            Create a collection
          </Button>
          <Button
            as={Link}
            to="/_/myList"
            variant="ghost"
            size="lg"
            {...prefetchMyListsProps}
          >
            My Lists
          </Button>
        </>
      }
    >
      {message}
    </StatusMessage>
  );
}
