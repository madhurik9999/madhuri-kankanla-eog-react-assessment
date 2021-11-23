/* eslint-disable linebreak-style */
import * as React from 'react';
import {
  useQuery,
  gql,
} from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import Select from 'react-select';

const useStyles = makeStyles({
  wrapper: {
    height: '100vh',
  },
});

const query = gql`
query ($input: [MeasurementQuery]) {
  getMultipleMeasurements(input: $input) {
    metric
    measurements {
      at
      value
      metric
      unit
      __typename
    }
    __typename
  }
  __typename
}
`;
/*
{"query":"query ($input: [MeasurementQuery])
{\n  getMultipleMeasurements(input: $input) {\n    metric\n
  measurements {\n      at\n      value\n      metric\n      unit\n
   __typename\n    }\n    __typename\n  }\n  __typename\n}\n",
   "variables":{"input":[{"metricName":"oilTemp","after":1637671322946}]}}

{"variables":{"latLong":{"latitude":29.7604,"longitude":-95.3698}},
"query":"query ($latLong: WeatherQuery!)
{\n  getWeatherForLocation(latLong: $latLong)
   {\n    description\n    locationName\n    temperatureinCelsius\n
      __typename\n  }\n}"} */

type WeatherDataResponse = {
  getMultipleMeasurements: any;
};

const Metrics: React.FC = () => {
  const [state, setState] = React.useState({
    metricNames: [],
  });
  const classes = useStyles();
  const options = [
    { label: 'OilTemp', value: 'OilTemp' },
    { label: 'waterTemp', value: 'waterTemp' },
    { label: 'flareTemp', value: 'flareTemp' },
    { label: 'injValueOpen', value: 'injValueOpen' },
    { label: 'tubingPressure', value: 'tubingPressure' },
    { label: 'casingPressure', value: 'casingPressure' },
  ];

  // if (state.metricNames.length > 0) {
  const { loading, error, data } = useQuery<WeatherDataResponse>(query, {
    variables: {
      input: state.metricNames,
    },
  });
  console.log(loading, error, data);
  // }

  return (
    <div className={classes.wrapper}><Select
      options={options}
      isMulti
      onChange={(item: any) => {
        const metricNames = item.map((option: any) => ({
          metricName: option.value,
          after: 1637671322946,
        }));
        setState({ metricNames });
      }}
    />
    </div>
  );
};

export default Metrics;
