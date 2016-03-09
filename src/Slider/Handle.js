import React from 'react';

export default class Handle extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const props = this.props;
		const {value} = props;
		const style = { left: value + '%' };

		return (
			<div className={'ui-slider__handle'} style={style} />
		);
	}
}

Handle.propTypes = {
	value: React.PropTypes.number,
};
