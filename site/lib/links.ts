import { REPO_URL } from "./site";

/** Primary CTA: the repository README's installation section (npm release pending). */
export const INSTALL_URL = `${REPO_URL}#installation`;

export const packageUrl = (name: string) => `${REPO_URL}/tree/main/packages/${name.replace("@key-set/", "")}`;
