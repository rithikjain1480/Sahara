import React, { Component } from 'react';
import './Members.css';
// import Button from '../Button/Button';
import {Button} from 'semantic-ui-react';

export default class GroupView extends Component {
    constructor(props){
        super(props);

        this.state = {
            members: []
        }
    }

    componentDidMount(){
        this.updateMembers();
    }

    componentDidUpdate(prevProps){
        var lengthChanged = prevProps.members.length === this.props.members.length;
        var shouldChangeState = false;
        if(lengthChanged){
            for(var i=0; i<prevProps.members.length; i++){
                if(prevProps.members[i].document !== this.props.members[i].document){
                    shouldChangeState = true;
                }
                if(shouldChangeState) {
                    this.updateMembers();
                    break;
                }
            }
        }
        else {
            this.updateMembers();
        }
    }

    updateMembers(){
        var tempMembers = [];
        this.props.members.forEach((item, i) => {
            tempMembers.push(<div className="membersInGroup" key={i}><p>{item}</p><Button color='red' name={item} onClick={this.props.removeMember}>Remove</Button></div>)
        });

        this.setState({
            members: tempMembers
        });
    }

    render() {
        return (
            <div className="members">
                {this.state.members}
            </div>
        );
    }
}
