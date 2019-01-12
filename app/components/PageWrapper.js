import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import GlobalAlert from './GlobalAlert';
import * as NotifActions from '../actions/notifs';

// Originally this logic was supposed to just exist at the App level. For some reason though
// that broke navigation, so I decided to put the logic after the 
class PageWrapper extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    
    // From redux
    store: PropTypes.object.isRequired,
    appUpgradeDownloaded: PropTypes.func.isRequired,
  };

  componentDidMount() {
    ipcRenderer.on('update-downloaded', () => {
      // When main process (main.dev.js) tells us an update has been downloaded, trigger
      // a global notif to be shown
      this.props.appUpgradeDownloaded();
    });

    this.props.appUpgradeDownloaded();
  }

  render() {
    let spacerEl = null;

    const notifHeightPx = _.get(this.props.store, ['activeNotif', 'heightPx']);
    if (notifHeightPx) {
      const customStyling = {
        height: `${notifHeightPx}px`,
      };

      // User spacer element to give space for notif. I tried using padding on the top-level div
      // and that sorta worked but it didn't seem to respond well when I closed the notif while
      // on the file loader page, there would still be space above the file selector
      spacerEl = <div style={customStyling} />;
    }

    return (
      <React.Fragment>
        <GlobalAlert />
        {spacerEl}
        <div>{this.props.children}</div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    store: state.notifs,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(NotifActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageWrapper);
