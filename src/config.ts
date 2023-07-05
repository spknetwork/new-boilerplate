/* !!! DO NOT IMPORT config.js TO FRONTEND CODE !!! */

export default {
  usePrivate: process.env.USE_PRIVATE || "0", // "1" | "0"
  hsClientSecret: process.env.HIVESIGNER_SECRET || "", // when USE_PRIVATE=0 and HIVESIGNER client secret must be provided
  hsClientId: process.env.HIVESIGNER_ID || "ecency.app", // When USE_PRIVATE=0, this is used to override which user will do posting authority on behalf of the user via hive signer
  redisUrl: process.env.REDIS_URL,
  hive_id: process.env.HIVE_ID || "",
  theme: process.env.THEME || "",
  tags: [process.env.HIVE_ID || "", ...(process.env.TAGS?.split(",") || [])] || [
    process.env.HIVE_ID || ""
  ],
  availibleAccounts: process.env.ACCOUNTS ? +process.env.ACCOUNTS : 0,
  baseApiUrl: process.env.API_URL || "https://account-creator.3speak.tv/api"
};
