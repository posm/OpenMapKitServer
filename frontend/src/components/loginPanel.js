import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router'
import { Button } from "@blueprintjs/core";

import { login } from '../store/actions/auth';


class LoginPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username ? props.username : '',
      password: '',
      triedToLogin: false
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }
  changeUsername(event) {
    this.setState({username: event.target.value});
  }
  changePassword(event) {
    this.setState({password: event.target.value});
  }

  onSubmit = event => {
    event.preventDefault();
    this.props.authenticateUser(this.state.username, this.state.password);
    this.setState({triedToLogin: true});
  }

  render() {
    return(
      <div className="pt-input-group login center-block">
        {!this.props.username
          ? <div>
              <form onSubmit={this.onSubmit}>
                <h2>Sign in</h2>
                {this.state.triedToLogin &&
                  <div class="pt-callout pt-intent-danger">
                    <h4 class="pt-callout-title">Login failed</h4>
                    Verify your username or password.
                  </div>
                }
                <input type="text" className="pt-input mt-10" value={this.state.username}
                  onChange={this.changeUsername} placeholder="Username" />
                <input type="password" className="pt-input mt-10" value={this.state.password}
                  onChange={this.changePassword} placeholder="Enter your password..." />
                <Button type="submit" className="pt-large" intent="success" icon="log-in" text="Sign In" />
              </form>
            </div>
          : <Redirect to='/' />
      }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.auth.userDetails ? state.auth.userDetails.username : ''
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    authenticateUser: (username, password) => dispatch(login(username, password))
  };
};

LoginPanel = connect(mapStateToProps, mapDispatchToProps)(LoginPanel);

export { LoginPanel };
