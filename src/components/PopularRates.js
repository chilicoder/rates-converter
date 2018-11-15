import React, { Component } from 'react';
import PropTypes from 'prop-types';


class PopularRates extends Component {
    render() {
        const rateClick = this.props.clickRate || function() {};
        const popularRateKeysTable = this.props.ratesHistory
            .slice(0, 5)
            .map((call, i) => {
                return <tr key={i}>
                    <td onClick={rateClick} className="App-link">{call.rateKey}</td>
                    <td>{call.amount}</td>
                </tr>;
            });
        const isEmpty = popularRateKeysTable.length === 0;
        const header = isEmpty ? 'There are no rates requests yet' : 'Popular rate requests'
        const table = isEmpty ? '' :
            <table>
                <thead>
                <tr>
                    <th>Pair</th>
                    <th>How frequently requested</th>
                </tr>
                </thead>
                <tbody>
                {popularRateKeysTable}
                </tbody>
            </table>

        return <div className="popular-rates">
            <h3>{header}</h3>
            {table}
        </div>
    }

}

PopularRates.propTypes = {
    ratesHistory: PropTypes.array,
    clickRate: PropTypes.func
}

export default PopularRates