class Rates {
    constructor() {
        this.initiateState();
        this.loadStateFromLocalStorage()
    }

    resetState() {
        this.initiateState();
        this.saveStateToLocalStorage();
    }

    initiateState() {
        this._callHistory = {};
        this._ratesStore = {};
        this._currenciesStore = {};
        this.base = 'EUR';
        this.isEmpty = true;
    }

    saveStateToLocalStorage() {
        localStorage.clear();
        const storeObject = {
            callHistory: this._callHistory,
            ratesStore: this._ratesStore,
            currenciesStore: this._currenciesStore,
            base: this.base
        }
        localStorage.setItem('ratesService', JSON.stringify(storeObject));
    }

    loadStateFromLocalStorage() {
        const { callHistory, ratesStore, currenciesStore, base } = JSON.parse(localStorage.getItem('ratesService')) || {};
        if (callHistory) {
            this._callHistory = callHistory
        }
        if (ratesStore) {
            this._ratesStore = ratesStore
        }
        if (currenciesStore) {
            this._currenciesStore = currenciesStore
        }
        if (base) {
            this.base = base;
        }
    }

    async refreshRates() {
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        console.log('calling');
        await wait(2000);
        this._processResult({
            "time": "2018-11-13",
            "base": "EUR",
            "rates": [{ "currency": "USD", "rate": "1.1261" }, {
                "currency": "JPY",
                "rate": "128.32"
            }, { "currency": "BGN", "rate": "1.9558" }, { "currency": "CZK", "rate": "25.939" }, {
                "currency": "DKK",
                "rate": "7.4613"
            }, { "currency": "GBP", "rate": "0.86945" }, { "currency": "HUF", "rate": "322.89" }, {
                "currency": "PLN",
                "rate": "4.2992"
            }, { "currency": "RON", "rate": "4.6612" }, { "currency": "SEK", "rate": "10.2284" }, {
                "currency": "CHF",
                "rate": "1.1368"
            }, { "currency": "ISK", "rate": "139.40" }, { "currency": "NOK", "rate": "9.5563" }, {
                "currency": "HRK",
                "rate": "7.4238"
            }, { "currency": "RUB", "rate": "76.1990" }, { "currency": "TRY", "rate": "6.1857" }, {
                "currency": "AUD",
                "rate": "1.5628"
            }, { "currency": "BRL", "rate": "4.2479" }, { "currency": "CAD", "rate": "1.4888" }, {
                "currency": "CNY",
                "rate": "7.8354"
            }, { "currency": "HKD", "rate": "8.8161" }, { "currency": "IDR", "rate": "16692.18" }, {
                "currency": "ILS",
                "rate": "4.1593"
            }, { "currency": "INR", "rate": "81.8390" }, { "currency": "KRW", "rate": "1277.21" }, {
                "currency": "MXN",
                "rate": "23.0152"
            }, { "currency": "MYR", "rate": "4.7229" }, { "currency": "NZD", "rate": "1.6684" }, {
                "currency": "PHP",
                "rate": "59.885"
            }, { "currency": "SGD", "rate": "1.5559" }, { "currency": "THB", "rate": "37.178" }, {
                "currency": "ZAR",
                "rate": "16.2504"
            }]
        })
        if (this.getCurrencies().length > 0) {
            this.isEmpty = false;
        }
        return this;
    }

    _processResult(result) {
        const time = result.time;
        const base = result.base;
        const rS = this._ratesStore;
        const curs = this._currenciesStore;
        this.base = base;
        curs[base] = true;
        result.rates.forEach(rate => {
            const forwardRateKey = `${base}/${rate.currency}`;
            const backwardRateKey = `${rate.currency}/${base}`;
            curs[rate.currency] = true;
            rS[forwardRateKey] = Number(rate.rate);
            rS[backwardRateKey] = 1 / rate.rate;
        });
        this.saveStateToLocalStorage()
    }

    _saveToHistory(RateKey, rate) {
        if (!this._callHistory[RateKey]) {
            this._callHistory[RateKey] = 0
        }
        this._callHistory[RateKey]++;
        this.saveStateToLocalStorage()
    }

    getCallHistory() {
        return Object
            .keys(this._callHistory)
            .map(key => ({
                rateKey: key,
                amount: this._callHistory[key]
            }))
            .sort((a, b) => a.amount < b.amount ? 1 : -1);
    }

    getRate(RateKey) {
        // in case of the same curr we return 1
        const [fromCurr, toCurr] = RateKey.split('/');
        let result = 0;

        // Try straitforward way
        if (fromCurr === toCurr) {
            result = 1;
        } else {
            result = this._ratesStore[RateKey];
        }

        // if no key found try cross-rate
        const base = this.base;
        if (!result) {
            result = this._ratesStore[`${fromCurr}/${base}`] / this._ratesStore[`${base}/${toCurr}`];
        }

        // if no key found throw
        if (!result) {
            throw new Error(`Rate key ${RateKey} wasn't found`)
        }

        this._saveToHistory(RateKey);
        return result;
    }

    getCurrencies() {
        return Object.keys(this._currenciesStore);
    }
}

export default Rates