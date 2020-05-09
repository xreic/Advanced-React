// Dependencies
import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

// Components
import Page from '../components/Page';

class MyApp extends App {
  /**
   * https://nextjs.org/docs/basic-features/data-fetching#only-runs-at-build-time
   */

  static getInitialProps = async ({ Component, ctx }) => {
    let pageProps = {};

    /**
     * Crawls through all pages for any queries or mutations
     * that need to be fetched before render
     */

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    pageProps.query = ctx.query;
    return { pageProps };
  };

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
