import React, { Component } from 'react';
import '../../css/styles.css';


function validateEmail(event) {
  // eslint-disable-next-line
  const re = /^[A-z0-9_%+-]+.*[A-z0-9_%+-]+@(my.)?uno.edu$/;
  return re.test(event);
}


export default class RegisterForm extends Component {
  constructor(props) {
    super(props);

    this.inputValid = "uk-input";
    this.inputInvalid = "uk-input uk-form-danger";

    this.state = {
      email: '',
      password: '',
      passwordConfirm: '',
      emailStyle: this.inputValid,
      passwordStyle: this.inputValid,
      passwordConfirmStyle: this.inputValid
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    // We have to check the value directly because the state doesn't get
    //   updated until render() is called again, which doesn't happen until
    //   after this method finishes being called. So by checking state instead
    //   of checking the value directly, we'd be one character behind.
    if (name === "email") {
      const style = validateEmail(value) ? this.inputValid : this.inputInvalid;
      this.setState({
        emailStyle: style
      });
    }

    else if (name === "password") {
      const style = value.length < 6 ? this.inputInvalid : this.inputValid;
      this.setState({
        passwordStyle: style
      });

      const confirmStyle = this.state.passwordConfirm !== "" && value !== this.state.passwordConfirm ? this.inputInvalid : this.inputValid;
      this.setState({
        passwordConfirmStyle: confirmStyle
      });
    }

    else if (name === "passwordConfirm") {
      const style = value === this.state.password ? this.inputValid : this.inputInvalid;
      this.setState({
        passwordConfirmStyle: style
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <form className="uk-form-stacked" onSubmit={this.handleSubmit}>
        <fieldset className="uk-fieldset">
          <legend className="uk-legend">Register</legend>
          <div className="uk-margin">
            <div className="uk-form-controls">
              <input name="email" className={this.state.emailStyle} type="text" placeholder="E-mail" value={this.state.email} onChange={this.handleInputChange} />
            </div>
            <label className="uk-form-label label-invalid" hidden={this.state.emailStyle === this.inputValid}>E-mail must be a UNO e-mail address</label>
          </div>
          <div className="uk-margin">
            <div className="uk-form-controls">
              <input name="password" className={this.state.passwordStyle} type="password" placeholder="Password" value={this.state.password} onChange={this.handleInputChange} />
            </div>
            <label className="uk-form-label label-invalid" hidden={this.state.passwordStyle === this.inputValid}>Password is too short (minimum 6 characters)</label>
          </div>
          <div className="uk-margin">
            <div className="uk-form-controls">
              <input name="passwordConfirm" className={this.state.passwordConfirmStyle} type="password" placeholder="Password (again)" value={this.state.passwordConfirm} onChange={this.handleInputChange} />
            </div>
            <label className="uk-form-label label-invalid" hidden={this.state.passwordConfirmStyle === this.inputValid}>Passwords don't match</label>
          </div>
          <div className="uk-margin">
            <button className="uk-button uk-button-secondary uk-align-center login-btn" type="submit" value="Register">Register</button>
          </div>
        </fieldset>
      </form>
    );
  }
}

/*
// Below is the old registration form. If we decide we don't like the tabs, we can go back to this (in conjunction with changing the landing page)

import React, { Component } from 'react';
import '../../css/styles.css';

export default class RegisterForm extends Component {
  render() {
    return (
      <div>
        <a href="#register-form" className="uk-button uk-button-text uk-align-right register-btn" data-uk-toggle>Register</a>
        <div id="register-form" data-uk-modal>
          <div className="uk-modal-dialog uk-modal-body">
            <p>
              <form>
                <fieldset className="uk-fieldset">
                  <legend className="uk-legend">Register</legend>
                  <div className="uk-margin">
                    <input className="uk-input" type="text" placeholder="E-mail" />
                  </div>
                  <div className="uk-margin">
                    <input className="uk-input" type="password" placeholder="Password" />
                  </div>
                  <div className="uk-margin">
                    <input className="uk-input" type="password" placeholder="Password (again)" />
                  </div>
                </fieldset>
              </form>
            </p>
            <p className="uk-text-right">
              <button className="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
              <button className="uk-button uk-button-secondary" type="button">Register</button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
*/
