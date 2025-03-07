import { getLevel } from "@planning/common-utils";

export const checkLevelUp = (xpBefore: number, xpAfter: number) => {
    const levelBefore = getLevel(xpBefore).level;
    const levelAfter = getLevel(xpAfter).level;
    return levelBefore < levelAfter;
};
