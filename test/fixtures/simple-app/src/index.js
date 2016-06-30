export default function() {
  console.log('default function export');
}

import { foo } from "./foo";
import bar from "./bar";

export { foo, bar };
