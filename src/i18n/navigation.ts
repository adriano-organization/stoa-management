import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * `Link`, `redirect` e companhia já cientes da língua — usar sempre estes em vez
 * dos do `next/navigation`, para que um link continue na mesma língua no dia em
 * que houver mais do que uma.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
