import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import RouterWrapper from './RouterWrapper';
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';

ReactDOM.render(<RouterWrapper />, document.getElementById('root'));
registerServiceWorker();
