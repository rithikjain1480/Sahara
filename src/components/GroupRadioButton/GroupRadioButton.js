import React, { Component } from 'react';
import './GroupRadioButton.css';
import { Form, Radio } from 'semantic-ui-react';

export default class GroupRadioButton extends Component {
    render() {
        return (
            <React.Fragment>
                <Form.Field>
                  <Radio
                    label={this.props.label}
                    name={this.props.name}
                    value={this.props.type}
                    checked={this.props.showCategories}
                    onChange={this.props.onChange}
                    className="groupRadioButtons"
                  />
                </Form.Field>
                {this.props.showCategories ?
                    <div className="groupRadioCategories">
                        {this.props.categories}
                    </div>
                    :
                    <div className="emptyPadding"></div>
                }
            </React.Fragment>
        );
    }
}
