import React, { Component } from 'react';
import './GroupQueryFilters.css';
import CheckBox from '../CheckBox/CheckBox';

export default class GroupQueryFilters extends Component {
    constructor(props){
        super(props);

        this.state = {
            listingType: [],
            categories: []
        }
    }

    componentDidMount(){
        // make sure this works if a group has 0 categories
        if(this.props.categories.length !== 0){
            this.updateState();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.categories.length !== this.state.categories.length){
            this.updateState();
        }
        else if(this.props.checkedListings.length !== prevProps.checkedListings.length){
            this.updateState();
        }
        else {
            this.state.categories.forEach((item, i) => {
                if(item.key !== this.props.categories[i]){
                    this.updateState();
                    return;
                }
            });

            this.props.checkedListings.forEach((item, i) => {
                if(item !== prevProps.checkedListings[i]){
                    this.updateState();
                    return;
                }
            });

        }
    }

    updateState(){
        var tempCategories = [];
        this.props.categories.forEach((item, i) => {
            tempCategories.push(<div key={item}><CheckBox key={i + 3} label={item} type={item.toLowerCase()} onChange={this.props.handleToggle} checked={this.props.checked.includes(item)} /></div>);
        });

        this.setState({
            categories: tempCategories
        });

        var tempListings = [];
        tempListings.push(<div key="openListings"><CheckBox key="1" label="Open Listings" type="openListings" onChange={this.props.handleListingToggle} checked={this.props.checked.includes("openListings")} /></div>);
        tempListings.push(<div key="transactionHistory"><CheckBox key="2" label="Transaction History" type="transactionHistory" onChange={this.props.handleListingToggle} checked={this.props.checked.includes("transactionHistory")} /></div>);
        tempListings.push(<div key="currentTransactions"><CheckBox key="3" label="Current Transactions" type="currentTransactions" onChange={this.props.handleListingToggle} checked={this.props.checked.includes("currentTransactions")} /></div>);

        this.setState({
            listingType: tempListings
        });
    }

    render() {
        return (
            <div className="queryFiltersOuter">
                <div className="queryFilters">
                    <div className="queryFiltersCategories">
                        Categories
                        <div className="individualCategoryFilters">
                            {this.state.categories}
                        </div>
                    </div>
                    <div className="queryFiltersListings">
                        Listing Type
                        <div className="individualListingFilters">
                            {this.state.listingType}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
