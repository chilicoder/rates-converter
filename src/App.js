import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import RatesService from "./services/rates";
import Link from 'valuelink'
import { Select } from 'valuelink/lib/tags'
import PopularRates from "./components/PopularRates";
import FormInput from "./components/FormInput";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            fromCurr: 'EUR',
            toCurr: 'EUR',
            isEmpty: props.ratesService.isEmpty
        }
    }

    componentDidMount() {
        return this.props.ratesService.refreshRates().then((service) => {
            this.setState({ isEmpty: this.props.ratesService.isEmpty })
        })
    }

    changeRate(event) {
        const [fromCurr, toCurr] = event.target.innerHTML.split('/');
        if (fromCurr && toCurr) {
            this.setState({ fromCurr, toCurr })
        }
    }

    clickEraseHistory(e) {
        const ratesService = this.props.ratesService;
        ratesService.resetState();
        this.setState({ isEmpty: true });
        this.componentDidMount();
    }
    clickReloadRates(e) {
        this.componentDidMount();
    }

    render() {
        const isEmpty = this.state.isEmpty;
        const { fromCurr, toCurr } = Link.all(this, 'fromCurr', 'toCurr');
        const rateKey = `${fromCurr.value}/${toCurr.value}`
        const amount = Link.state(this, 'amount')
            .check(a => a, 'Please, specify amount')
            .check(a => Number(a) > 0, 'Amount must be a positive number');
        const notCalculatable = isEmpty || amount.error;
        const rate = notCalculatable
            ? <span>&#x1F937;</span>
            : (this.props.ratesService.getRate(rateKey)).toPrecision(4);
        const currenciesOptions = this.props.ratesService.getCurrencies()
            .map((curr, i) => <option key={i} value={curr}>{curr}</option>)

        const convertedAmount = notCalculatable
            ? <h1>&#x1F937;</h1>
            : <h1 className={notCalculatable ? 'line-through' : ''}>
                {Number(amount.value * Number(rate)).toFixed(2)}
            </h1>;
        const ratesHistory = this.props.ratesService.getCallHistory();
        return (
            <div className="App">
                <h3>Convert</h3>
                <div>
                    <FormInput valueLink={amount}/>
                    amount of
                </div>
                <div>
                    <Select valueLink={fromCurr}>
                        {currenciesOptions}
                    </Select>
                    to
                    <Select valueLink={toCurr}>
                        {currenciesOptions}
                    </Select>
                    <p>with the rate {rate} will be</p>
                    {convertedAmount}
                </div>
                <PopularRates ratesHistory={ratesHistory} clickRate={(e) => this.changeRate(e)}/>
                <div className="manage-buttons">
                    <button onClick={(e) => this.clickEraseHistory(e)}>Erase history</button>
                    <button onClick={(e) => this.clickReloadRates(e)}>Reload rates</button>
                </div>
            </div>
        );
    }
}

App.propTypes = {
    ratesService: PropTypes.instanceOf(RatesService)
}

export default App;
