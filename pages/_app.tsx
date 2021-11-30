// import '../styles/globals.css'
// import 'tailwindcss/tailwind.css';
import '../styles/tailwind.css';
import type { AppProps } from 'next/app';
import Layout from '../components/layout';
import { GoogleAnalytics } from '../src/components/GoogleAnalytics';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <GoogleAnalytics />
    </>
  );
}

export default MyApp;
