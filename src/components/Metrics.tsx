/* eslint-disable linebreak-style */
import * as React from 'react';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import Select from 'react-select';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const useStyles = makeStyles({
  wrapper: {
    height: '100vh',
    padding: '50px',
    background: 'white',
  },
  selectWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  selectBox: {
    width: '600px',
  },
  chartWrapper: {
    marginTop: '50px',
    width: '100%',
  },
});
const queryForMultipleMeasurements = gql`
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
type MetricMeasurementDataResponse = {
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

  const { data } = useQuery<MetricMeasurementDataResponse>(queryForMultipleMeasurements, {
    variables: {
      input: state.metricNames,
    },
  });

  const measurements = data?.getMultipleMeasurements;
  const graphData = measurements?.length > 0
    && measurements.map((item: any) => ({
      name: item.metric,
      data: item.measurements.map((val: any) => [val.at, val.value]),
    }));
  const optionsHighChart = {
    time: {
      useUTC: false,
    },
    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%H:%M}',
      },
    },
    exporting: {
      enabled: false,
    },
    series: graphData,
  };
  let timeNow = new Date();
  timeNow.setMinutes(timeNow.getMinutes() - 30); // timestamp
  timeNow = new Date(timeNow); // Date object
  return (
    <div className={classes.wrapper}>
      <div className={classes.selectWrapper}>
        <Select
          options={options}
          isMulti
          className={classes.selectBox}
          onChange={(item: any) => {
            const metricNames = item.map((option: any) => ({
              metricName: option.value,
              after: timeNow.getTime(),
            }));
            setState({ metricNames });
          }}
        />
      </div>
      {graphData.length > 0 && (
        <div className={classes.chartWrapper}>
          <HighchartsReact highcharts={Highcharts} options={optionsHighChart} />
        </div>
      )}
    </div>
  );
};

export default Metrics;
