import constants from '../utility/constants';
import utils from '../utility/utilities';
import api from '../utility/api';

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import AppHeader from '../components/AppHeader';
import AddForm from '../components/reviews/AddReviewForm';

export default class AddReviewPage extends Component {
  constructor(props){
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(data){
    let self = this;

    // Try to add new review.
    api.addReview(data, function(exists, response){
      if (exists && response){
        // Get user id from parameters.
        // Redirect to page of user's reviews.
        browserHistory.push("/users/" + self.props.params.id + "/reviews");
      } else {
        console.log("Failed to create new review.");
      }
    });
  }

  render() {
    return (
      <div id="review-add" className="app">
        <AppHeader />
        <div className="app-body uk-container">
          <h2 className="uk-heading-line uk-text-center"><span>Review user</span></h2>
          <AddForm reviewerId={utils.getCookie(constants.COOKIE_A)} revieweeId={this.props.params.id} handleSubmit={this.handleSubmit} />
        </div>
      </div>
    );
  }
}
