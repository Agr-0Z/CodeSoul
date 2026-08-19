const config = {
  plugins: {
    "@csstools/postcss-global-data": {
      files: ["./src/styles/media.css"],
    },
    "postcss-custom-media": {},
  },
};

export default config;
