/* eslint-disable linebreak-style */
import React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Wrapper from './components/Wrapper';
import Metrics from './components/Metrics';
import Header from './components/Header';

const client = new ApolloClient({
  uri: 'https://react.eogresources.com/graphql',
  cache: new InMemoryCache(),
});
const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(39,49,66)',
    },
    secondary: {
      main: 'rgb(197,208,222)',
    },
    background: {
      default: 'rgb(226,231,238)',
    },
  },
});

const App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Wrapper>
      <Header />
      {/* <NowWhat /> */}
      <ApolloProvider client={client}>
        <Metrics />
      </ApolloProvider>{' '}
      <ToastContainer />
    </Wrapper>
  </MuiThemeProvider>
);

export default App;
