import React from 'react';

const Track = ({value}) => {
	const style = {
		left: 0,
		width: value + '%'
	};
	return <div className={'ui-slider__track'} style={style} />;
};

export default Track;
