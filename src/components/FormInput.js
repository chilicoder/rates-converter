import { Input } from "valuelink/lib/tags";
import React, { Component } from "react";
import { DebounceInput } from 'react-debounce-input';

class FormInput extends Component {
    render() {
        const { valueLink, ...props } = this.props;
        const error = valueLink.error
            ? <p className="error-placeholder">
                <span>{valueLink.error}</span>
            </p>
            : ''
        return (
            <span className='form-group'>
				<label> {this.props.label} </label>
                {error}
                <DebounceInput
                    value={valueLink.value}
                    minLength={1}
                    debounceTimeout={300}
                    onChange={e => valueLink.set(e.target.value)}/>
			</span>
        )
    }
}

export default FormInput;