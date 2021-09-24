import React, { Component } from 'react';
import './SubmitButton.css';
import { Button } from 'semantic-ui-react';

export default class SubmitButton extends Component {
    render() {
        return (
            <React.Fragment>
                <Button color='green' className="submitButton" onClick={this.props.handleClick}>Submit</Button>
            </React.Fragment>
        );
    }
}
