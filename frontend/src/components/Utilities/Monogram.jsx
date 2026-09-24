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

import { classNames, hueFromString, monogramLetter } from "./Helpers";

/**
 * A tinted tile with a letter, standing in for an image that does not exist:
 * a list with no cover, or a link whose page had no preview.
 *
 * `seed` picks the hue, so the same site or list always gets the same color;
 * `label` supplies the letter (defaults to the seed). Size the tile and the
 * letter with className / letterClassName. Decorative — the real name is
 * always printed next to it — so it is hidden from assistive tech.
 */
export default function Monogram({
  seed,
  label,
  className = "",
  letterClassName = "text-base"
}) {
  return (
    <div
      aria-hidden="true"
      style={{ "--h": hueFromString(seed) }}
      className={classNames(
        "monogram grid select-none place-items-center overflow-hidden",
        className
      )}
    >
      <span className={classNames("font-semibold leading-none", letterClassName)}>
        {monogramLetter(label ?? seed)}
      </span>
    </div>
  );
}
