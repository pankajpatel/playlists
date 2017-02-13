import React from 'react';
import Header from 'js/components/elements/Header';
import List from '../elements/List';

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div>
        <Header user={this.props.user || {} } />
        <div  className="container gutter" >
          <button className="btn btn-primary toggle-view pull-right" type="button" onClick={this.props.onChangeView}>Toggle</button>
          <h2>List/Grid View</h2>
          <List type={this.props.view} data={this.props.posts || []} />
        </div>
      </div>
      );
  }
}
export default Home
