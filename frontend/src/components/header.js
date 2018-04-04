import React from 'react';
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import {
  Navbar, NavbarGroup, NavbarHeading, AnchorButton, Button, Popover, Menu,
  MenuItem, Position
} from "@blueprintjs/core";

import { logout } from '../store/actions/auth';
import logo from '../icon.png'


class Header extends React.Component {
  isAuthenticated(){
    return this.props.userDetails &&
      this.props.userDetails.hasOwnProperty('username') &&
      this.props.userDetails.username !== null
  }
  isAdmin() {
    return this.props.userDetails &&
      this.props.userDetails.hasOwnProperty('role') &&
      this.props.userDetails.role === 'admin'
  }
  renderAuthSubMenu() {
    if (this.isAuthenticated()) {
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
      return <Link to="/login">
        <AnchorButton className="pt-minimal" icon="user">
          Login
        </AnchorButton>
      </Link>
    }
  }
  render() {
    return(
      <Navbar className="default-green-bg pt-dark">
        <NavbarGroup>
            <img className="pt-icon main-logo pt-align-left" src={logo} alt="omk logo" />
            <NavbarHeading>
              <Link to="/"><h3>OpenMapKit Server</h3></Link>
            </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="right">
            <Link to="/">
              <Button className="pt-minimal pt-white" icon="home">
                Home
              </Button>
            </Link>
            { this.isAdmin() &&
              <Link to="/upload-form">
                <Button className="pt-minimal pt-white" icon="cloud-upload">
                  Upload Form
                </Button>
              </Link>
            }
            { this.isAdmin() &&
              <Link to="/archived-forms">
                <Button className="pt-minimal pt-white" icon="folder-close">
                  Archived Forms
                </Button>
              </Link>
            }
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
