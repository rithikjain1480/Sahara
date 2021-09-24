import React, { Component } from 'react';
import './TextField.css';
import {Input} from 'semantic-ui-react';

export default class TextField extends Component {
    constructor(props){
        super(props);

        this.state = {
            type: this.props.type
        }
    }

    componentDidMount(){
        this.setType();
    }

    componentDidUpdate(prevProps){
        if(!prevProps){
            this.setType();
        }
        else if(this.props.type !== prevProps.type){
            this.setType();
        }
    }

    setType(){
        if(this.props.type === "memPassword" || this.props.type === "groupPassword" || this.props.type === "memVerify" || this.props.type === "groupVerify"){
            this.setState({
                type: "password"
            });
        }
        else if(this.props.type === "dob"){
            this.setState({
                type: "date"
            });
        }
        else {
            this.setState({
                type: this.props.type
            });
        }
    }

    render() {
        return (
            <div className="textField">
                <Input id={this.state.type} size="small" label={this.props.label} placeholder={this.props.placeholder} type={this.state.type} name={this.props.type} onChange={this.props.onChange} />
            </div>
        );
    }
}
