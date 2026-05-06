import { createRoot } from "react-dom/client";
import { Layout } from "./app/layout";
import { HomePage } from "./app/page";

const root = createRoot(document.body);
root.render(
  <Layout>
    <HomePage />
  </Layout>,
);
