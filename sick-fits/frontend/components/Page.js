import React, { Component } from 'react';

// Components
import Meta from './Meta';
import Header from './Header';

class Page extends Component {
  render() {
    return (
      <div>
        <Meta />
        <Header />
        {this.props.children}
      </div>
    );
  }
}

export default Page;
