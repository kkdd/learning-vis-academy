import React, { useEffect, useState } from 'react';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl';
import { renderLayers } from './deckgl-layers';
import { processData } from './processdata.js';

import { LayerControls, MapStylePicker, HEXAGON_CONTROLS } from './controls';
import { tooltipStyle } from './style';
import taxiData from './taxi.js';

import Charts from './charts';

const MAPBOX_TOKEN = '';

export default () => {
	const [ mapboxStyle, setMapStyle ] = useState('mapbox://styles/mapbox/light-v9');

	const [ data ] = useState(processData(taxiData));

	console.log(data);

	const [ layerSettings, setLayerSetting ] = useState(
		Object.keys(HEXAGON_CONTROLS).reduce(
			(accu, key) => ({
				...accu,
				[key]: HEXAGON_CONTROLS[key].value
			}),
			{}
		)
	);

	const [ viewport, setViewport ] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
		longitude: -74,
		latitude: 40.7,
		zoom: 11,
		maxZoom: 16
	});

	const [ hover, setHover ] = useState({
		x: 0,
		y: 0,
		hoveredObject: null,
		label: null
	});

	//resize
	useEffect(() => {
		const handleResize = () => {
			setViewport((v) => {
				return {
					...v,
					width: window.innerWidth,
					height: window.innerHeight
				};
			});
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const onHover = ({ x, y, object }) => {
		const label = object ? (object.pickup ? 'Pickup' : 'Dropoff') : null;
		setHover({ x, y, hoveredObject: object, label });
	};

	return (
		<div>
			{hover.hoveredObject && (
				<div
					style={{
						...tooltipStyle,
						transform: `translate(${hover.x}px, ${hover.y}px)`
					}}
				>
					<div>{hover.label}}</div>
				</div>
			)}
			<MapStylePicker currentStyle={mapboxStyle} onStyleChange={setMapStyle} />
			<LayerControls settings={layerSettings} propTypes={HEXAGON_CONTROLS} onChange={setLayerSetting} />
			<MapGL
				{...viewport}
				mapStyle={mapboxStyle}
				mapboxApiAccessToken={MAPBOX_TOKEN}
				onViewportChange={(v) => setViewport(v)}
			>
				<DeckGL
					layers={renderLayers({
						data: data.points,
						settings: layerSettings,
						onHover: onHover
					})}
					viewState={viewport}
					onViewportChange={setViewport}
				/>
				<Charts {...data} />
			</MapGL>
		</div>
	);
};
