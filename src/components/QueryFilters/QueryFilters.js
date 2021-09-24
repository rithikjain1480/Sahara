import React, { Component } from 'react';
import './QueryFilters.css';
import CheckBox from '../CheckBox/CheckBox';

export default class QueryFilters extends Component {
    constructor(props){
        super(props);

        this.state = {
            categories: []
        }
    }

    componentDidMount(){
        // make sure this works if somehow a group has 0 categories

        if(this.props.categories.length !== 0){
            this.updateState();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.categories.length !== this.state.categories.length){
            this.updateState();
        }
        else {
            this.state.categories.forEach((item, i) => {
                if(item.key !== this.props.categories[i]){
                    this.updateState();
                }
            });

        }
    }

    updateState(){
        var tempCategories = [];
        this.props.categories.forEach((item, i) => {
            tempCategories.push(<div key={item}><CheckBox key={i} label={item} type={item.toLowerCase()} onChange={this.props.handleToggle} checked={this.props.checked.includes(item)} /></div>)
        });

        this.setState({
            categories: tempCategories
        });
    }

    render() {
        return (
            <div className="queryFiltersOuter">
                <div className="queryFilters">
                    {this.state.categories}
                </div>
            </div>
        );
    }
}
