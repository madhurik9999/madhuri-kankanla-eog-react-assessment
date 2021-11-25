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
  const highchartRef = React.useRef(null);
  /**
   Used intervalCheck here because onchange of multislect dropdown
   I'm trying to poll data every 3seconds in the meanwhile if any
   opeations are happening it's throughing error
   */

  let intervalCheck: any = null;
  const classes = useStyles();
  /**
  Created Multi Select Dropdown using react Select where user can select metrics
   */
  const options = [
    { label: 'OilTemp', value: 'OilTemp' },
    { label: 'waterTemp', value: 'waterTemp' },
    { label: 'flareTemp', value: 'flareTemp' },
    { label: 'injValueOpen', value: 'injValueOpen' },
    { label: 'tubingPressure', value: 'tubingPressure' },
    { label: 'casingPressure', value: 'casingPressure' },
  ];

  /**
   *Fecthing the data from Histrocial timestamp of last 30minutes
   */
  const getCurrentTimeStamp = () => {
    const timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() - 30); // timestamp
    return new Date(timeNow).getTime(); // Date object
  };
  /**
   *GrapQl query to fetch the last 30min of histrocial data
   */
  const { data } = useQuery<MetricMeasurementDataResponse>(queryForMultipleMeasurements, {
    variables: {
      input: state.metricNames,
    },
  });

  const measurements = data?.getMultipleMeasurements;

  /**
   *Integrating X & Y Coordinates To Graph
X Axis :- Time Interval of last 30minutes
Y Axis:- Based on the Metric value dynamically rendering the data from API
   */
  const graphData = measurements?.length > 0
    && measurements.map((item: any) => ({
      name: item.metric,
      data: item.measurements.map((val: any) => [val.at, val.value]),
    }));

  /**
   *For Visualization of data I have used Stock Highcharts as a charting engine
   */
  const optionsHighChart = {
    chart: {
      events: {
        load: () => {
          // set up the updating of the chart each second
          intervalCheck = setInterval(() => {
            const seriesRef: any = highchartRef?.current;
            if (seriesRef) {
              const input: any = state.metricNames.map((option: any) => {
                option.after = new Date(Date.now() - 10000).getTime();
                return option;
              });
              fetch('https://react.eogresources.com/graphql', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  variables: { input },
                  query:
                    'query ($input: [MeasurementQuery]) {\n  getMultipleMeasurements(input: $input) {\n    metric\n    measurements {\n      at\n      value\n      metric\n      unit\n      __typename\n    }\n    __typename\n  }\n  __typename\n}',
                }),
              })
                .then((response) => response.json())
                .then((pollingData) => {
                  const pollingMeasurements = pollingData?.data?.getMultipleMeasurements;
                  pollingMeasurements.forEach((item: any, index: any) => {
                    item.measurements.forEach((val: any) => {
                      seriesRef.chart.series?.[index]?.addPoint([val.at, val.value], true, true);
                    });
                  });
                });
            }
          }, 3000);
        },
      },
    },
    time: {
      useUTC: false,
    },
    title: false,
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
              after: getCurrentTimeStamp(),
            }));
            setState({ metricNames });
            clearInterval(intervalCheck);
          }}
        />
      </div>
      {graphData.length > 0 && (
        <div className={classes.chartWrapper}>
          <HighchartsReact highcharts={Highcharts} options={optionsHighChart} ref={highchartRef} />
        </div>
      )}
    </div>
  );
};

export default Metrics;
