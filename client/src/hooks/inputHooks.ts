import React, { useEffect, useState } from "react"

export interface inputValidators {
	isEmpty?: boolean;
	minLength?: number;
	maxLength?: number;
}

export const useInput = (initialValue: string, validators: inputValidators) => {
	const [value, setValue] = useState(initialValue)
	const [dirty, setDirty] = useState(false)
	const [errorText, setErrorText] = useState('')

	useEffect(() => {
		if (!dirty) return
		setErrorText('')
		for (const validator in validators) {
			switch (validator) {
				case 'isEmpty':
					!value && setErrorText('Please type some data') 
					break;
				case 'minLength':
					value.length < (validators[validator] || 3) && setErrorText(`Min length is ${validators.minLength || 3} symbols`) 
					break;
				case 'maxLength':
					value.length > (validators[validator] || 30) && setErrorText(`Max length is ${validators.maxLength || 30} symbols`)
					break;
			}
		}

	}, [value, dirty])

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value)
	}

	const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDirty(true)
	}

	const dirtyClick = () => {
		setDirty(true)
	}


	return {
		value,
		onChange,
		onBlur,
		dirty,
		dirtyClick,
		errorText,
	}
}