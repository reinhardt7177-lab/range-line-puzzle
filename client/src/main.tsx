import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./playful.css";
import "./generated-art.css";
import "./learning-copy.css";
import "./pilot.css";
import "./storybook.css";
import "./book-detail.css";
import "./lesson-layout.css";

createRoot(document.getElementById("root")!).render(<App />);

// Optional analytics: leave an unconfigured build free of placeholder requests.
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
if (analyticsEndpoint && analyticsId) {
  const analytics = document.createElement("script");
  analytics.defer = true;
  analytics.src = `${analyticsEndpoint.replace(/\/$/, "")}/umami`;
  analytics.dataset.websiteId = analyticsId;
  document.head.appendChild(analytics);
}
