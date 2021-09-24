import React, { Component } from 'react';
import './CheckBox.css';
import { Checkbox } from 'semantic-ui-react';

export default class CheckBox extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.checked ?
                    <React.Fragment>
                        <Checkbox label={<label id={this.props.type}>{this.props.label}</label>} name={this.props.label} onChange={this.props.onChange} className="checkBox" defaultChecked />
                        <br />
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Checkbox label={<label id={this.props.type}>{this.props.label}</label>} name={this.props.label} onChange={this.props.onChange} className="checkBox" />
                        <br />
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }
}
