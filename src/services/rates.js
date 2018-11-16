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
        const response = await fetch('https://txf-ecb.glitch.me/rates');
        const json = await response.json();
        this._processResult(json);
        if (this.getCurrencies().length > 0) {
            this.isEmpty = false;
        }
        return this;
    }

    _processResult(result) {
        // const time = result.time;
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