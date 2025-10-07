const config = {
  dashboard: {
    input: "../backend/swagger-spec.json",
    output: {
      target: "./api/index.ts",
      client: "react-query",
      mode: "single",
      override: {
        mutator: {
          path: "./api/fetch.ts",
          name: "customFetcher",
        },
      },
    },
  },
};

export default config;
