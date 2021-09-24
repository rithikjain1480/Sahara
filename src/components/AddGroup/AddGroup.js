import React, {Component} from 'react';
import './AddGroup.css';
import SubmitButton from '../SubmitButton/SubmitButton';
import TextField from '../TextField/TextField';
import {Form} from 'semantic-ui-react';

export default class AddGroup extends Component {
    render() {
        return (
            <div className="addGroup">
                <Form id="addGroupForm" onSubmit={this.props.handleSubmit}>
                    <TextField label="Add Group" type="addGroup" placeholder="New Group Name" onChange={this.props.handleChange} />
                </Form>
            </div>
        );
    }
}
