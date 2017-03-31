import React, { Component } from 'react';

export default class CreateButton extends Component {
  render(){
    return(
      <a href={this.props.href} className="button-success uk-button uk-button-large uk-width-1">{this.props.name}</a>
    );
  }
}
