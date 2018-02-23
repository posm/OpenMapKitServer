import React from 'react';

import {
  Navbar, NavbarGroup, NavbarHeading, NavbarDivider, AnchorButton
} from "@blueprintjs/core";

import logo from '../icon.png'


export class Header extends React.Component {
  render() {
    return(
      <Navbar className="default-green-bg pt-dark">
        <NavbarGroup>
            <img className="pt-icon main-logo pt-align-left" src={logo} alt="omk logo" />
            <NavbarHeading>
              <h3>OpenMapKit Server</h3>
            </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="right">
            <AnchorButton className="pt-minimal" icon="home" href="/">Home</AnchorButton>
            <AnchorButton className="pt-minimal" icon="user" href="#/login/">Login</AnchorButton>
        </NavbarGroup>
      </Navbar>
    );
  }
}
