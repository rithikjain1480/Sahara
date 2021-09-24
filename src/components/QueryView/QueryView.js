import React, { Component } from 'react';
import './QueryView.css';

export default class QueryView extends Component {
    render() {
        return (
            <div className="queryView">
                {this.props.books}
            </div>
        );
    }
}
