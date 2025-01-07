import {
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { Card } from "../components";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page fullWidth>
    <div className="home-section">
      <div className="graphs-section">
        {/* <OrderGraphs /> */}
      </div>
      <div className="cards-section">
        <Layout>
          <Card title="Order" />
          <Card title="Order" />
          <Card title="Order" />
          <Card title="Order" />
          <Card title="Order" />
          <Card title="Order" />
        </Layout>
      </div>
      <div className="order-details-section">
        {/* <OrderDetails /> */}
      </div>
    </div>
  </Page>
  );
}
