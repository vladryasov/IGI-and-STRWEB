import React from "react";
import { API_URL } from "../config";

// required by lab: class component + lifecycle + XMLHttpRequest
export class OrderTracker extends React.Component {
  state = {
    status: "",
    courierLocation: null,
    createdAtView: null,
    updatedAtView: null,
    error: "",
    isTracking: false
  };

  intervalId = null;

  componentDidMount() {
    if (this.props.autoStart) {
      this.startTracking();
    }
  }

  componentWillUnmount() {
    this.stopTracking();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.orderId !== this.props.orderId && this.state.isTracking) {
      // restart tracking for new order id
      this.stopTracking();
      this.startTracking();
    }
  }

  onOrderTrack = data => {
    // required by lab: onOrderTrack event handler
    this.props.onOrderTrack?.(data);
  };

  startTracking = () => {
    const { orderId, token } = this.props;
    if (!orderId || !token) return;
    this.setState({ isTracking: true, error: "" });

    const poll = () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${API_URL}/api/orders/${orderId}/track`, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("X-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText || "{}");
          this.setState({
            status: data.status,
            courierLocation: data.courierLocation,
            createdAtView: data.createdAtView,
            updatedAtView: data.updatedAtView,
            error: ""
          });
          this.onOrderTrack({ ...data, orderId: this.props.orderId });
        } else {
          this.setState({ error: `XHR error: ${xhr.status}` });
        }
      };
      xhr.send();
    };

    poll();
    this.intervalId = window.setInterval(poll, 2000);
  };

  stopTracking = () => {
    if (this.intervalId) window.clearInterval(this.intervalId);
    this.intervalId = null;
    this.setState({ isTracking: false });
  };

  render() {
    const { orderId } = this.props;
    const { status, courierLocation, error, isTracking, updatedAtView } = this.state;

    return (
      <div className="card">
        <div className="row row--space">
          <h3 className="h3">OrderTracker (XHR)</h3>
          <div className="row">
            <button className="btn btn--ghost" onClick={this.startTracking} disabled={!orderId}>
              Старт
            </button>
            <button className="btn btn--ghost" onClick={this.stopTracking}>
              Стоп
            </button>
          </div>
        </div>

        <div className="muted">orderId: <span className="mono">{orderId || "—"}</span></div>
        <div className="status">
          Статус: <b>{status || "—"}</b> {isTracking ? <span className="tag">tracking</span> : null}
        </div>
        {courierLocation ? (
          <div className="muted">
            Курьер: lat {courierLocation.lat?.toFixed?.(5)} / lng {courierLocation.lng?.toFixed?.(5)}
          </div>
        ) : null}
        {updatedAtView ? <div className="muted">Обновлено: {updatedAtView.local} (UTC: {updatedAtView.utc})</div> : null}
        {error ? <div className="error">{error}</div> : null}
      </div>
    );
  }
}



