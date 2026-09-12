import { REPO_URL } from "./site";

/** Primary CTA: the published CLI package on npm. */
export const INSTALL_URL = "https://www.npmjs.com/package/@key-set/cli";

export const packageUrl = (name: string) => `${REPO_URL}/tree/main/packages/${name.replace("@key-set/", "")}`;
