import React, { Component } from 'react';
import './DropDown.css';
import up from '../../images/up.png';
import down from '../../images/down.png';
import { Accordion, Icon } from 'semantic-ui-react';

export default class DropDown extends Component {
    constructor(props){
        super(props);

        this.state = {
            dropDowns: [],
            active: false
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(){
        this.setState({
            active: !this.state.active
        });
    }

    render() {
        console.log(this.props.list);
        return (
            <div className="dropDown">
                <div className="dropDownInner">
                    <Accordion.Title active={this.state.active} onClick={this.handleClick}>
                        <Icon name='dropdown' />
                        {this.props.title + ' by ' + this.props.author + '  (' + this.props.requests + ' request' + (this.props.requests !== 1 ? 's' : '') + ')'}
                    </Accordion.Title>
                    <Accordion.Content active={this.state.active}>
                        <React.Fragment>
                            {this.props.list}
                        </React.Fragment>
                    </Accordion.Content>
                </div>
            </div>
        );
    }
}
