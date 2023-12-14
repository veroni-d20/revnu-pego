import Head from "next/head";
import Layout from "@/components/Utilities/Layout";
import Hero from "@/components/Index/Hero";

export default function Index() {
  return (
    <>
      <Head>
        <title>Revnu | Like, Comment & Subscribe to earn Pego tokens</title>
      </Head>

      <Layout>
        <Hero />
      </Layout>
    </>
  );
}
