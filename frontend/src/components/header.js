import React from 'react';
import { connect } from "react-redux";

import {
  Navbar, NavbarGroup, NavbarHeading, AnchorButton, Button, Popover, Menu, MenuItem, Position
} from "@blueprintjs/core";

import { logout } from '../store/actions/auth';
import logo from '../icon.png'



class Header extends React.Component {
  renderAuthSubMenu() {
    if (this.props.userDetails &&
        this.props.userDetails.hasOwnProperty('username') &&
        this.props.userDetails.username !== null
      ) {
      const menu = <Menu>
                     <MenuItem className="pt-minimal" icon="log-out" label="Logout"
                       onClick={this.props.doLogout}
                     />
                   </Menu>;
      return (
        <Popover content={menu} position={Position.BOTTOM} className="pt-intent-default">
          <Button icon="user" text={this.props.userDetails.username} />
        </Popover>
      );
    } else {
      return <AnchorButton className="pt-minimal" icon="user" href="#/login/">
        Login
      </AnchorButton>
    }
  }
  render() {
    return(
      <Navbar className="default-green-bg pt-dark">
        <NavbarGroup>
            <img className="pt-icon main-logo pt-align-left" src={logo} alt="omk logo" />
            <NavbarHeading>
              <a href="/"><h3>OpenMapKit Server</h3></a>
            </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="right">
            <AnchorButton className="pt-minimal pt-white" icon="home" href="/">Home</AnchorButton>
            { this.renderAuthSubMenu() }
        </NavbarGroup>
      </Navbar>
    );
  }
}

const mapStateToProps = state => ({
  userDetails: state.auth.userDetails
});

const mapDispatchToProps = (dispatch) => {
  return {
    doLogout: () => dispatch(logout())
  };
};

Header = connect(mapStateToProps, mapDispatchToProps)(Header);

export { Header };
