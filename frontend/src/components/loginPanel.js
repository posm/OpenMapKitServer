import React from 'react';
import {connect} from 'react-redux';
import { Button } from "@blueprintjs/core";

import { login } from '../store/actions/auth';


class LoginPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username ? props.username : '',
      password: ''
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
    this.props.login(this.state.username, this.state.password);
  }

  render() {
    return(
      <div className="pt-input-group login center-block">
        <form onSubmit={this.onSubmit}>
          <input type="text" className="pt-input" value={this.state.username}
            onChange={this.changeUsername} placeholder="Username" />
          <input type="password" className="pt-input" value={this.state.password}
            onChange={this.changePassword} placeholder="Enter your password..." />
          <Button type="submit" intent="primary" icon="log-in" text="Sign In" />
        </form>
      </div>
    );
  }
}

function properties(state) {
  return {
    username: state.auth.userDetails.username
  }
}

LoginPanel = connect(properties, { login })(LoginPanel);

export { LoginPanel };
