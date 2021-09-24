import React, { Component } from 'react';
import './Button.css';

export default class Button extends Component {
    render() {
        return (
            <div className="button">
                <button type="button" onClick={this.props.handleClick} name={this.props.name}>{this.props.text}</button>
            </div>
        );
    }
}
