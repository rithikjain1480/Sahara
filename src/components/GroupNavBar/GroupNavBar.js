import React, { Component } from 'react';
import './GroupNavBar.css';
import SignOutButton from '../SignOutButton/SignOutButton';
// import Button from '../Button/Button';
import SubmitButton from '../SubmitButton/SubmitButton';
import {Link, Redirect} from 'react-router-dom';
import {Dropdown, Icon, Image, Search, Form, Button} from 'semantic-ui-react';
import logo from '../../images/logo.png';

export default class GroupNavBar extends Component {

    constructor(props){
        super(props);

        this.state = {
            redirect: false,
            target: ''
        }

        this.link = this.link.bind(this);
    }

    link(target){
        console.log(target, window.location.pathname);
        if (window.location.pathname !== target){
            this.setState({
                target: target,
                redirect: true
            });
        }
    }

    render() {
        return (
            <div className="groupNavBar">
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
                                    <Dropdown.Item text='Profile' onClick={() => {
                                        this.link('/groupprofile')
                                    }} />
                                    <Dropdown.Item text='Members' onClick={() => {
                                        this.link('/members')
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
