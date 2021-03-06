// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { Animated, ScrollView, View, Text } from 'react-native';
import type { StyleObj } from '../lib/definitions';
import { Bar, TabTrack } from '../lib/styles';
import values from '../lib/values';
import Tab from './Tab';
import Indicator from './Indicator';
import type { ContentType } from './Tab/Tab';

type Props = {
  allowFontScaling: boolean,
  selectedIndex: number,
  barColor: string,
  barHeight: number,
  activeTextColor: string,
  indicatorColor: string,
  indicatorHeight: number,
  inactiveTextColor: string,
  scrollable: boolean,
  textStyle: StyleObj,
  activeTextStyle: StyleObj,
  shadow: boolean,
  items: ContentType[],
  uppercase: boolean,
  onChange: (index: number) => void,
  keyboardShouldPersistTaps: string,
};

type State = {
  tabWidth: number,
  barWidth: number,
  indicatorPosition: Animated.Value,
};

const getKeyForTab = (item: ContentType) =>
  typeof item == 'string' ? item : item.key;

export default class MaterialTabs extends React.Component<Props, State> {
  static propTypes = {
    allowFontScaling: PropTypes.bool,
    selectedIndex: PropTypes.number,
    barColor: PropTypes.string,
    barHeight: PropTypes.number,
    activeTextColor: PropTypes.string,
    indicatorColor: PropTypes.string,
    indicatorHeight: PropTypes.number,
    inactiveTextColor: PropTypes.string,
    scrollable: PropTypes.bool,
    textStyle: Text.propTypes.style,
    activeTextStyle: Text.propTypes.style,
    shadow: PropTypes.bool,
    items: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    ).isRequired,
    uppercase: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    keyboardShouldPersistTaps: PropTypes.string,
  };

  static defaultProps = {
    allowFontScaling: true,
    selectedIndex: 0,
    barColor: '#13897b',
    barHeight: values.barHeight,
    activeTextColor: '#fff',
    indicatorColor: '#fff',
    indicatorHeight: 4,
    inactiveTextColor: 'rgba(255, 255, 255, 0.7)',
    scrollable: false,
    textStyle: null,
    uppercase: true,
    activeTextStyle: {},
    shadow: false,
    keyboardShouldPersistTaps: 'never',
  };

  state = {
    tabWidth: 0,
    barWidth: 0,
    indicatorPosition: new Animated.Value(0),
  };

  shouldComponentUpdate(nextProps: Props) {
    // Prevent scrolling out of bounds
    return (
      nextProps.selectedIndex < nextProps.items.length &&
      nextProps.selectedIndex >= 0
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.items.length !== prevProps.items.length) {
      this.bar.measure((_, b, width) => {
        this.getTabWidth(width);
      });
    }

    this.selectTab();
  }

  scrollView: ScrollView;
  bar: View;

  getAnimateValues() {
    const idx = this.props.selectedIndex;
    const scrollValue = !this.props.scrollable
      ? this.state.tabWidth
      : this.state.barWidth * 0.4;

    // All props for fixed tabs are the same
    if (!this.props.scrollable) {
      return {
        indicatorPosition: idx === 0 ? 0 : idx * scrollValue,
        scrollPosition: 0,
      };
    }

    switch (idx) {
      case 0: // First tab
        return {
          indicatorPosition: 0,
          scrollPosition: 0,
        };
      case 1: // Second tab
        return {
          indicatorPosition: this.state.barWidth * 0.5 - scrollValue / 4,
          scrollPosition: scrollValue * 0.25,
        };
      case this.props.items.length - 1: // Last tab
        return {
          indicatorPosition:
            scrollValue * (idx - 1) +
            (this.state.barWidth * 0.5 - scrollValue / 4),
          scrollPosition: scrollValue * (idx - 2) + scrollValue * 0.5,
        };
      default:
        // Any tabs between second and last
        return {
          indicatorPosition:
            scrollValue * (idx - 1) +
            (this.state.barWidth * 0.5 - scrollValue / 4),
          scrollPosition: scrollValue * 0.25 + scrollValue * (idx - 1),
        };
    }
  }

  getTabWidth(width: number) {
    if (!this.props.scrollable) {
      this.setState({ tabWidth: width / this.props.items.length });
    }
    this.setState({
      barWidth: width,
    });
  }

  selectTab() {
    Animated.spring(this.state.indicatorPosition, {
      toValue: this.getAnimateValues().indicatorPosition,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();

    this.scrollView.scrollTo({
      x: this.getAnimateValues().scrollPosition,
    });
  }

  renderContent() {
    let barStyle = {
      backgroundColor: this.props.barColor,
      height: this.props.barHeight,
    };

    if (this.props.shadow) {
      barStyle = Object.assign({}, barStyle, {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 4,
      });
    }

    return (
      <View
        ref={ref => (this.bar = ref)}
        style={barStyle}
        zIndex={1000}
        onLayout={event => this.getTabWidth(event.nativeEvent.layout.width)}
      >
        <ScrollView
          horizontal
          ref={ref => (this.scrollView = ref)}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
          scrollEnabled={this.props.scrollable}
        >
          <TabTrack barHeight={this.props.barHeight}>
            {this.props.items.map((item, idx) => (
              <Tab
                allowFontScaling={this.props.allowFontScaling}
                content={item}
                key={getKeyForTab(item)}
                stretch={!this.props.scrollable}
                onPress={() => this.props.onChange(idx)}
                active={idx === this.props.selectedIndex}
                activeTextColor={this.props.activeTextColor}
                textStyle={this.props.textStyle}
                activeTextStyle={
                  this.props.selectedIndex === idx
                    ? this.props.activeTextStyle
                    : {}
                }
                tabHeight={this.props.barHeight}
                tabWidth={
                  !this.props.scrollable
                    ? this.state.tabWidth
                    : this.state.barWidth * 0.4
                }
                uppercase={this.props.uppercase}
                inActiveTextColor={this.props.inactiveTextColor}
              />
            ))}
          </TabTrack>

          <Indicator
            color={this.props.indicatorColor}
            height={this.props.indicatorHeight}
            value={this.state.indicatorPosition}
            tabWidth={
              !this.props.scrollable
                ? this.state.tabWidth
                : this.state.barWidth * 0.4
            }
          />
        </ScrollView>
      </View>
    );
  }

  render() {
    return this.props.items ? this.renderContent() : null;
  }
}
