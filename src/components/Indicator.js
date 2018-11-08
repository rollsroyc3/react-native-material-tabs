// @flow

import React from 'react';
import { Animated, ViewStyle } from 'react-native';
import styled from 'styled-components';

type BarProps = {
  color: string,
  height: number,
  tabWidth: number,
};

const Bar = styled(Animated.View)`
  height: ${(props: BarProps) => props.height};
  width: ${(props: BarProps) => props.tabWidth};
  position: absolute;
  bottom: 0;
  background-color: ${(props: BarProps) => props.color};
`;

type IndicatorProps = {
  color: string,
  height: number,
  tabWidth: number,
  value?: Animated.Value,
  style?: ViewStyle,
};

const Indicator = (props: IndicatorProps) => (
  <Bar
    color={props.color}
    style={{ height: props.height, transform: [{ translateX: props.value }] }}
    tabWidth={props.tabWidth}
  />
);

export default Indicator;
