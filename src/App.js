import React, {Component} from 'react';
import { Switch, Route } from "react-router-dom";
import './App.css';
import firebase from './components/Firebase';
import Home from './pages/Home/Home';
import Landing from './pages/Landing/Landing'
import About from './pages/About/About';
import Features from './pages/Features/Features';
import SignIn from './pages/SignIn/SignIn';
import SignUp from './pages/SignUp/SignUp';
import CreateListing from './pages/CreateListing/CreateListing';
import ProductView from './pages/ProductView/ProductView';
import Search from './pages/Search/Search';
import GroupView from './pages/GroupView/GroupView';
import BuyList from './pages/BuyList/BuyList';
import BuyRequests from './pages/BuyRequests/BuyRequests';
import GroupMembers from './pages/GroupMembers/GroupMembers';
import MemberProfile from './pages/MemberProfile/MemberProfile';
import GroupProfile from './pages/GroupProfile/GroupProfile';

// fix manifest.json before publishing

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            hidden: "hidden"
        }

        this.show = this.show.bind(this);
    }

    show() {
        this.setState({
            hidden: ""
        });
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                this.setState({user});
            }
            else {
                this.setState({user: false});
            }
        })
        setTimeout(() => this.show(), 1000);
    }

    render() {
        if(this.state.user === null) {
            return(<div></div>);
        }

        return (
            <div className={this.state.hidden}>
                {this.state.user ?
                    <Switch>
                        <Route path="/createlisting" render={() => <CreateListing user={this.state.user} />}></Route>
                        <Route path="/memberprofile" render={() => <MemberProfile user={this.state.user} />}></Route>
                        <Route path="/groupprofile" render={() => <GroupProfile user={this.state.user} />}></Route>
                        <Route path="/product" render={() => <ProductView user={this.state.user} />}></Route>
                        <Route path="/search" render={() => <Search user={this.state.user} />}></Route>
                        <Route path="/group/search" render={() => <GroupView user={this.state.user} />}></Route>
                        <Route path="/list" render={() => <BuyList user={this.state.user} />}></Route>
                        <Route path="/requests" render={() => <BuyRequests user={this.state.user} />}></Route>
                        <Route path="/members" render={() => <GroupMembers user={this.state.user} />}></Route>
                        <Route path="/" render={() => <Home user={this.state.user} />}></Route>
                    </Switch>
                    :
                    <Switch>
                        <Route path="/about" component={About}></Route>
                        <Route path="/features" component={Features}></Route>
                        <Route path="/signin" component={SignIn}></Route>
                        <Route path="/getstarted" component={SignUp}></Route>
                        <Route path="/" component={Landing}></Route>
                    </Switch>
                }
            </div>
        );
    }
}
