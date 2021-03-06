import React, { PureComponent, createRef } from "react";
import { StyleSheet, Platform } from "react-native";

const changeData = data => `chart.changeData(${JSON.stringify(data)});`;

const source = Platform.select({
  ios: require('./f2chart.html'),
  // android: { html: require('./f2chart.js') }
  android: { uri: "file:///android_asset/f2chart.html" }
});

type Props = {
  initScript: string,
  data?: Array<Object>,
  onChange?: Function,
  WebView?: any
};

export default class Chart extends PureComponent<Props> {
  static defaultProps = {
    onChange: () => {},
    initScript: "",
    data: [],
    WebView: null,
  };

  constructor(props) {
    super(props);
    this.chart = createRef();
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (JSON.stringify(data) !== JSON.stringify(prevProps.data)) {
      this.update(data)
    }
  };

  update = data => {
    this.chart.current.injectJavaScript(changeData(data));
  };

  repaint = script => this.chart.current.injectJavaScript(script);

  onMessage = event => {
    const {
      nativeEvent: { data }
    } = event;

    const { onChange, onLongPress, } = this.props;
    const obj = JSON.parse(data);
    switch(obj.type) {
      case 'longPress':
        onLongPress && onLongPress(obj)
        break
      case 'tooltip':
      default:
        onChange && onChange(obj)
        break
    }
  };

  render() {
    const {
      WebView,
      data,
      onChange,
      initScript,
      ...props
    } = this.props;

    return (
      <WebView
        useWebKit
        javaScriptEnabled
        androidHardwareAccelerationDisabled
        ref={this.chart}
        scrollEnabled={false}
        style={styles.webView}
        injectedJavaScript={initScript}
        source={source}
        originWhitelist={["*"]}
        onMessage={this.onMessage}
        {...props}
      />
    );
  }
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: "transparent"
  }
});
