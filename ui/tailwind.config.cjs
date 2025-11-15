module.exports = {
  //content: ["./*.{html,js}"],
  content: ["./*.html", "./editors/*.html"],
  theme: {
    extend: {
      content: {
        link: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
        bottom: "bottom",
        width: "width",
        right: "right",
        maxHeight: "max-height",
      },
    },
    screens: {
      tablet: "640px",
      laptop: "1024px",
      desktop: "1280px",
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
    },
    function ({ addVariant }) {
      addVariant("children", "& *");
      addVariant("children-hover", "& *:hover");
    },
  ],
};
