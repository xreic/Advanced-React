// Dependencies
import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

// Components
import Page from '../components/Page';

class MyApp extends App {
  render() {
    const { Component, apollo, pageProps } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withData(MyApp);

export const getStaticProps = async ({ Componenet, ctx }) => {
  let pageProps = {};

  /**
   * Crawls through all pages for any queries or mutations
   * that need to be fetched before render
   * Important for SSR
   */

  if (Componenet.getInitialProps) {
    pageProps = await Componenet.getInitialProps(ctx);
  }

  // Exposes the URL queries to the user
  pageProps.query = ctx.query;
  return { props: pageProps };
};
