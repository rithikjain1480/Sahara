import React, { Component } from 'react';
import './SearchButton.css';

export default class NavBar extends Component {
    render() {
        return (
            <div className="searchButton">
                <button id="searchButton" type="button" onClick={this.props.handleClick}>{this.props.text}</button>
            </div>
        );
    }
}
