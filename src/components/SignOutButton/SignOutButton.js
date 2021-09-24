import React, { Component } from 'react';
import './SignOutButton.css';
import {Button} from 'semantic-ui-react';
import firebase from '../Firebase';
import { Redirect } from "react-router-dom";

export default class SignOutButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            signOut: false
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        setTimeout(
            () => {
                firebase.auth().signOut().then(
                    () => {
                        this.setState({
                            signOut: true
                        });
                    },
                    () => {
                        console.log('error occurred. unable to sign out');
                        return;
                    }
                )
            }, 0
        );
    }

    render() {
        return (
            <React.Fragment>
                {this.state.signOut ?
                    <Redirect to='/' />
                    :
                    <Button onClick={this.handleClick}>Log Out</Button>
                }
            </React.Fragment>
        );
    }
}
