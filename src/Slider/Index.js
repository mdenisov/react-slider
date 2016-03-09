import React from 'react';
import classNames  from 'classnames';

import Track from './Track';
import Handle from './Handle';


function pauseEvent(e) {
	e.stopPropagation();
	e.preventDefault();
	e.cancelBubble = true;
	e.returnValue = false;
	return false;
}

export default class Slider extends React.Component {

	constructor(props) {
		super(props);

		const {min, max} = props;
		const initialValue = min;
		const defaultValue = ('defaultValue' in props ? props.defaultValue : initialValue);
		const value = this._trimAlignValue(props.value !== undefined ? props.value : defaultValue);

		this.onMouseMove = this.onMouseMove.bind(this);
		this.onEnd = this.onEnd.bind(this);

		this.state = {
			limit: 0,
			grab: 0,
			value: value
		}
	}

	componentDidMount() {

	}

	componentWillReceiveProps(nextProps) {
		if (!('value' in nextProps || 'min' in nextProps || 'max' in nextProps)) return;

		this.setState({
			value: nextProps.value
		});
	}

	onMouseDown(e) {
		pauseEvent(e);

		const position = this._getMousePosition(e);
		this._addDocumentEvents();

		const value = this._getValueByPosition(position);
		this.startValue = value;
		this.startPosition = position;
	}

	onMouseMove(e) {
		const position = this._getMousePosition(e);
		this.onMove(e, position);
	}

	onMove(e, position) {
		pauseEvent(e);

		const props = this.props;
		const state = this.state;

		const diffPosition = position - this.startPosition;
		const diffValue = diffPosition / this._getSliderLength() * (props.max - props.min);

		const value = this._trimAlignValue(this.startValue + diffValue);
		const oldValue = state[state.handle];

		if (value === oldValue) return;

		this.setState({
			value: value
		});

		this.onChange();
	}

	onEnd(e) {
		this._removeDocumentEvents();
	}

	onChange() {
		this.props.onChange(this._getValue());
	}

	render() {
		const {value} = this.state;
		const {className, disabled, children} = this.props;

		const sliderClassName = classNames({
			['ui-slider']: true,
			['ui-slider--disabled']: disabled,
			[className]: !!className,
		});

		return (
			<div ref="slider" className={sliderClassName}
				onMouseDown={this.onMouseDown.bind(this)}>
				<Handle value={value} />
				<Track className={'ui-slider__track'} value={value} />
			</div>
		);
	}

	_addDocumentEvents() {
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onEnd);
	}

	_removeDocumentEvents() {
		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onEnd);
	}

	_getValue() {
		const {value} = this.state;
		return value;
	}

	_calcValue(offset) {
		const {min, max} = this.props;
		const ratio = offset / this._getSliderLength();
		return ratio * (max - min) + min;
	}

	_getPrecision() {
		const props = this.props;
		const stepString = props.step.toString();
		let precision = 0;
		if (stepString.indexOf('.') >= 0) {
			precision = stepString.length - stepString.indexOf('.') - 1;
		}
		return precision;
	}

	_trimAlignValue(v, nextProps) {
		const {step, min, max} = this.props;

		let val = v;
		if (val <= min) {
			val = min;
		}
		if (val >= max) {
			val = max;
		}

		const points = [];
		if (step !== null) {
			const closestStep = Math.round(val / step) * step;
			points.push(closestStep);
		}

		const diffs = points.map((point) => Math.abs(val - point));
		const closestPoint = points[diffs.indexOf(Math.min.apply(Math, diffs))];

		return (step !== null) ? parseFloat(closestPoint.toFixed(this._getPrecision())) : closestPoint;
	}

	_getValueByPosition(position) {
		const pixelOffset = position - this._getSliderStart();
		const nextValue = this._trimAlignValue(this._calcValue(pixelOffset));
		return nextValue;
	}

	_getSliderLength() {
		const slider = this.refs.slider;
		if (!slider) {
			return 0;
		}

		return slider.clientWidth;
	}

	_getSliderStart() {
		const slider = this.refs.slider;
		const rect = slider.getBoundingClientRect();

		return rect.left;
	}

	_getMousePosition(e) {
		return e.pageX;
	}
}

Slider.propTypes = {
	min: React.PropTypes.number,
	max: React.PropTypes.number,
	step: React.PropTypes.number,
	value: React.PropTypes.number,
	defaultValue: React.PropTypes.number,
	onChange: React.PropTypes.func,
};

Slider.defaultProps = {
	min: 0,
	max: 100,
	step: 1,
	value: 0
};
