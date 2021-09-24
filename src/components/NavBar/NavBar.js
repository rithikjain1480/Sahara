import React, { Component } from 'react';
import './NavBar.css';
import SignOutButton from '../SignOutButton/SignOutButton';
import SubmitButton from '../SubmitButton/SubmitButton';
import {Link, Redirect} from 'react-router-dom';
import {Dropdown, Icon, Image, Search, Form, Button} from 'semantic-ui-react';
import logo from '../../images/logo.png';

export default class NavBar extends Component {
    constructor(props){
        super(props);

        this.state = {
            redirect: false,
            target: ''
        }

        this.link = this.link.bind(this);
    }

    link(target){
        if (window.location.pathname !== target){
            this.setState({
                target: target,
                redirect: true
            });
        }
    }

    render() {
        return (
            <div className="navBar">
                <React.Fragment>
                    {this.state.redirect ?
                        <Redirect to={this.state.target} />
                        :
                        <React.Fragment>
                            <Image src={logo} size="small" onClick={() => {this.link('/')}} rounded className="navBarLogo" />
                            <Form onSubmit={this.props.handleSubmit}>
                                <Form.Input placeholder='Search...' value={this.props.searchTerm} onChange={this.props.handleChange} icon={{ name: 'search', link: true, onClick: this.props.handleSubmit }} id="searchBar" />
                            </Form>
                            <Dropdown className="navBarDropDown" icon="user" size="large">
                                <Dropdown.Menu>
                                    <Dropdown.Item text='Create Listing' onClick={() => {
                                        this.link('/createlisting')
                                    }} />
                                    <Dropdown.Item text='Profile' onClick={() => {
                                        this.link('/memberprofile')
                                    }} />
                                    <Dropdown.Item text='Buy List' onClick={() => {
                                        this.link('/list')
                                    }} />
                                    <Dropdown.Item text='Buy Requests' onClick={() => {
                                        this.link('/requests')
                                    }} />
                                </Dropdown.Menu>
                            </Dropdown>
                            <SignOutButton />
                        </React.Fragment>
                    }
                </React.Fragment>
            </div>
        );
    }
}
