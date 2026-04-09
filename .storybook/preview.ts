import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: {
      // Règles axe-core activées pour RGAA AA
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
          { id: "button-name", enabled: true },
          { id: "link-name", enabled: true },
        ],
      },
    },
  },
};

export default preview;
