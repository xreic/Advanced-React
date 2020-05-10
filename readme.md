![Advanced React & GraphQL](https://advancedreact.com/images/ARG/arg-facebook-share.png)

# Advanced React & GraphQL

These are the starter files and stepped solutions for the [Advanced React & GraphQL](https://AdvancedReact.com) course by [Wes Bos](https://WesBos.com/).

## Getting Help

The best place to get help is in the #advanced-react slack room - there is a link in your course dashboard.

## FAQ

**Q:** Which Extensions for VS Code is Wes using?
**A:** All my extensions are listed on [my dotfiles repo](https://github.com/wesbos/dotfiles), but specifically this course uses [ESLint](https://github.com/Microsoft/vscode-eslint) and [Prettier](https://github.com/prettier/prettier-vscode).

## Notes

### info
  - Refers to the client-side query, when being passed into the second argument of `ctx.db.query` or `ctx.db.mutation`
  - This helps determine the shape of the return data (?)

### [getInitialProps](https://nextjs.org/docs/api-reference/data-fetching/getInitialProps)
  - Only use `getInitialProps` to crawl thru the document to allow components to retrieve data from the URL
  - [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#only-runs-at-build-time)
    - This is because `getStaticProps` doesn't retrieve things that operate at request time (query parameters)