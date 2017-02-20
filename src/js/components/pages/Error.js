import React from 'react';
import Header from 'js/components/elements/Header';
import Form from '../elements/Form';
import Button from '../elements/Button';
import FormBlock from '../elements/FormBlock';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    let state = window.location.href.split('?')[1];
    state = state ? state.split('&').map(function(item){
      let pair = item.split('=');

        return {key: pair[0], value: pair[1] ? pair[1] : null};

    }) : [];
    this.setState({
      errors: state
    })
  }
  
  render(){
    console.log(this);
    return (
      <div>
        <Header user={false} />
        <div  className="container gutter" >
          <h2>Error</h2>
          <ul>
          {
            this.state ? this.state.errors.map(function(item, index) {
              return <li key={index}>{item.key}: {item.value}</li>
            }): null
          }
          </ul>
          <a href="/authenticate">Re-Authenticate</a>
        </div>
      </div>
      );
  }
}
