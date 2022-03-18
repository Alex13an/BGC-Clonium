import React, { FC } from 'react'
import './formInput.scss'

export type FormInputProps = {
	label: string;
	errorText: string;
	placeholder: string;
	value: string;
	changeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
	blurHandler?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & (
	| {
			withButton?: true; 
			clickHandler?: () => void;
			buttonLabel?: string;
		}
	| {
			withButton?: never; 
			clickHandler?: never;
			buttonLabel?:never;
		}
)

const FormInput: FC<FormInputProps> = ({
	withButton,
	errorText,
	label,
	placeholder,
	value,
	changeHandler,
	buttonLabel,
	blurHandler,
	clickHandler,
}) => {
	return (
		<div className="main-input">
			<h3 className="main-input__label">
				{label}
				{errorText && <span className='main-input__error'>: {errorText}</span>}
			</h3>
			<input 
				type="text" 
				placeholder={placeholder} 
				value={value}
				onChange={e => changeHandler(e)}
				onBlur={blurHandler ? e => blurHandler(e) : undefined}
				className={withButton ? 'main-input__input main-input__input_dir' : 'main-input__input'}
			/>
			{withButton && 
				<button disabled={errorText ? true : false}
					className='main-input__button'
					onClick={clickHandler ? clickHandler : undefined}
				>
					{buttonLabel}
				</button>
			}
		</div>
	)
}

export default FormInput